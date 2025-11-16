import inject
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.repository.user.user_interface import UserInterface
from app.repository.user.user_implement import UserImplement
from app.repository.session.session_interface import SessionInterface
from app.repository.session.session_implement import SessionImplement
from app.repository.otp.otp_interface import OTPInterface
from app.repository.otp.otp_implement import OTPImplement

# Import controllers
from app.controllers.v1 import user, current_user
from app.authorization.controller import role_controller, permission_controller, feature_controller


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Chạy khi server khởi động
    print("🚀 Starting OCR Project API...")
    
    print("✅ Application started successfully!")
    
    yield  # Ứng dụng chạy ở đây (nhận requests)
    
    # Shutdown: Chạy khi server tắt
    print("🛑 Shutting down OCR Project API...")
    print("👋 Application stopped.")


app = FastAPI(title="OCR Project", lifespan=lifespan)


def configure_injector(binder):
    binder.bind_to_constructor(UserService, UserService)
    binder.bind_to_constructor(SessionService, SessionService)
    binder.bind(UserInterface, UserImplement())
    binder.bind(SessionInterface, SessionImplement())
    binder.bind(OTPInterface, OTPImplement())  


if not inject.is_configured():
    inject.configure(configure_injector)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "actor",
    ],
    expose_headers=["*"],
    max_age=3600,
)

app.add_middleware(SessionMiddleware, secret_key="secret")

# Include routers
app.include_router(api_router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1", tags=["USER"])
app.include_router(role_controller.router, prefix="/api/v1", tags=["ROLE"])
app.include_router(permission_controller.router, prefix="/api/v1", tags=["PERMISSION"])
app.include_router(feature_controller.router, prefix="/api/v1", tags=["FEATURE"])
app.include_router(current_user.router, prefix="/api/v1", tags=["CHECK_PERMISSION"])


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to OCR Project API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)

