from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "")
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "3306")
db_name = os.getenv("DB_NAME", "cabana_db")

DATABASE_URL = (
    "mysql+pymysql://"
    f"{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
)

ssl_ca_path = os.getenv("DB_SSL_CA")
ssl_required = os.getenv("DB_SSL_MODE", "required").lower() == "required"
connect_args = {}

if ssl_ca_path:
    connect_args["ssl"] = {"ca": ssl_ca_path}
elif ssl_required:
    # Require TLS even if a custom CA isn't provided
    connect_args["ssl"] = {}

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
    echo=False  # Set to True for SQL query logging in development
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection and log result"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ MySQL connected successfully")
        return True
    except Exception as e:
        print(f"❌ MySQL connection error: {e}")
        return False
