from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class PermissionBase(BaseModel):
    role_id: str
    role_code: str
    feature_id: str
    feature_code: str
    operation: str

class Permission(PermissionBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PermissionCustom(Permission):
    own: bool
    permission_id: Optional[str] = None

    class Config:
        from_attributes = True

class PermissionResponse(BaseModel):
    feature_code: str
    permissions: List[PermissionCustom]
    own: bool

class PaginatedPermissionResponse(BaseModel):
    items: List[PermissionResponse]
    total: int
    page: int
    page_size: int

