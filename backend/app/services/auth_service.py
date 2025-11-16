from datetime import datetime, timedelta
from typing import Tuple, Optional
from fastapi import HTTPException, status, Request
from app.services.user_service import UserService
from app.core.security import verify_password, create_access_token, create_refresh_token, verify_token, get_password_hash
from app.services.session_service import SessionService
from app.services.otp_service import OTPService
from app.models.session import Session as SessionEntity
from app.models.otp import OTP
from fastapi_mail import FastMail, MessageSchema
from app.core.email_config import mail_conf
from app.core.config import settings
import uuid
import logging
from app.repository.otp.otp_interface import OTPInterface
import inject

class AuthService:
    @inject.autoparams()
    def __init__(self, otp_repo: OTPInterface):
        self.user_service = UserService()
        self.session_service = SessionService()
        self.otp_repo = otp_repo
    
    def authenticate_user(self, username: Optional[str] = None, email: Optional[str] = None, password: str = "") -> Tuple[dict, str, str]:
        """
        Authenticate user with username or email and password
        Returns: (user_data, access_token, refresh_token)
        """
        user = None
        
        if username:
            try:
                user = self.user_service.get_user_by_username(username)
            except:
                pass
        
        if not user and email:
            try:
                user = self.user_service.get_user_by_email(email)
            except:
                pass
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # 2. Verify password
        if not hasattr(user, 'password') or not user.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password not set for this user"
            )
        
        if not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # 3. Check user status
        if getattr(user, 'status', None) != 'ACTIVE' or str(getattr(user, 'is_active', '')) not in ['1', 'ACTIVE']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )
        
        # 4. Tạo tokens
        token_data = {
            "sub": user.id,
            "email": user.email,
            "username": user.username or user.email,
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token({"sub": user.id})
        
        # 5. Prepare user data
        user_data = {
            "id": user.id,
            "user_name": user.username or user.email,
            "email": user.email,
            "roles": [role.code for role in user.roles] if user.roles else []
        }
        
        return user_data, access_token, refresh_token
    
    def create_user_session(self, user_data: dict, access_token: str, refresh_token: str, request: Request) -> None:
        """Create and save user session"""
        session_state = str(uuid.uuid4())
        now = datetime.now()
        
        self.session_service.create_session(SessionEntity({
            "id": str(uuid.uuid4()),
            "user_id": user_data["id"],
            "username": user_data["user_name"],
            "email": user_data["email"],
            "ip_address": request.client.host,
            "started": now,
            "last_access": now,
            "refresh_token": refresh_token,
            "sid": session_state,
            "id_token": access_token,
        }))
        
        # Lưu vào session middleware
        request.session["user_id"] = user_data["id"]
        request.session["email"] = user_data["email"]
        request.session["roles"] = user_data["roles"]
    
    def validate_token(self, token: str) -> dict:
        """
        Validate JWT token and return user data
        """
        # Verify token
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="TOKEN_INVALID"
            )
        
        # Get user from DB
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="TOKEN_INVALID"
            )
        
        db_user = self.user_service.get_user_by_id(user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="USER_INVALID"
            )
        
        # Check user status
        if getattr(db_user, 'status', None) != 'ACTIVE' or str(getattr(db_user, 'is_active', '')) not in ['1', 'ACTIVE']:
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="USER_INVALID"
            )
        
        return {
            "id": db_user.id,
            "user_name": db_user.username or db_user.email,
            "email": db_user.email,
        }
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[str, dict]:
        """
        Refresh access token using refresh token
        Returns: (new_access_token, user_data)
        """
        # Verify refresh token
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid refresh token"
            )
        
        # Get user
        user = self.user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User not found"
            )
        
        # Check user status
        if getattr(user, 'status', None) != 'ACTIVE' or str(getattr(user, 'is_active', '')) not in ['1', 'ACTIVE']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active"
            )
        
        # Create new access token
        token_data = {
            "sub": user.id,
            "email": user.email,
            "username": user.username or user.email,
        }
        new_access_token = create_access_token(token_data)
        
        # Update session
        session_info = self.session_service.get_session_by_refresh_token(refresh_token)
        if session_info:
            self.session_service.update_session(
                session_info,
                {
                    "last_access": datetime.now(),
                    "id_token": new_access_token,
                },
            )
        
        user_data = {
            "id": user.id,
            "user_name": user.username or user.email,
            "email": user.email,
        }
        
        return new_access_token, user_data
    
    async def forgot_password(self, email: str) -> None:
        """
        Send OTP to user's email for password reset.
        Security: Always returns success message regardless of email existence
        to prevent email enumeration attacks.
        """
        try:
            # Normalize email
            email = email.strip().lower()
            
            # Check if user exists (but don't reveal this in response)
            user = None
            try:
                user = self.user_service.get_user_by_email(email)
            except Exception:
                pass
            
            # Only proceed if user exists
            if not user:
                # Silent fail to prevent email enumeration
                return
            
            # Generate OTP using service
            otp_code = OTPService.generate_otp()
            
            # Calculate expiry (5 minutes)
            expire_at = datetime.utcnow() + timedelta(minutes=5)
            
            # Save OTP to database (repository will handle cleanup of old OTPs)
            otp = OTP({
                "id": str(uuid.uuid4()),
                "email": email,
                "otp": otp_code,
                "expire_at": expire_at,
            })
            
            self.otp_repo.create_otp(otp)
            
            # Send email with HTML template
            if mail_conf.MAIL_USERNAME and mail_conf.MAIL_PASSWORD:
                try:
                    # Use HTML email template with logo and branding
                    app_name = settings.APP_NAME
                    logo_url = settings.APP_LOGO_URL
                    app_domain = settings.APP_DOMAIN
                    
                    html_body = f"""
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Reset - {app_name}</title>
                        <style>
                            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                   line-height: 1.6; color: #333333; background-color: #f5f5f5; }}
                            .email-wrapper {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                            .email-header {{ background: linear-gradient(135deg, #1A3636 0%, #2d4f4f 100%); padding: 40px 30px; text-align: center; }}
                            .logo-container {{ margin-bottom: 20px; }}
                            .logo {{ max-width: 180px; height: auto; display: inline-block; }}
                            .email-header h1 {{ color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }}
                            .email-body {{ padding: 40px 30px; background-color: #ffffff; }}
                            .greeting {{ font-size: 16px; color: #333333; margin-bottom: 20px; }}
                            .message {{ font-size: 15px; color: #666666; margin-bottom: 30px; line-height: 1.8; }}
                            .otp-container {{ background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                                            border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; 
                                            border: 2px dashed #1A3636; }}
                            .otp-label {{ font-size: 14px; color: #666666; margin-bottom: 15px; text-transform: uppercase; 
                                        letter-spacing: 1px; font-weight: 600; }}
                            .otp-code {{ font-size: 42px; font-weight: 700; color: #1A3636; letter-spacing: 12px; 
                                       font-family: 'Courier New', monospace; margin: 10px 0; }}
                            .otp-expiry {{ font-size: 13px; color: #999999; margin-top: 15px; }}
                            .warning-box {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; 
                                          margin: 25px 0; border-radius: 4px; }}
                            .warning-box p {{ font-size: 14px; color: #856404; margin: 0; line-height: 1.6; }}
                            .warning-icon {{ font-size: 18px; margin-right: 8px; }}
                            .button-container {{ text-align: center; margin: 30px 0; }}
                            .button {{ display: inline-block; background-color: #1A3636; color: #ffffff; 
                                     padding: 14px 32px; text-decoration: none; border-radius: 6px; 
                                     font-weight: 600; font-size: 15px; }}
                            .button:hover {{ background-color: #2d4f4f; }}
                            .email-footer {{ background-color: #f8f9fa; padding: 30px; text-align: center; 
                                           border-top: 1px solid #e9ecef; }}
                            .footer-text {{ font-size: 12px; color: #999999; margin-bottom: 10px; line-height: 1.6; }}
                            .footer-links {{ margin-top: 15px; }}
                            .footer-links a {{ color: #1A3636; text-decoration: none; margin: 0 10px; font-size: 12px; }}
                            .footer-links a:hover {{ text-decoration: underline; }}
                            .divider {{ height: 1px; background-color: #e9ecef; margin: 25px 0; }}
                            @media only screen and (max-width: 600px) {{
                                .email-body {{ padding: 25px 20px; }}
                                .email-header {{ padding: 30px 20px; }}
                                .otp-code {{ font-size: 32px; letter-spacing: 8px; }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="email-wrapper">
                            <div class="email-header">
                                <div class="logo-container">
                                    <img src="{logo_url}" alt="{app_name} Logo" class="logo" />
                                </div>
                                <h1>Password Reset Request</h1>
                            </div>
                            
                            <div class="email-body">
                                <div class="greeting">
                                    <strong>Hello,</strong>
                                </div>
                                
                                <div class="message">
                                    <p>We received a request to reset your password for your <strong>{app_name}</strong> account. 
                                    If you made this request, please use the verification code below to complete the process.</p>
                                </div>
                                
                                <div class="otp-container">
                                    <div class="otp-label">Your Verification Code</div>
                                    <div class="otp-code">{otp_code}</div>
                                    <div class="otp-expiry">⏰ Valid for 5 minutes</div>
                                </div>
                                
                                <div class="warning-box">
                                    <p>
                                        <span class="warning-icon">⚠️</span>
                                        <strong>Security Notice:</strong> If you did not request this password reset, 
                                        please ignore this email. Your password will remain unchanged and no changes 
                                        have been made to your account.
                                    </p>
                                </div>
                                
                                <div class="divider"></div>
                                
                                <div class="message">
                                    <p style="font-size: 14px; color: #999999;">
                                        <strong>Need help?</strong> If you're having trouble, please contact our support team 
                                        or visit our help center.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="email-footer">
                                <div class="footer-text">
                                    <p>This is an automated message from <strong>{app_name}</strong>.</p>
                                    <p>Please do not reply to this email. This mailbox is not monitored.</p>
                                </div>
                                <div class="footer-links">
                                    <a href="{app_domain}">Visit Website</a> |
                                    <a href="{app_domain}/support">Support</a> |
                                    <a href="{app_domain}/privacy">Privacy Policy</a>
                                </div>
                                <div class="footer-text" style="margin-top: 20px;">
                                    <p>© {datetime.utcnow().year} {app_name}. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    
                    message = MessageSchema(
                        subject="🔐 Password Reset OTP Code",
                        recipients=[email],
                        body=html_body,
                        subtype="html",
                    )
                    
                    fm = FastMail(mail_conf)
                    await fm.send_message(message)
                    
                except Exception as email_error:
                    logging.error(f"Failed to send password reset email to {email}: {email_error}", exc_info=True)
                    # In dev mode, log OTP for testing
                    if not mail_conf.MAIL_USERNAME or not mail_conf.MAIL_PASSWORD:
                        logging.info(f"[DEV MODE] Password reset OTP for {email}: {otp_code}")
            else:
                # Dev mode: log OTP if email config is not available
                logging.info(f"[DEV MODE] Password reset OTP for {email}: {otp_code}")
            
        except Exception as e:
            # Log error but don't raise (security: don't reveal if email exists)
            logging.error(f"Error in forgot_password for email {email}: {e}", exc_info=True)
            # Silently fail to prevent information leakage
    
    def verify_otp(self, email: str, otp: str) -> bool:
        """
        Verify OTP - check if OTP is correct & expired
        """
        otp_record = self.otp_repo.get_otp_by_email_and_code(email, otp)
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP không đúng"
            )
        
        if otp_record.expire_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP đã hết hạn"
            )
        
        return True
    
    def reset_password(self, email: str, otp: str, new_password: str) -> None:
        """
        Reset password: check OTP + update password + delete OTP    
        """
        # Check OTP
        otp_record = self.otp_repo.get_otp_by_email_and_code(email, otp)
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP Does Not Exist"
            )
        
        if otp_record.expire_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP Expired"
            )
        
        # Check if user exists
        user = self.user_service.get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User Not Found"
            )
        
        # Hash và cập nhật mật khẩu mới
        hashed_password = get_password_hash(new_password)
        self.user_service.update_user_password(user.id, hashed_password)
        
        # Xóa OTP để đảm bảo dùng 1 lần
        self.otp_repo.delete_otp_by_email(email)
