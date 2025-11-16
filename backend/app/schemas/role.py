from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

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

class PaginatedRoleResponse(BaseModel):
    items: List[Role]
    total: int
    page: int
    page_size: int

