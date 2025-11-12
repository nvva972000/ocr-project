import inject
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.v1 import (
    user,
    dashboard,
    current_user,
)
from authorization.controller import role_controller
from authorization.controller import feature_controller
from authorization.controller import permission_controller
from config import settings
from authentication.controller import authentication
from starlette.middleware.sessions import SessionMiddleware
from services.user_service import UserService
from services.session_service import SessionService
from repository.user.user_interface import UserInterface
from repository.user.user_implement import UserImplement
from repository.session.session_interface import SessionInterface
from repository.session.session_implement import SessionImplement
from contextlib import asynccontextmanager
from authorization.casbin_enforcer import get_enforcer
from authorization.create_operations import sync_feature_operations

# from authentication import oauth


@asynccontextmanager
async def lifespan(app: FastAPI):
    start()
    app.state.enforcer = get_enforcer()
    try:
        sync_feature_operations(app)
    finally:
        stop()


app = FastAPI(title="OCR Project", lifespan=lifespan)


def configure_injector(binder):
    binder.bind_to_constructor(UserService, UserService)
    binder.bind_to_constructor(SessionService, SessionService)
    binder.bind(UserInterface, UserImplement())
    binder.bind(SessionInterface, SessionImplement())
    # Bind other services as needed


if not inject.is_configured():
    inject.configure(configure_injector)

origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # Alternative localhost
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

app.include_router(authentication.router, prefix="/api", tags=["AUTHENTICATION"])
app.include_router(user.router, prefix="/api", tags=["USER"])
app.include_router(dashboard.router, prefix="/api", tags=["DASHBOARD"])
app.include_router(role_controller.router, prefix="/api", tags=["ROLE"])
app.include_router(feature_controller.router, prefix="/api", tags=["FEATURE"])
app.include_router(permission_controller.router, prefix="/api", tags=["PERMISSION"])
app.include_router(current_user.router, prefix="/api", tags=["CHECK_PERMISSION"])


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

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=False)
