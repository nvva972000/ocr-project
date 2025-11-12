from abc import ABC, abstractmethod
from typing import Tuple
from model.user import User as UserEntity


class UserInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def get_users(self, q: str, page: int, page_size: int) -> Tuple:
        pass

    @abstractmethod
    def get_user_by_id(self, user_id: str) -> UserEntity:
        pass

    @abstractmethod
    def get_user_by_email(self, email: str) -> UserEntity:
        pass

    @abstractmethod
    def get_users_from_api(self) -> list:
        pass

    @abstractmethod
    def insert_users(self, users: [UserEntity]) -> bool:
        pass

    @abstractmethod
    def delete_user(self, user: UserEntity) -> bool:
        pass

    @abstractmethod
    def search_user_by_username(self, username: str) -> list:
        pass

    @abstractmethod
    def search_user_by_email(self, email: str) -> list:
        pass

    @abstractmethod
    def assign_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        pass

    @abstractmethod
    def remove_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        pass

    @abstractmethod
    def get_user_roles(self, user_id: str) -> list:
        pass

    @abstractmethod
    def update_user_roles(self, user_id: str, role_ids: list) -> bool:
        pass

    @abstractmethod
    def get_users_by_role(self, role_id: str, q: str, page: int, page_size: int) -> Tuple:
        pass