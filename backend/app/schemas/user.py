from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class UserRoleAssignment(BaseModel):
    user_id: str
    role_ids: List[str]

class UserRoleRemoval(BaseModel):
    user_id: str
    role_ids: List[str]

