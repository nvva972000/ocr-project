import inject
from fastapi import APIRouter, Depends, Query, Request
from services.user_service import UserService
from authentication.dependencies import require_token
from authorization.dependencies import check_permission
from typing import Optional, List
from schemas import UserRoleAssignment, UserRoleRemoval
from sqlalchemy.orm import Session
from database import get_db
from model.role import Role

router = APIRouter(dependencies=[Depends(require_token), Depends(check_permission)])

# Dependency provider for UserService
@inject.autoparams()
def get_user_service():
    return UserService()

@router.get("/users/", name="list_users")
def get_paginated_users(
    q: Optional[str] = Query(None, description="Search term for username, email, first name, or last name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    user_service: UserService = Depends(get_user_service),
):
    print("get_paginated_users")
    users, total = user_service.get_users(q=q, page=page, page_size=page_size)
    return {"data": users, "total": total, "page": page, "page_size": page_size}

@router.post("/users/sync-users", name="sync_users")
def sync_users(user_service: UserService = Depends(get_user_service)):
    success = user_service.sync_users_from_api()
    if success:
        return {"status": "success", "message": "Users synced successfully"}
    else:
        return {"status": "error", "message": "Failed to sync users"}

@router.get("/users/search-by-username", name="search_users_by_username")
def search_by_username(
    username: str = Query(..., description="Username to search"),
    user_service: UserService = Depends(get_user_service),
):
    users = user_service.search_user_by_username(username)
    return {"data": users}

@router.get("/users/search-by-email", name="search_users_by_email")
def search_by_email(
    email: str = Query(..., description="Email to search"),
    user_service: UserService = Depends(get_user_service),
):
    users = user_service.search_user_by_email(email)
    return {"data": users}

@router.post("/users/assign-roles", name="assign_roles_to_user")
def assign_roles_to_user(
    assignment: UserRoleAssignment,
    request: Request,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Assign roles to a user and update Casbin grouping policies"""
    success = user_service.assign_roles_to_user(assignment.user_id, assignment.role_ids)
    if not success:
        return {"status": "error", "message": "Failed to assign roles"}

    # Update Casbin: add group policies
    enforcer = request.app.state.enforcer
    roles = db.query(Role).filter(Role.id.in_(assignment.role_ids)).all()
    for r in roles:
        enforcer.add_grouping_policy(assignment.user_id, r.code)
    enforcer.save_policy()

    return {"status": "success", "message": "Roles assigned successfully"}

@router.delete("/users/remove-roles", name="remove_roles_from_user")
def remove_roles_from_user(
    removal: UserRoleRemoval,
    request: Request,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Remove roles from a user and update Casbin grouping policies"""
    success = user_service.remove_roles_from_user(removal.user_id, removal.role_ids)
    if not success:
        return {"status": "error", "message": "Failed to remove roles"}

    enforcer = request.app.state.enforcer
    roles = db.query(Role).filter(Role.id.in_(removal.role_ids)).all()
    for r in roles:
        enforcer.remove_grouping_policy(removal.user_id, r.code)
    enforcer.save_policy()

    return {"status": "success", "message": "Roles removed successfully"}

@router.get("/users/{user_id}/roles", name="get_user_roles")
def get_user_roles(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Get all roles assigned to a user"""
    roles = user_service.get_user_roles(user_id)
    return {"user_id": user_id, "roles": roles}

@router.get("/roles/{role_id}/users", name="get_role_users")
def get_role_users(
    role_id: str,
    q: Optional[str] = Query(None, description="Search term for username, email, first name, or last name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Get all users assigned to a specific role"""
    users, total = user_service.get_users_by_role(role_id, q=q, page=page, page_size=page_size)
    return {"data": users, "total": total, "page": page, "page_size": page_size, "role_id": role_id}

@router.put("/users/{user_id}/roles", name="update_user_roles")
def update_user_roles(
    user_id: str,
    role_ids: List[str],
    request: Request,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Update user roles (replace all existing roles with new ones) and sync Casbin"""
    success = user_service.update_user_roles(user_id, role_ids)
    if not success:
        return {"status": "error", "message": "Failed to update user roles"}

    enforcer = request.app.state.enforcer
    # Clear existing groups for user then add new
    enforcer.delete_roles_for_user(user_id)
    roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
    for r in roles:
        enforcer.add_grouping_policy(user_id, r.code)
    enforcer.save_policy()

    return {"status": "success", "message": "User roles updated successfully"} 