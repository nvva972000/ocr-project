import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.db.base import Base

# Constants
STATUS_SESSION_ACTIVE = 1


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, nullable=False)
    user_id = Column(String(36))
    username = Column(String(64), nullable=False)
    email = Column(String(64), nullable=False)
    ip_address = Column(String(32), nullable=False)
    started = Column(DateTime, nullable=False)
    last_access = Column(DateTime)
    refresh_token = Column(String(1024), nullable=False)
    sid = Column(String(36))
    id_token = Column(Text)
    status = Column(Integer, nullable=False, default=STATUS_SESSION_ACTIVE)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )

    def __init__(self, data: dict, **kwargs):
        super().__init__(**kwargs)
        self.id = data.get("id", None)
        self.user_id = data.get("user_id", None)
        self.username = data.get("username", None)
        self.email = data.get("email", None)
        self.ip_address = data.get("ip_address", None)
        self.started = data.get("started", None)
        self.last_access = data.get("last_access", None)
        self.refresh_token = data.get("refresh_token", None)
        self.sid = data.get("sid", None)
        self.id_token = data.get("id_token", None)

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "ip_address": self.ip_address,
            "started": self.started,
            "last_access": self.last_access,
            "status": self.status,
        }

