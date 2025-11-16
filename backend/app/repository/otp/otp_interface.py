from abc import ABC, abstractmethod
from app.models.otp import OTP

class OTPInterface(ABC):
    @abstractmethod
    def create_otp(self, otp: OTP) -> bool:
        pass
    
    @abstractmethod
    def get_otp_by_email_and_code(self, email: str, otp: str) -> OTP:
        pass
    
    @abstractmethod
    def delete_otp_by_email(self, email: str) -> bool:
        pass
