from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, ForeignKey
from sqlalchemy.types import String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from typing import Optional
from datetime import datetime
import uuid


class TagBase(SQLModel):
    name: str = Field(min_length=1, max_length=50)
    color: Optional[str] = Field(default=None)


class Tag(TagBase, table=True):
    """
    Tag model representing category labels that can be assigned to tasks for organization
    """
    __tablename__ = "tags"  # Explicit table name

    id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4))
    name: str = Field(sa_column=Column(String(50), nullable=False), min_length=1, max_length=50)
    color: Optional[str] = Field(sa_column=Column(String(7)), default=None)  # Hex color code
    user_id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False))
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)

    # Relationship to user
    user: "User" = Relationship(back_populates="tags")


class TagCreate(TagBase):
    name: str
    user_id: uuid.UUID


class TagRead(TagBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime


class TagUpdate(SQLModel):
    name: Optional[str] = None
    color: Optional[str] = None