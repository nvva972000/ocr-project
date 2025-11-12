import logging

from database import SessionLocal as Session
from sqlalchemy import or_
from typing import Tuple
from repository.session.session_interface import SessionInterface
from model.session import Session as SessionEntity


class SessionImplement(SessionInterface):
    def __init__(self):
        super().__init__()

    def get_sessions(self, q: str, page: int, page_size: int) -> Tuple:
        session = Session()
        try:
            query = session.query(SessionEntity)

            if q:
                text_search = f"%{q}%"
                query = query.filter(
                    or_(
                        SessionEntity.username.ilike(text_search),
                        SessionEntity.email.ilike(text_search),
                        SessionEntity.ip_address.ilike(text_search),
                    )
                )

            # count
            count = query.count()

            sessions = (
                query.order_by(SessionEntity.started.desc())
                .limit(page_size)
                .offset((page - 1) * page_size)
                .all()
            )

            if sessions:
                return sessions, count
        except Exception as e:
            logging.error(f"Error when get list of sessions: {e}")
        finally:
            session.close()

        return [], 0

    def get_session_by_id(self, session_id: str) -> SessionEntity:
        session_db = Session()
        try:
            session = (
                session_db.query(SessionEntity)
                .filter(
                    SessionEntity.id == session_id,
                )
                .first()
            )

            if session:
                return session
        except Exception as e:
            logging.error(f"Error when get session by id: {e}")
        finally:
            session_db.close()

        return None

    def get_session_by_refresh_token(self, refresh_token: str) -> SessionEntity:
        session_db = Session()
        try:
            session = (
                session_db.query(SessionEntity)
                .filter(
                    SessionEntity.refresh_token == refresh_token,
                )
                .first()
            )

            if session:
                return session
        except Exception as e:
            logging.error(f"Error when get session by refresh token: {e}")
        finally:
            session_db.close()

        return None

    def get_session_by_sid(self, sid: str) -> SessionEntity:
        session_db = Session()
        try:
            session = (
                session_db.query(SessionEntity)
                .filter(
                    SessionEntity.sid == sid,
                )
                .first()
            )

            if session:
                return session
        except Exception as e:
            logging.error(f"Error when get session by sid: {e}")
        finally:
            session_db.close()

        return None

    def get_session_by_id_token(self, id_token: str) -> SessionEntity:
        session_db = Session()
        try:
            session = (
                session_db.query(SessionEntity)
                .filter(
                    SessionEntity.id_token == id_token,
                )
                .first()
            )

            if session:
                return session
        except Exception as e:
            logging.error(f"Error when get session by id token: {e}")
        finally:
            session_db.close()

        return None

    def create_session(self, session: SessionEntity) -> SessionEntity:
        session_db = Session()
        try:
            session_db.add(session)
            session_db.commit()
            session_db.refresh(session)

            return session
        except Exception as e:
            session_db.rollback()
            logging.error(f"Error when create session: {e}")
        finally:
            session_db.close()

        return None

    def update_session(self, session: SessionEntity, data: dict) -> dict:
        session_db = Session()
        try:
            session = session_db.merge(session)

            if data.get("last_access") is not None:
                session.last_access = data.get("last_access")
            if data.get("refresh_token") is not None:
                session.refresh_token = data.get("refresh_token")
            if data.get("status") is not None:
                session.status = data.get("status")

            session_db.commit()
            # Serialize trước khi đóng session
            result = session.serialize
            return result
        except Exception as e:
            session_db.rollback()
            logging.error(f"Error when update session: {e}")
        finally:
            session_db.close()

        return None
