from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from typing import Optional


class UserDetail(BaseModel):
    id: str
    username: str
    role: List[str]


class RoleBase(BaseModel):
    name: str
    code: str
    is_active: Optional[int] = 1


class Role(RoleBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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


class PaginatedRoleResponse(BaseModel):
    items: List[Role]
    total: int
    page: int
    page_size: int


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


class UserRoleAssignment(BaseModel):
    user_id: str
    role_ids: List[str]


class UserRoleResponse(BaseModel):
    user_id: str
    roles: List[Role]
    message: str


class UserRoleRemoval(BaseModel):
    user_id: str
    role_ids: List[str]


class FeatureBase(BaseModel):
    name: str
    code: str


class Feature(FeatureBase):
    id: str
    created_at: Optional[datetime] | None = None
    updated_at: Optional[datetime] | None = None


class PaginatedFeatureResponse(BaseModel):
    items: List[Feature]
    total: int
    page: int
    page_size: int
