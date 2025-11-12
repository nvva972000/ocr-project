import inject

from typing import Tuple
from repository.session.session_interface import SessionInterface
from model.session import Session as SessionEntity
from util.utils import data_time_serialize


class SessionService:
    @inject.autoparams()
    def __init__(self, session: SessionInterface):
        self.__session = session

    def get_sessions(self, q: str, page: int, page_size: int) -> Tuple:
        sessions, count = self.__session.get_sessions(
            q=q, page=page, page_size=page_size
        )

        return (
            data_time_serialize([s.serialize for s in sessions]),
            count,
        )

    def get_session_by_id(self, session_id: str) -> SessionEntity:
        return self.__session.get_session_by_id(session_id=session_id)

    def get_session_by_refresh_token(self, refresh_token: str) -> SessionEntity:
        return self.__session.get_session_by_refresh_token(refresh_token=refresh_token)

    def get_session_by_sid(self, sid: str) -> SessionEntity:
        return self.__session.get_session_by_sid(sid=sid)

    def get_session_by_id_token(self, id_token: str) -> SessionEntity:
        return self.__session.get_session_by_id_token(id_token=id_token)

    def create_session(self, session: SessionEntity) -> SessionEntity:
        session = self.__session.create_session(session=session)
        # Serialize trước khi trả về để tránh DetachedInstanceError
        return data_time_serialize(session.serialize) if session else None

    def update_session(self, session: SessionEntity, data: dict) -> dict:
        session = self.__session.update_session(session=session, data=data)
        return data_time_serialize(session) if session else None
