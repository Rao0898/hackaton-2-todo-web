from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.types import String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from typing import Optional, List
from datetime import datetime
import uuid


class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)
    name: Optional[str] = Field(default=None)


class User(UserBase, table=True):
    """
    User model representing the application user with authentication details and preferences
    """
    __tablename__ = "user"  # Explicit table name

    id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4))
    email: str = Field(sa_column=Column(String(255), unique=True, nullable=False))
    password_hash: str = Field(sa_column=Column(String, nullable=False))
    name: Optional[str] = Field(sa_column=Column(String(100)), default=None)
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    is_active: bool = Field(sa_column=Column(Boolean), default=True)

    # Relationship to tasks
    tasks: List["Task"] = Relationship(back_populates="user")
    # Relationship to tags
    tags: List["Tag"] = Relationship(back_populates="user")


class UserCreate(SQLModel):
    email: str
    password: str
    name: Optional[str] = "User"


class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool