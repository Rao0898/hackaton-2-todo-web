from sqlmodel import create_engine, SQLModel, Session
from typing import Generator
from .config import DATABASE_URL
import os


# Create the database engine
# Check if sslmode is already specified in the URL, otherwise default to require for Neon
if DATABASE_URL.startswith("postgresql://"):
    # Check if sslmode is already specified in the URL
    if "sslmode" not in DATABASE_URL:
        separator = "&" if "?" in DATABASE_URL else "?"
        # Default to require for Neon, but allow disable when needed
        DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=prefer"

# Determine if SSL is disabled in the URL to configure the engine appropriately
ssl_disabled = "sslmode=disable" in DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=bool(os.getenv("DEBUG", False)),  # Set DEBUG=1 to enable SQL logging
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    connect_args={"sslmode": "disable"} if ssl_disabled else {},
)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get a database session
    """
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """
    Create database tables
    """
    from ..models.user import User
    from ..models.task import Task
    from ..models.tag import Tag
    from ..models.conversation import Conversation
    from ..models.message import Message
    from sqlalchemy import text

    try:
        # Attempt to establish a connection first
        with Session(engine) as session:
            # Just try to execute a simple query to test the connection
            session.exec(text("SELECT 1"))

        # If connection is successful, create tables
        SQLModel.metadata.create_all(engine)
        print("Database tables created successfully!")
        return True
    except Exception as e:
        print(f"WARNING: Could not connect to database during startup: {e}")
        print("Application will continue running but database operations will fail until connection is restored.")
        print("Please check your DATABASE_URL environment variable.")
        return False