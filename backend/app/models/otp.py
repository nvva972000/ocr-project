import datetime
from sqlalchemy import Column, String, DateTime
from app.db.base import Base

class OTP(Base):
    __tablename__ = "otp_codes"
    
    id = Column(String(36), primary_key=True, nullable=False)
    email = Column(String(64), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    expire_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.email = data.get("email")
        self.otp = data.get("otp")
        self.expire_at = data.get("expire_at")
        self.created_at = data.get("created_at", datetime.datetime.now())
    
    def as_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "otp": self.otp,
            "expire_at": self.expire_at,
            "created_at": self.created_at,
        }
