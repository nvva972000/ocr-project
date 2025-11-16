import json
import datetime
import re

from json import JSONEncoder

class DateTimeEncoder(JSONEncoder):
    # Override the default method
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()


def data_time_serialize(obj):
    return json.loads(json.dumps(obj, indent=4, cls=DateTimeEncoder))

def extract_json_from_response(response_text: str):
    """
    Trích xuất đoạn JSON đầu tiên tìm được trong chuỗi phản hồi.
    """
    try:
        match = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
        if match:
            json_str = match.group(1)
            return json.loads(json_str)
        else:
            match = re.search(r"(\{.*\})", response_text, re.DOTALL)
            if match:
                return json.loads(match.group(1))
    except Exception as e:
        print(f"[ERROR] Could not extract JSON: {e}")
    return None

def extract_cron_expression_from_response(response: str):
    """Extract cron expression from response"""
    try:
        match = re.search(r"```cron\n(.*?)\n```", response, re.DOTALL)
        if match:
            return match.group(1)
        else:
            return None
    except Exception as e:
        print(f"Error extracting cron expression from response: {str(e)}")
        raise

