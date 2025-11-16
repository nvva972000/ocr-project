import datetime
from sqlalchemy import Column, String, DateTime, UniqueConstraint, func
from app.db.base import Base


class FeatureOperation(Base):
    __tablename__ = "feature_operations"

    id = Column(String(36), primary_key=True, nullable=False)
    feature_id = Column(String(36), nullable=False)
    feature_code = Column(String(128), nullable=False)
    operation = Column(String(64), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __init__(self, data: dict):
        self.id = data.get("id")
        self.feature_id = data.get("feature_id")
        self.feature_code = data.get("feature_code")
        self.operation = data.get("operation")

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "feature_id": self.feature_id,
            "feature_code": self.feature_code,
            "operation": self.operation,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

