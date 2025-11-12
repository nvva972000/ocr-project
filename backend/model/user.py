import datetime
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from common.constant import IS_ACTIVE, IS_NOT_DELETED
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, nullable=False)
    username = Column(String(64))
    email = Column(String(64), nullable=False)
    first_name = Column(String(64))
    last_name = Column(String(64))
    status = Column(String(64), nullable=False, default="ACTIVE")
    is_deleted = Column(String(64), nullable=False, default=IS_NOT_DELETED)
    is_active = Column(String(64), nullable=False, default=IS_ACTIVE)
    created_at = Column(DateTime, default=datetime.datetime.now)
    created_by = Column(String(36))
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(),
        onupdate=datetime.datetime.now(),
    )
    updated_by = Column(String(36))

    # Relationships
    roles = relationship("Role", secondary="user_roles", back_populates="users", lazy="joined" )

    def __init__(self, data: dict):
        self.id = data.get("id", None)
        self.username = data.get("username", None)
        self.email = data.get("email", None)
        self.first_name = data.get("first_name", None)
        self.last_name = data.get("last_name", None)
        self.status = data.get("status", None)
        self.is_active = data.get("is_active", None)
        self.is_deleted = data.get("is_deleted", None)
        self.created_at = data.get("created_at", None)
        self.created_by = data.get("created_by", None)
        self.updated_at = data.get("updated_at", None)
        self.updated_by = data.get("updated_by", None)

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "roles": [role.serialize for role in self.roles] if self.roles else [],
        }
