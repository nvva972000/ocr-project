from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract, cast, Date, case
from typing import List, Dict, Any
from datetime import datetime, timedelta
import models
from database import get_db
from authentication.dependencies import require_token
from authorization.dependencies import check_permission
from collections import defaultdict

router = APIRouter(dependencies=[Depends(require_token), Depends(check_permission)])

def get_all_test_results(db: Session):
    """Get all test results with related data in one query"""
    return db.query(models.TestResult).all()

# Done
@router.get("/dashboard/overview", name="get_dashboard_overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Get overview metrics for dashboard"""
    try:
        # Get total projects, test cases, API documents (separate tables)
        total_projects = db.query(models.Project).count()
        total_test_cases = db.query(models.TestCase).count()
        total_api_documents = db.query(models.ApiDocument).count()
        
        # Get all test results in one query
        test_results = get_all_test_results(db)
        
        # Calculate metrics using Python
        total_tests_run = len(test_results)
        
        # Count pass/fail rates
        passed_tests = sum(1 for tr in test_results if tr.business_check == 'PASSED')
        failed_tests = sum(1 for tr in test_results if tr.business_check == 'FAILED')
        
        pass_rate = round((passed_tests / total_tests_run * 100), 1) if total_tests_run > 0 else 0
        fail_rate = round((failed_tests / total_tests_run * 100), 1) if total_tests_run > 0 else 0
        
        # Calculate Test Execution Per Day (AVG) - Count/Distinct(start_time)
        unique_dates = set()
        for tr in test_results:
            if tr.start_time:
                unique_dates.add(tr.start_time.date())
        
        test_execution_per_day_avg = round(total_tests_run / len(unique_dates), 1) if unique_dates else 0
        
        # Get total bugs logged: count results pushed to JIRA (pushed_jira == 1)
        total_bugs_logged = sum(1 for tr in test_results if getattr(tr, 'pushed_jira', 0) == 1)
        
        # Get test scripts count
        # Aggregate script counts (k6/playwright) in a single query
        script_counts = db.query(
            func.sum(case((models.TestScript.script_type.contains('k6'), 1), else_=0)).label('k6'),
            func.sum(case((models.TestScript.script_type.contains('playwright'), 1), else_=0)).label('playwright'),
        ).one()
        k6_scripts = int(script_counts.k6 or 0)
        playwright_scripts = int(script_counts.playwright or 0)
        
        return {
            "overview": {
                "totalProjects": total_projects,
                "totalTestCases": total_test_cases,
                "totalApiDocuments": total_api_documents,
                "totalTestsRun": total_tests_run,
                "passRate": pass_rate,
                "failRate": fail_rate,
                "testExecutionPerDayAvg": test_execution_per_day_avg
            },
            "bugsLogged": total_bugs_logged,
            "testScripts": {
                "k6": k6_scripts,
                "playwright": playwright_scripts,
                "total": k6_scripts + playwright_scripts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview data: {str(e)}")

# Done
@router.get("/dashboard/top-projects", name="get_top_projects")
def get_top_projects(db: Session = Depends(get_db)):
    """Get top projects by test case count"""
    try:
        # Query test_cases table and group by project_id to get test case count
        project_test_counts = db.query(
            models.Project.name,
            func.count(models.TestCase.id).label('test_cases_count')
        ).join(
            models.TestCase, models.Project.id == models.TestCase.project_id
        ).group_by(
            models.Project.id, models.Project.name
        ).order_by(
            desc(func.count(models.TestCase.id))
        ).limit(6).all()
        
        # Build final result - only test case count, no pass rate calculation
        top_projects = []
        for project_name, test_cases_count in project_test_counts:
            top_projects.append({
                "name": project_name,
                "testCases": test_cases_count
            })
        
        return {"topProjects": top_projects}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top projects: {str(e)}")

@router.get("/dashboard/api-analytics", name="get_api_analytics")
def get_api_analytics(db: Session = Depends(get_db)):
    """Get API analytics including endpoints and failing APIs"""
    try:
        # Aggregate total and failed calls per API (method + path)
        # Note: This attributes a test case's result to all APIs attached to that test case
        # due to lack of step-level result linkage.
        agg_rows = (
            db.query(
                models.Api.method.label("method"),
                models.Api.path.label("path"),
                func.count(models.TestResult.id).label("total_calls"),
                func.sum(case((models.TestResult.business_check == 'FAILED', 1), else_=0)).label("failed_calls"),
            )
            .join(models.TestResult, models.Api.test_case_id == models.TestResult.test_case_id)
            .group_by(models.Api.method, models.Api.path)
            .all()
        )

        # Number of distinct endpoints equals number of grouped rows
        api_endpoints_count = len(agg_rows)

        api_fail_rates = []
        for row in agg_rows:
            total = row.total_calls or 0
            failed = row.failed_calls or 0
            if total > 0:
                fail_rate = round((failed / total) * 100, 1)
                api_fail_rates.append({
                    "name": f"{row.method} {row.path}",
                    "failRate": fail_rate,
                    "totalCalls": total,
                })

        api_fail_rates.sort(key=lambda x: x['failRate'], reverse=True)

        return {
            "apiEndpoints": api_endpoints_count,
            "topFailingApis": api_fail_rates[:5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching API analytics: {str(e)}")

# Done
@router.get("/dashboard/automation-metrics", name="get_automation_metrics")
def get_automation_metrics(db: Session = Depends(get_db)):
    """Get test automation metrics"""
    try:
        # Get total test cases count
        total_test_cases = db.query(models.TestCase).count()
        
        if total_test_cases == 0:
            return {
                "automation": {
                    "readyForAutomation": 0,
                    "totalTestCases": 0,
                    "automated": 0,
                    "notAutomated": 0
                }
            }
        
        # Count distinct test cases that have test results (automated)
        automated_count = db.query(
            func.count(func.distinct(models.TestResult.test_case_id))
        ).scalar()
        
        # Count distinct test cases that have test scripts (ready for automation)
        ready_for_automation_count = db.query(
            func.count(func.distinct(models.TestScript.testcase_id))
        ).scalar()
        
        # Calculate percentages
        automated_percentage = round((automated_count / total_test_cases * 100), 1)
        ready_for_automation_percentage = round((ready_for_automation_count / total_test_cases * 100), 1)
        
        # Calculate not automated as the remainder
        not_automated_percentage = round(100 - automated_percentage - ready_for_automation_percentage, 1)
        
        return {
            "automation": {
                "readyForAutomation": ready_for_automation_percentage,
                "totalTestCases": total_test_cases,
                "automated": automated_percentage,
                "notAutomated": not_automated_percentage
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching automation metrics: {str(e)}")

# Done
@router.get("/dashboard/execution-time", name="get_execution_time")
def get_execution_time(db: Session = Depends(get_db)):
    """Get test execution time statistics using start_time and end_time"""
    try:
        test_results = get_all_test_results(db)
        durations = []  # seconds
        for tr in test_results:
            if getattr(tr, 'start_time', None) and getattr(tr, 'end_time', None):
                try:
                    durations.append((tr.end_time - tr.start_time).total_seconds())
                except Exception:
                    continue

        if not durations:
            return {
                "executionTime": {
                    "fastest": 0,
                    "average": 0,
                    "slowest": 0,
                    "distribution": [
                        {"range": "0-1s", "count": 0},
                        {"range": "1-2s", "count": 0},
                        {"range": "2-5s", "count": 0},
                        {"range": "5s+", "count": 0}
                    ]
                }
            }

        fastest = round(min(durations), 2)
        slowest = round(max(durations), 2)
        average = round(sum(durations) / len(durations), 2)

        # Build simple distribution buckets
        dist = {
            "0-1s": 0,
            "1-2s": 0,
            "2-5s": 0,
            "5s+": 0,
        }
        for d in durations:
            if d < 1:
                dist["0-1s"] += 1
            elif d < 2:
                dist["1-2s"] += 1
            elif d < 5:
                dist["2-5s"] += 1
            else:
                dist["5s+"] += 1

        distribution = [
            {"range": k, "count": v} for k, v in dist.items()
        ]

        return {
            "executionTime": {
                "fastest": fastest,
                "average": average,
                "slowest": slowest,
                "distribution": distribution,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching execution time: {str(e)}")

# Done
@router.get("/dashboard/test-trend", name="get_test_trend")
def get_test_trend(db: Session = Depends(get_db)):
    """Get test execution trend over time"""
    try:
        # Get all test results in one query
        test_results = get_all_test_results(db)
        
        # Process data using Python - group by month
        monthly_stats = defaultdict(lambda: {'passed': 0, 'failed': 0})
        
        for tr in test_results:
            if tr.start_time:
                month_key = tr.start_time.strftime("%Y-%m")
                if tr.business_check == 'PASSED':
                    monthly_stats[month_key]['passed'] += 1
                elif tr.business_check == 'FAILED':
                    monthly_stats[month_key]['failed'] += 1
        
        # Convert to list and sort by date
        test_trend = []
        for month_key in sorted(monthly_stats.keys()):
            stats = monthly_stats[month_key]
            test_trend.append({
                "date": month_key,
                "passed": stats['passed'],
                "failed": stats['failed']
            })
        
        # If no data, return empty array instead of mock data
        if not test_trend:
            return {"testTrend": []}
        
        return {"testTrend": test_trend}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching test trend: {str(e)}")

# Done
@router.get("/dashboard/project-pass-rates", name="get_project_pass_rates")
def get_project_pass_rates(db: Session = Depends(get_db)):
    """Get project pass rates for chart display"""
    try:
        # Use SQL query to get project pass rates directly from database
        results = (
            db.query(
                models.Project.name,
                func.sum(case((models.TestResult.business_check == 'PASSED', 1), else_=0)).label("passed"),
                func.count(models.TestResult.id).label("total")
            )
            .join(models.TestCase, models.TestResult.test_case_id == models.TestCase.id)
            .join(models.Project, models.TestCase.project_id == models.Project.id)
            .group_by(models.Project.id, models.Project.name)
            .all()
        )
        
        # Build pass rates list from SQL results
        pass_rates = []
        for project_name, passed, total in results:
            if total > 0:
                pass_rate = round((passed / total * 100), 1)
                pass_rates.append({
                    "name": project_name,
                    "passRate": pass_rate
                })
        
        # Sort by pass rate and limit to top 6
        pass_rates.sort(key=lambda x: x['passRate'], reverse=True)
        return {"projectPassRates": pass_rates[:6]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project pass rates: {str(e)}")

@router.get("/dashboard/complete-data", name="get_complete_dashboard_data")
def get_complete_dashboard_data(db: Session = Depends(get_db)):
    """Get complete dashboard data in one request - optimized version"""
    try:
        # Get all test results in one query at the beginning (used by several sections)
        test_results = get_all_test_results(db)

        # Common counts
        total_projects = db.query(models.Project).count()
        total_test_cases = db.query(models.TestCase).count()
        total_api_documents = db.query(models.ApiDocument).count()

        # Test scripts count (k6 / playwright)
        script_counts = db.query(
            func.sum(case((models.TestScript.script_type.contains('k6'), 1), else_=0)).label('k6'),
            func.sum(case((models.TestScript.script_type.contains('playwright'), 1), else_=0)).label('playwright'),
        ).one()
        k6_scripts = int(script_counts.k6 or 0)
        playwright_scripts = int(script_counts.playwright or 0)

        # Overview metrics
        total_tests_run = len(test_results)
        passed_tests = sum(1 for tr in test_results if tr.business_check == 'PASSED')
        failed_tests = sum(1 for tr in test_results if tr.business_check == 'FAILED')
        pass_rate = round((passed_tests / total_tests_run * 100), 1) if total_tests_run > 0 else 0
        fail_rate = round((failed_tests / total_tests_run * 100), 1) if total_tests_run > 0 else 0

        unique_dates = set()
        for tr in test_results:
            if tr.start_time:
                unique_dates.add(tr.start_time.date())
        test_execution_per_day_avg = round(total_tests_run / len(unique_dates), 1) if unique_dates else 0

        # Top projects by test case count (no pass rate)
        project_test_counts = db.query(
            models.Project.name,
            func.count(models.TestCase.id).label('test_cases_count')
        ).join(
            models.TestCase, models.Project.id == models.TestCase.project_id
        ).group_by(
            models.Project.id, models.Project.name
        ).order_by(
            desc(func.count(models.TestCase.id))
        ).limit(6).all()

        top_projects = [
            {"name": project_name, "testCases": test_cases_count}
            for project_name, test_cases_count in project_test_counts
        ]

        # API analytics via single grouped query
        agg_rows = (
            db.query(
                models.Api.method.label("method"),
                models.Api.path.label("path"),
                func.count(models.TestResult.id).label("total_calls"),
                func.sum(case((models.TestResult.business_check == 'FAILED', 1), else_=0)).label("failed_calls"),
            )
            .join(models.TestResult, models.Api.test_case_id == models.TestResult.test_case_id)
            .group_by(models.Api.method, models.Api.path)
            .all()
        )
        api_endpoints_count = len(agg_rows)
        api_fail_rates = []
        for row in agg_rows:
            total = row.total_calls or 0
            failed = row.failed_calls or 0
            if total > 0:
                api_fail_rates.append({
                    "name": f"{row.method} {row.path}",
                    "failRate": round((failed / total) * 100, 1),
                    "totalCalls": total,
                })
        api_fail_rates.sort(key=lambda x: x['failRate'], reverse=True)

        # Automation metrics (percentages based on distinct counts)
        if total_test_cases > 0:
            automated_count = db.query(func.count(func.distinct(models.TestResult.test_case_id))).scalar()
            ready_for_automation_count = db.query(func.count(func.distinct(models.TestScript.testcase_id))).scalar()
            automated_percentage = round((automated_count / total_test_cases * 100), 1)
            ready_for_automation_percentage = round((ready_for_automation_count / total_test_cases * 100), 1)
            not_automated_percentage = round(100 - automated_percentage - ready_for_automation_percentage, 1)
        else:
            automated_percentage = 0
            ready_for_automation_percentage = 0
            not_automated_percentage = 0

        # Test trend (Python aggregation over already-fetched results)
        monthly_stats = defaultdict(lambda: {'passed': 0, 'failed': 0})
        for tr in test_results:
            if tr.start_time:
                month_key = tr.start_time.strftime("%Y-%m")
                if tr.business_check == 'PASSED':
                    monthly_stats[month_key]['passed'] += 1
                elif tr.business_check == 'FAILED':
                    monthly_stats[month_key]['failed'] += 1
        test_trend = [
            {"date": month_key, "passed": stats['passed'], "failed": stats['failed']}
            for month_key, stats in sorted(monthly_stats.items())
        ]

        # Project pass rates via SQL query
        pass_rate_rows = (
            db.query(
                models.Project.name,
                func.sum(case((models.TestResult.business_check == 'PASSED', 1), else_=0)).label("passed"),
                func.count(models.TestResult.id).label("total"),
            )
            .join(models.TestCase, models.TestResult.test_case_id == models.TestCase.id)
            .join(models.Project, models.TestCase.project_id == models.Project.id)
            .group_by(models.Project.id, models.Project.name)
            .all()
        )
        pass_rates_list = []
        for project_name, passed, total in pass_rate_rows:
            if total > 0:
                pass_rates_list.append({
                    "name": project_name,
                    "passRate": round((passed / total) * 100, 1),
                })
        pass_rates_list.sort(key=lambda x: x['passRate'], reverse=True)

        # Execution time based on start_time and end_time
        durations = []  # seconds
        for tr in test_results:
            if getattr(tr, 'start_time', None) and getattr(tr, 'end_time', None):
                try:
                    durations.append((tr.end_time - tr.start_time).total_seconds())
                except Exception:
                    continue
        if durations:
            execution_time = {
                "fastest": round(min(durations), 2),
                "average": round(sum(durations) / len(durations), 2),
                "slowest": round(max(durations), 2),
                "distribution": [
                    {"range": "0-1s", "count": sum(1 for d in durations if d < 1)},
                    {"range": "1-2s", "count": sum(1 for d in durations if 1 <= d < 2)},
                    {"range": "2-5s", "count": sum(1 for d in durations if 2 <= d < 5)},
                    {"range": "5s+", "count": sum(1 for d in durations if d >= 5)},
                ],
            }
        else:
            execution_time = {
                "fastest": 0,
                "average": 0,
                "slowest": 0,
                "distribution": [
                    {"range": "0-1s", "count": 0},
                    {"range": "1-2s", "count": 0},
                    {"range": "2-5s", "count": 0},
                    {"range": "5s+", "count": 0},
                ],
            }
        
        return {
            "overview": {
                "totalProjects": total_projects,
                "totalTestCases": total_test_cases,
                "totalApiDocuments": total_api_documents,
                "totalTestsRun": total_tests_run,
                "passRate": pass_rate,
                "failRate": fail_rate,
                "testExecutionPerDayAvg": test_execution_per_day_avg
            },
            "bugsLogged": sum(1 for tr in test_results if getattr(tr, 'pushed_jira', 0) == 1),
            "testScripts": {
                "k6": k6_scripts,
                "playwright": playwright_scripts,
                "total": k6_scripts + playwright_scripts
            },
            "topProjects": top_projects,
            "apiEndpoints": api_endpoints_count,
            "topFailingApis": api_fail_rates[:5],
            "automation": {
                "readyForAutomation": ready_for_automation_percentage,
                "totalTestCases": total_test_cases,
                "automated": automated_percentage,
                "notAutomated": not_automated_percentage
            },
            "executionTime": execution_time,
            "testTrend": test_trend,
            "projectPassRates": pass_rates_list[:6]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching complete dashboard data: {str(e)}")
