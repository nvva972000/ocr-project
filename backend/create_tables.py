from database import Base, engine
import model.session
import model.user
import model.role
import model.user_roles
import model.feature
import model.feature_operation
import model.permission

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("All tables created!")