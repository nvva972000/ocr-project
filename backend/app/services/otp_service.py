import random
import string

class OTPService:
    """Service to generate OTP codes"""
    
    OTP_LENGTH = 6
    
    @classmethod
    def generate_otp(cls) -> str:
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=cls.OTP_LENGTH))

