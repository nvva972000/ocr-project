from typing import Optional, List
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from model.role import Role
from authentication.dependencies import require_token
from authorization.dependencies import check_permission
import schemas


router = APIRouter(dependencies=[Depends(require_token), Depends(check_permission)])


@router.get("/roles", response_model=schemas.PaginatedRoleResponse, name="list_roles")
def list_roles(
    q: Optional[str] = Query(None, description="Search by role name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Role)
    if q:
        query = query.filter(Role.name.ilike(f"%{q}%"))

    total = query.count()
    items = (
        query.order_by(Role.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/roles/{role_id}", response_model=schemas.Role, name="get_role")
def get_role(role_id: str, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.post("/roles", response_model=schemas.Role, name="create_role")
def create_role(payload: schemas.RoleBase, db: Session = Depends(get_db)):
    name = payload.name
    if not name:
        raise HTTPException(status_code=400, detail="Missing 'name'")

    # Check duplicate by name
    existed = db.query(Role).filter(Role.name == name).first()
    if existed:
        raise HTTPException(status_code=400, detail="Role name already exists")

    now = datetime.now()
    data = {
        "id": str(uuid.uuid4()),
        "name": name,
        "code": payload.code,
        "is_active": payload.is_active if payload.is_active is not None else 1,
        "created_at": now,
        "updated_at": now,
    }
    role = Role(data)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.put("/roles/{role_id}", response_model=schemas.Role, name="update_role")
def update_role(role_id: str, payload: schemas.RoleBase, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Optional rename - check duplicate name
    if payload.name and payload.name != role.name:
        dup = db.query(Role).filter(Role.name == payload.name).first()
        if dup:
            raise HTTPException(status_code=400, detail="Role name already exists")
        role.name = payload.name

    if payload.is_active is not None:
        if payload.code == "ADMIN":
            if payload.is_active == False:
                raise HTTPException(status_code=400, detail="Cannot update status of Administrator")
        else:
            role.is_active = payload.is_active
            # TODO : Update casbin rule table and casbin rule memory

    role.updated_at = datetime.now()
    db.commit()
    db.refresh(role)
    return role


@router.delete("/roles/{role_id}", name="delete_role")
def delete_role(role_id: str, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.code == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot delete Administrator")
    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}