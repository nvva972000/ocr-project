from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

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

