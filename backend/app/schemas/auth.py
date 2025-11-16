from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional

class LoginRequest(BaseModel):
    username: Optional[str] = None  
    email: Optional[EmailStr] = None 
    password: str
    
    @model_validator(mode='after')
    def validate_at_least_one(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    id: str
    user_name: str
    email: str
    access_token: str
    refresh_token: str
    expires_in: int
    refresh_expires_in: int

class ValidateTokenResponse(BaseModel):
    detail: str
    message: str
    data: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

