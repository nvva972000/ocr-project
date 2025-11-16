import uuid
from typing import Iterable, Set, Dict

from fastapi import FastAPI
from app.db.session import SessionLocal
from sqlalchemy import text
from app.models.feature import Feature


def _iter_api_operations(app: FastAPI) -> Iterable[tuple[str, str]]:
    for route in app.routes:
        name = getattr(route, "name", "") or ""
        tags = getattr(route, "tags", []) or []
        if not name or not tags:
            continue
        if not str(route.path).startswith("/api/v1/"):
            continue
        yield tags[0].upper(), name   # tag = feature_code, name = operation


def sync_feature_operations(app: FastAPI) -> int:
    entries = list(_iter_api_operations(app))
    if not entries:
        return 0

    with SessionLocal() as db:
        # lấy toàn bộ features trong DB
        features = db.query(Feature).all()
        code_to_feature: Dict[str, Feature] = {
            f.code.upper(): f for f in features if getattr(f, "code", None)
        }

        rows = []
        seen: Set[tuple[str, str]] = set()
        for feature_code, operation in entries:
            key = (feature_code, operation)
            if key in seen:
                continue
            seen.add(key)

            feature = code_to_feature.get(feature_code.upper())

            feature_id = getattr(feature, "id", "") if feature else ""

            rows.append((str(uuid.uuid4()), feature_id, feature_code.upper(), operation))

        if rows:
            sql = (
                "INSERT INTO feature_operations (id, feature_id, feature_code, operation) "
                "VALUES (:id, :feature_id, :feature_code, :operation) "
                "ON DUPLICATE KEY UPDATE "
                "feature_id = VALUES(feature_id), "
                "feature_code = VALUES(feature_code), "
                "operation = VALUES(operation), "
                "updated_at = NOW()"
            )
            param_dicts = [
                {
                    "id": r[0],
                    "feature_id": r[1],
                    "feature_code": r[2],
                    "operation": r[3],
                }
                for r in rows
            ]
            db.execute(text(sql), param_dicts)
            db.commit()

        return len(rows)

