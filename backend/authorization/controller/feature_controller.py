from typing import Optional
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from model.feature import Feature
from authentication.dependencies import require_token
from authorization.dependencies import check_permission
import schemas


router = APIRouter(dependencies=[Depends(require_token), Depends(check_permission)])


@router.get("/features", response_model=schemas.PaginatedFeatureResponse, name="list_features")
def list_features(
    q: Optional[str] = Query(None, description="Search by feature name or code"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Feature)
    if q:
        like = f"%{q}%"
        query = query.filter((Feature.name.ilike(like)) | (Feature.code.ilike(like)))

    total = query.count()
    items = (
        query.order_by(Feature.created_at.desc())
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


@router.get("/features/{feature_id}", response_model=schemas.Feature, name="get_feature")
def get_feature(feature_id: str, db: Session = Depends(get_db)):
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature


@router.post("/features", response_model=schemas.Feature, name="create_feature")
def create_feature(payload: schemas.FeatureBase, db: Session = Depends(get_db)):
    if not payload.name or not payload.code:
        raise HTTPException(status_code=400, detail="Missing 'name' or 'code'")

    # Check duplicate by code
    existed = db.query(Feature).filter(Feature.code == payload.code).first()
    if existed:
        raise HTTPException(status_code=400, detail="Feature code already exists")

    now = datetime.now()
    data = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "code": payload.code,
        "created_at": now,
        "updated_at": now,
    }
    feature = Feature(data)
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature


@router.put("/features/{feature_id}", response_model=schemas.Feature, name="update_feature")
def update_feature(feature_id: str, payload: schemas.FeatureBase, db: Session = Depends(get_db)):
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    # Optional rename/update - check duplicate code when changed
    if payload.code and payload.code != feature.code:
        dup = db.query(Feature).filter(Feature.code == payload.code).first()
        if dup:
            raise HTTPException(status_code=400, detail="Feature code already exists")
        feature.code = payload.code

    if payload.name is not None:
        feature.name = payload.name

    feature.updated_at = datetime.now()
    db.commit()
    db.refresh(feature)
    return feature


@router.delete("/features/{feature_id}", name="delete_feature")
def delete_feature(feature_id: str, db: Session = Depends(get_db)):
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(feature)
    db.commit()
    return {"message": "Feature deleted successfully"}


