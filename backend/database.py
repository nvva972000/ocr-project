from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

# Database configuration
MYSQL_HOST = os.getenv('MYSQL_HOST', '103.160.78.221')
MYSQL_PORT = os.getenv('MYSQL_PORT', '3309')
MYSQL_DB_NAME = os.getenv('MYSQL_DB_NAME', 'test_portal')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'testportal@2025')

# URL encode the password to handle special characters
encoded_password = quote_plus(MYSQL_PASSWORD)
DATABASE_URL = f"mysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB_NAME}"

engine = create_engine(DATABASE_URL)

@event.listens_for(engine, "connect")
def set_time_zone(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("SET time_zone = '+07:00'")
    cursor.close()
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 