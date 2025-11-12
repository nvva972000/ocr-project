from abc import ABC, abstractmethod
from typing import Tuple
from model.session import Session as SessionEntity


class SessionInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def get_sessions(self, q: str, page: int, page_size: int) -> Tuple:
        pass

    @abstractmethod
    def get_session_by_id(self, session_id: str) -> SessionEntity:
        pass

    @abstractmethod
    def get_session_by_refresh_token(self, refresh_token: str) -> SessionEntity:
        pass

    @abstractmethod
    def get_session_by_sid(self, sid: str) -> SessionEntity:
        pass

    @abstractmethod
    def get_session_by_id_token(self, id_token: str) -> SessionEntity:
        pass

    @abstractmethod
    def create_session(self, session: SessionEntity) -> SessionEntity:
        pass

    @abstractmethod
    def update_session(self, session: SessionEntity, data: dict) -> SessionEntity:
        pass
