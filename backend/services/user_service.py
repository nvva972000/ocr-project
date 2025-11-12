import inject
import uuid
import logging

from typing import Tuple
from repository.user.user_interface import UserInterface
from model.user import User as UserEntity
from util.utils import data_time_serialize


class UserService:
    @inject.autoparams()
    def __init__(self, user: UserInterface):
        self.__user = user

    def get_users(self, q: str, page: int, page_size: int) -> Tuple:
        users, count = self.__user.get_users(q=q, page=page, page_size=page_size)

        return (
            data_time_serialize([user.serialize for user in users]),
            count,
        )

    def get_user_by_id(self, user_id: str) -> UserEntity:
        return self.__user.get_user_by_id(user_id=user_id)

    def get_user_by_email(self, email: str) -> UserEntity:
        return self.__user.get_user_by_email(email=email)

    def get_user_info_by_id(self, user_id: str) -> UserEntity:
        user = self.__user.get_user_by_id(user_id=user_id)
        return data_time_serialize(user.serialize) if user else None

    def insert_users(self, users: [UserEntity]) -> bool:
        return self.__user.insert_users(users=users)

    def delete_user(self, user: UserEntity) -> bool:
        return self.__user.delete_user(user=user)

    def sync_users_from_api(self) -> bool:
        users_response = self.__user.get_users_from_api()
        if not users_response or users_response.get("total", 0) == 0:
            return True

        users_data = users_response.get("data", [])
        if not users_data:
            return True

        try:
            existing_users = self.get_users(q="", page=1, page_size=100000)[0]
            existing_emails = set(user["email"] for user in existing_users)
            existing_ids = set(user["id"] for user in existing_users)

            new_users = []
            user_fields = set(c.name for c in UserEntity.__table__.columns)
            for user_dict in users_data:
                if "user_name" in user_dict:
                    user_dict["username"] = user_dict.pop("user_name")
                if not user_dict.get("id"):
                    user_dict["id"] = str(uuid.uuid4())
                filtered_data = {k: v for k, v in user_dict.items() if k in user_fields}
                if filtered_data["email"] not in existing_emails and filtered_data["id"] not in existing_ids:
                    user = UserEntity(filtered_data)
                    new_users.append(user)
            if new_users:
                logging.info(f"Sync users from API - insert {len(new_users)} new users")
                return self.insert_users(new_users)
            return True
        except Exception as e:
            logging.error(f"Error syncing users from API: {e}")
            return False

    def search_user_by_username(self, username: str) -> list:
        users = self.__user.search_user_by_username(username)
        return data_time_serialize([user.serialize for user in users])

    def search_user_by_email(self, email: str) -> list:
        users = self.__user.search_user_by_email(email)
        return data_time_serialize([user.serialize for user in users])

    def assign_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        """Assign roles to a user"""
        try:
            return self.__user.assign_roles_to_user(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error assigning roles to user {user_id}: {e}")
            return False

    def remove_roles_from_user(self, user_id: str, role_ids: list) -> bool:
        """Remove roles from a user"""
        try:
            return self.__user.remove_roles_to_user(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error removing roles from user {user_id}: {e}")
            return False

    def get_user_roles(self, user_id: str) -> list:
        """Get all roles assigned to a user"""
        try:
            roles = self.__user.get_user_roles(user_id)
            return data_time_serialize([role.serialize for role in roles]) if roles else []
        except Exception as e:
            logging.error(f"Error getting roles for user {user_id}: {e}")
            return []

    def update_user_roles(self, user_id: str, role_ids: list) -> bool:
        """Update user roles (replace all existing roles with new ones)"""
        try:
            return self.__user.update_user_roles(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error updating roles for user {user_id}: {e}")
            return False

    def get_users_by_role(self, role_id: str, q: str, page: int, page_size: int) -> Tuple:
        """Get all users assigned to a specific role"""
        try:
            users, count = self.__user.get_users_by_role(role_id, q=q, page=page, page_size=page_size)
            return (
                data_time_serialize([user.serialize for user in users]),
                count,
            )
        except Exception as e:
            logging.error(f"Error getting users for role {role_id}: {e}")
            return [], 0