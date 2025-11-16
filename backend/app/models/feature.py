import datetime
from sqlalchemy import Column, String, DateTime
from app.db.base import Base


class Feature(Base):
    __tablename__ = "features"

    id = Column(String(36), primary_key=True, nullable=False)
    code = Column(String(128), nullable=False)
    name = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )

    def __init__(self, data: dict):
        self.id = data.get("id")
        self.code = data.get("code")
        self.name = data.get("name")

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

