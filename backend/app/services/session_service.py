import inject
from typing import Tuple

from app.repository.session.session_interface import SessionInterface
from app.models.session import Session as SessionEntity
from app.utils.utils import data_time_serialize


class SessionService:
    """Service for managing user sessions"""
    
    @inject.autoparams()
    def __init__(self, session: SessionInterface):
        self.__session = session

    # SESSION RETRIEVAL METHODS
    def get_sessions(self, q: str, page: int, page_size: int) -> Tuple:
        """Get paginated list of sessions with search query"""
        sessions, count = self.__session.get_sessions(
            q=q, page=page, page_size=page_size
        )
        return (
            data_time_serialize([s.serialize for s in sessions]),
            count,
        )

    def get_session_by_id(self, session_id: str) -> SessionEntity:
        """Get session by ID"""
        return self.__session.get_session_by_id(session_id=session_id)

    def get_session_by_refresh_token(self, refresh_token: str) -> SessionEntity:
        """Get session by refresh token"""
        return self.__session.get_session_by_refresh_token(refresh_token=refresh_token)

    def get_session_by_sid(self, sid: str) -> SessionEntity:
        """Get session by session ID (sid)"""
        return self.__session.get_session_by_sid(sid=sid)

    def get_session_by_id_token(self, id_token: str) -> SessionEntity:
        """Get session by ID token"""
        return self.__session.get_session_by_id_token(id_token=id_token)

    def get_active_sessions(self) -> list:
        """Get all active sessions"""
        sessions = self.__session.get_active_sessions()
        return data_time_serialize([s.serialize for s in sessions]) if sessions else []

    # SESSION CRUD OPERATIONS
    def create_session(self, session: SessionEntity) -> SessionEntity:
        """Create a new session"""
        session = self.__session.create_session(session=session)
        # Serialize before returning to avoid DetachedInstanceError
        return data_time_serialize(session.serialize) if session else None

    def update_session(self, session: SessionEntity, data: dict) -> dict:
        """Update session with new data"""
        session = self.__session.update_session(session=session, data=data)
        return data_time_serialize(session) if session else None

    # SESSION DELETION METHODS
    def delete_session_by_refresh_token(self, refresh_token: str) -> bool:
        """Delete session by refresh token"""
        return self.__session.delete_session_by_refresh_token(refresh_token=refresh_token)

    def delete_sessions_by_user_id(self, user_id: str) -> bool:
        """Delete all sessions for a user"""
        return self.__session.delete_sessions_by_user_id(user_id=user_id)

