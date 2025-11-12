from sqlalchemy.orm import Session

from model.user import User


def sync_user_roles(db: Session, enforcer, user: User):
    if not user:
        return

    subject = user.username
    if not subject:
        subject = user.id

    enforcer.delete_roles_for_user(subject)

    for role in getattr(user, "roles", []) or []:
        enforcer.add_grouping_policy(subject, role.name)

    enforcer.save_policy()
