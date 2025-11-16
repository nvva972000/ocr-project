from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.authentication.dependencies import require_token
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.feature_operation import FeatureOperation
from collections import defaultdict
from typing import List, Dict, Any

router = APIRouter(dependencies=[Depends(require_token)])

@router.get("/check-permissions", name="get_current_user_permissions")
def get_current_user_permissions(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current user's permissions and roles - only basic info for UI control"""
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "User not authenticated"}
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Get user roles
    user_roles = db.query(Role).join(User.roles).filter(User.id == user_id).all()
    roles_data = [{"id": role.id, "code": role.code, "name": role.name} for role in user_roles]
    
    # Get user permissions through roles - only for UI features
    role_codes = [role.code for role in user_roles]
    permissions = db.query(Permission).filter(Permission.role_code.in_(role_codes)).all()
    
    # Group permissions by feature
    permissions_by_feature = defaultdict(list)
    for perm in permissions:
        permissions_by_feature[perm.feature_code].append(perm.operation)
    
    # Only return permissions for UI features (not sensitive backend operations)
    ui_features = [
            "PROJECT", "PROJECT_SETTING", "TEST_CASE", "RUN_TEST", "TEST_SCHEDULE", "TEST_HISTORY", "DOCUMENT"
            ,"DASHBOARD", "USER", "ROLE", "FEATURE", "PERMISSION", "UI_TEST"
    ]
    
    ui_permissions = {}
    for feature in ui_features:
        if feature in permissions_by_feature:
            ui_permissions[feature] = permissions_by_feature[feature]
        else:
            ui_permissions[feature] = []
    
    return ui_permissions

@router.get("/current-user/roles", name="get_current_user_roles")
def get_current_user_roles(request: Request, db: Session = Depends(get_db)):
    """Get current user's roles only"""
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "User not authenticated"}
    
    user_roles = db.query(Role).join(User.roles).filter(User.id == user_id).all()
    return {
        "roles": [{"id": role.id, "code": role.code, "name": role.name} for role in user_roles],
        "is_admin": "ADMIN" in [role.code for role in user_roles]
    }

