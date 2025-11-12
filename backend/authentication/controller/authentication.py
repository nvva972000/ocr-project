import base64
import json
import logging
import uuid

from fastapi import HTTPException, status, APIRouter, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.httpx_client import AsyncOAuth2Client
from datetime import datetime
from pydantic import BaseModel
from authentication import oauth
from services.session_service import SessionService
from services.user_service import UserService
from model.session import Session as SessionEntity
from common.constant import STATUS_SESSION_EXPIRED
from common import config as Config
from authorization.sync import sync_user_roles
from database import SessionLocal

router = APIRouter()

class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.get("/sso/login")
async def sso_login(request: Request, redirect: str = None):
    if not redirect:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Not found redirect", "data": None},
        )
    try:
        request.session['post_login_redirect'] = redirect
        redirect_uri = request.url_for("sso_callback")
        return await oauth.keycloak.authorize_redirect(request, redirect_uri)
    except Exception as e:
        logging.exception(f"Login error: {e}")

    return RedirectResponse(redirect)


@router.get("/sso/logout")
async def sso_logout(request: Request, redirect: str = None):
    try:
        id_token = request.session.get("id_token")

        # Keycloak logout URL
        logout_url = (
            f"{Config.KEYCLOAK_SERVER_URL}realms/{Config.KEYCLOAK_REALM}/protocol/openid-connect/logout"
            f"?id_token_hint={id_token}"
            f"&post_logout_redirect_uri={redirect}"
        )

        # Clear the user's session
        request.session.clear()

        # Update session status
        session_info = SessionService().get_session_by_id_token(id_token)
        if session_info:
            SessionService().update_session(
                session_info,
                {
                    "last_access": datetime.now(),
                    "status": STATUS_SESSION_EXPIRED,
                },
            )

        return RedirectResponse(logout_url)

    except Exception as e:
        logging.error(f"Logout error: {e}")

    return RedirectResponse(redirect)

@router.get("/sso/callback")
async def sso_callback(request: Request, redirect: str = None):
    redirect = request.session.get("post_login_redirect") or "/"
    return await get_token(request, redirect)

@router.get("/authentication/validate/token")
async def validate_token(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            print("Missing JWT token")
            raise HTTPException(status_code=status.HTTP_200_OK, detail="HEADER_MISSING")

        token = auth_header.split(" ")[1]

        try:
            user_info = await oauth.keycloak.userinfo(token={"access_token": token})
        except Exception:
            print("Invalid JWT token")
            raise HTTPException(status_code=status.HTTP_200_OK, detail="TOKEN_INVALID")

        # Lấy user thực từ DB
        print(f"user_email: {user_info.get('email')}")
        db_user = UserService().get_user_by_email(user_info.get("email"))
        if not db_user:
            print("User not found")
            raise HTTPException(status_code=status.HTTP_200_OK, detail="USER_INVALID")
        # Check user status
        if getattr(db_user, 'status', None) != 'ACTIVE' or str(getattr(db_user, 'is_active', '')) not in ['1', 'ACTIVE']:
            print("User status is not active")
            raise HTTPException(status_code=status.HTTP_200_OK, detail="USER_INVALID")

        print("Authentication success")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "detail": "TOKEN_VALID",
                "message": "Token is valid",
                "data": {
                    "id": db_user.id,
                    "user_name": user_info.get("preferred_username"),
                    "email": user_info.get("email"),
                },
            },
        )

    except Exception as e:
        print(f"Exception when validating token: {e}")
        raise HTTPException(status_code=status.HTTP_200_OK, detail="TOKEN_INVALID")

@router.post("/authentication/refresh/token")
async def refresh_token_endpoint(body: RefreshTokenRequest, request: Request):
    refresh_token = body.refresh_token

    if not refresh_token:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Refresh token is missing", "data": None},
        )

    try:
        async with AsyncOAuth2Client(
            client_id=Config.OIDC_CLIENT_ID,
            client_secret=Config.OIDC_CLIENT_SECRET,
        ) as client:
            token = await client.fetch_token(
                url=f"{Config.OIDC_ISSUER_URL}/protocol/openid-connect/token",
                grant_type="refresh_token",
                refresh_token=refresh_token,
            )

        if not token:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"message": "Invalid refresh token", "data": None},
            )

        # Cập nhật session nếu có
        session_info = SessionService().get_session_by_refresh_token(refresh_token)
        if session_info:
            SessionService().update_session(
                session_info,
                {
                    "last_access": datetime.now(),
                    "refresh_token": token.get("refresh_token"),
                },
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Success",
                "data": {
                    "token_type": token.get("token_type"),
                    "access_token": token.get("access_token"),
                    "refresh_token": token.get("refresh_token"),
                },
            },
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "Invalid refresh token", "data": None},
        )


async def get_token(request: Request, url_redirect: str):
    # 1. Lấy token từ Keycloak
    token = await oauth.keycloak.authorize_access_token(request)
    
    # Lấy các token
    access_token = token.get("access_token")
    refresh_token = token.get("refresh_token")
    id_token = token.get("id_token")
    expires_in = token.get("expires_in")  # seconds
    refresh_expires_in = token.get("refresh_expires_in")  # seconds

    # Lấy thông tin người dùng từ trường "userinfo"
    userinfo = token.get("userinfo", {})
    email = userinfo.get("email")
    username = userinfo.get("preferred_username")
    session_state = token.get("session_state")
    issued_at = userinfo.get("iat", 0)
    expires_at = userinfo.get("exp", 0)
    token_lifetime = int(expires_at - issued_at)

    # 3. Tìm người dùng
    cmp_user = UserService().get_user_by_email(email)
    cmp_user_id = cmp_user.id if cmp_user else None

    # Sync roles to Casbin grouping policies on login
    try:
        if cmp_user:
            enforcer = request.app.state.enforcer
            with SessionLocal() as db:
                sync_user_roles(db, enforcer, cmp_user)
    except Exception as e:
        logging.warning(f"Failed to sync casbin roles (login): {e}")

    # 4. Đóng gói token
    token_data = {
        "id": cmp_user_id,
        "user_name": username,
        "email": email,
        "access_token": access_token,
        "expires_in": expires_in,
        "refresh_token": refresh_token,
        "refresh_expires_in": refresh_expires_in,
        "id_token": id_token,
    }

    # 5. Ghi vào session (SessionMiddleware)
    request.session["id_token"] = id_token
    request.session["user_id"] = cmp_user_id
    request.session["email"] = email
    request.session["roles"] = [role.code for role in cmp_user.roles]

    # 6. Nếu có redirect, xử lý lưu session và trả về redirect
    if url_redirect:
        session_info = SessionService().get_session_by_sid(session_state)
        now = datetime.now()

        if session_info:
            SessionService().update_session(session_info, {
                "last_access": now,
                "refresh_token": refresh_token,
                "id_token": id_token,
            })
        else:
            SessionService().create_session(SessionEntity({
                "id": str(uuid.uuid4()),
                "user_id": cmp_user_id,
                "username": username,
                "email": email,
                "ip_address": request.client.host,
                "started": now,
                "last_access": now,
                "refresh_token": refresh_token,
                "sid": session_state,
                "id_token": id_token,
            }))

        # Encode token & redirect
        data_encoded = base64.urlsafe_b64encode(json.dumps(token_data).encode()).decode()
        if "?" in url_redirect:
            redirect_url = f"{url_redirect}&data={data_encoded}"
        else:
            redirect_url = f"{url_redirect}?data={data_encoded}"
        return RedirectResponse(redirect_url)

    # 7. Nếu không có redirect, trả về JSON token
    return JSONResponse(content=token_data)