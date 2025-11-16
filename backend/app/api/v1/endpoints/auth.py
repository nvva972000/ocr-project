from fastapi import APIRouter, Request, HTTPException, status, Depends, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import LoginRequest, RefreshTokenRequest, RegisterRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from fastapi_mail import FastMail, MessageSchema
from app.core.email_config import mail_conf
import logging

router = APIRouter()
security = HTTPBearer()

@router.post("/register")
async def register(register_data: RegisterRequest):
    """Register a new user"""
    try:
        user_service = UserService()
        
        # Create user
        user = user_service.create_user(
            username=register_data.username,
            email=register_data.email,
            password=register_data.password,
            first_name=register_data.first_name,
            last_name=register_data.last_name
        )
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": "Registration successful",
                "data": {
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logging.exception(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    """Login with username or email and password"""
    try:
        auth_service = AuthService()
        
        # Authenticate user and get tokens
        user_data, access_token, refresh_token = auth_service.authenticate_user(
            username=login_data.username,
            email=login_data.email,
            password=login_data.password
        )
        
        # Create session
        auth_service.create_user_session(user_data, access_token, refresh_token, request)
        
        # Create response
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Login successful",
                "data": {
                    "user_name": user_data["user_name"],
                    "email": user_data["email"],
                }
            }
        )
        
        # Set cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,  # False dev local HTTP
            samesite="strict",
            max_age=1800,
            path="/"
        )
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=604800,
            path="/"
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout")
async def logout(request: Request):
    """Logout user and invalidate session"""
    try:
        auth_service = AuthService()
        
        # Read refresh_token from cookie
        refresh_token = request.cookies.get("refresh_token")
        
        # Get user_id from session
        user_id = request.session.get("user_id")
        
        # Fallback: try to get from body if not in cookie
        if not refresh_token:
            try:
                body = await request.json()
                refresh_token = body.get("refresh_token")
            except:
                pass
        
        # Delete session from database
        if refresh_token:
            # Delete session by refresh_token
            auth_service.session_service.delete_session_by_refresh_token(refresh_token)
        elif user_id:
            # Delete all sessions of this user
            auth_service.session_service.delete_sessions_by_user_id(user_id)
        
        # Clear session middleware
        if user_id:
            request.session.clear()
        
        # Create response
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Logout successful"}
        )
        
        # Delete cookies
        response.delete_cookie(key="access_token", path="/")
        response.delete_cookie(key="refresh_token", path="/")
        
        return response
        
    except Exception as e:
        logging.error(f"Logout error: {e}")
        # Still clear session and cookies even if there's an error
        try:
            request.session.clear()
        except:
            pass
        
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Logout successful"}
        )
        # Still delete cookies even if there's an error
        response.delete_cookie(key="access_token", path="/")
        response.delete_cookie(key="refresh_token", path="/")
        return response

@router.get("/validate/token")
async def validate_token(request: Request):
    """Validate JWT token from cookie"""
    try:
        # Read token from cookie 
        token = request.cookies.get("access_token")
        
        # Read from Authorization header
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.replace("Bearer ", "")
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="TOKEN_INVALID"
            )
        
        auth_service = AuthService()
        user_data = auth_service.validate_token(token)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "detail": "TOKEN_VALID",
                "message": "Token is valid",
                "data": {
                    "user_name": user_data["user_name"],
                    "email": user_data["email"],
                },
            },
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Exception when validating token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="TOKEN_INVALID"
        )

@router.post("/refresh/token")
async def refresh_token_endpoint(request: Request):
    """Refresh access token using refresh token from cookie"""
    try:
        refresh_token = request.cookies.get("refresh_token")
        
        if not refresh_token:
            try:
                body = await request.json()
                refresh_token = body.get("refresh_token")
            except:
                pass
        
        if not refresh_token:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": "Refresh token is missing", "data": None},
            )
        
        auth_service = AuthService()
        new_access_token, user_data = auth_service.refresh_access_token(refresh_token)
        
        # Create response
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Success",
                "data": {
                    "user_name": user_data["user_name"],
                    "email": user_data["email"],
                },
            },
        )
        
        # Set new access_token into cookie
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=1800,
            path="/"
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Refresh token error: {e}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "Invalid refresh token", "data": None},
        )

@router.post("/forgot-password")
async def forgot_password(
    request_data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks
):
    """
    Receive email user, if exists then send OTP.
    Trả message.
    """
    try:
        auth_service = AuthService()
        
        # Send OTP in background task
        background_tasks.add_task(
            auth_service.forgot_password,
            request_data.email
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
            "message": "If the email you entered is valid, we’ve sent a verification code to your inbox. Please check your spam folder if you don’t see it.",
            "data": None
            }
        )
    except Exception as e:
        logging.exception(f"Forgot password error: {e}")
        # Still return success to prevent information leakage
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "If email exists in system, OTP will be sent to email.",
                "data": None
            }
        )

@router.post("/verify-otp")
async def verify_otp(request_data: VerifyOtpRequest):
    """
    Check if OTP is correct & expired.
    Used for step 2 at frontend: user enter OTP, if ok then go to step reset password.
    """
    try:
        auth_service = AuthService()
        auth_service.verify_otp(request_data.email, request_data.otp)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "OTP is valid", "data": None}
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Verify OTP error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/reset-password")
async def reset_password(request_data: ResetPasswordRequest):
    """
    Reset password: check OTP + update password + delete OTP.
    Frontend send email + OTP + new password.
    """
    try:
        auth_service = AuthService()
        auth_service.reset_password(
            request_data.email,
            request_data.otp,
            request_data.new_password
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Password reset successful", "data": None}
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Reset password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/test/send-mail")
async def send_test_mail(email: str = Query(..., description="Email address to send test email")):
    """
    Test endpoint to check email configuration (SendGrid/Gmail)
    Call: GET /api/v1/auth/test/send-mail?email=your-email@gmail.com
    """
    try:
        if not mail_conf.MAIL_USERNAME or not mail_conf.MAIL_PASSWORD:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "message": "Email configuration is missing. Please check MAIL_USERNAME and MAIL_PASSWORD in .env",
                    "data": None
                }
            )
        
        message = MessageSchema(
            subject="Test SendGrid SMTP - OCR Project",
            recipients=[email],
            body="Hello, this is a test email via SendGrid SMTP from OCR Project. If you receive this, email configuration is working correctly!",
            subtype="plain",
        )
        
        fm = FastMail(mail_conf)
        await fm.send_message(message)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"Test email sent successfully to {email}. Please check your inbox.",
                "data": {
                    "mail_server": mail_conf.MAIL_SERVER,
                    "mail_from": mail_conf.MAIL_FROM,
                }
            }
        )
    except Exception as e:
        logging.exception(f"Test email error: {e}")
        error_message = str(e)
        
        # Common error messages
        if "550" in error_message or "403" in error_message or "Sender Identity" in error_message:
            error_message = "The from address does not match a verified Sender Identity. Please verify MAIL_FROM in SendGrid."
        elif "535" in error_message or "Authentication failed" in error_message:
            error_message = "Authentication failed. Please check MAIL_USERNAME (should be 'apikey') and MAIL_PASSWORD (should be SG.xxx API Key)."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {error_message}"
        )

