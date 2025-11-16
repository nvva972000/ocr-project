import datetime
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base

# Constants
IS_ACTIVE = 1


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, nullable=False)
    name = Column(String(128), nullable=False)
    code = Column(String(128), nullable=False)
    is_active = Column(Integer, nullable=False, default=IS_ACTIVE)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )

    # Relationships
    users = relationship("User", secondary="user_roles", back_populates="roles")

    def __init__(self, data: dict):
        self.id = data.get("id", None)
        self.name = data.get("name", None)
        self.code = data.get("code", None)
        self.is_active = data.get("is_active", IS_ACTIVE)

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

