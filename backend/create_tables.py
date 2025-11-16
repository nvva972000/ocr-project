from app.db.session import engine
from app.db.base import Base
# Import all models to register them
from app.models import (
    User, Role, Session, user_roles,
    Permission, Feature, FeatureOperation
)
from app.models.otp import OTP

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("All tables created!")