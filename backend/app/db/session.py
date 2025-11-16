from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
from app.core.config import settings

# URL encode the password to handle special characters
encoded_password = quote_plus(settings.DB_PASSWORD)
# PostgreSQL connection string
DATABASE_URL = f"postgresql://{settings.DB_USER}:{encoded_password}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

@event.listens_for(engine, "connect")
def set_time_zone(dbapi_connection, connection_record):
    pass
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

