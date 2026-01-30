from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON, ForeignKey
from sqlalchemy.types import String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from enum import Enum


class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=10000)
    priority: PriorityEnum = Field(default=PriorityEnum.medium)
    tags: Optional[List[str]] = Field(default=[])
    due_date: Optional[datetime] = Field(default=None)
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = Field(default=None)


class Task(TaskBase, table=True):
    """
    Task model representing individual tasks with title, description, priority, tags,
    due_date, and completion status
    """
    __tablename__ = "tasks"  # Explicit table name

    id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4))
    title: str = Field(sa_column=Column(String(255), nullable=False))
    description: Optional[str] = Field(sa_column=Column(String(10000)), default=None)
    priority: PriorityEnum = Field(sa_column=Column(String(10), default=PriorityEnum.medium))
    tags: Optional[List[str]] = Field(sa_column=Column(JSON), default=[])
    due_date: Optional[datetime] = Field(sa_column=Column(DateTime), default=None)
    completed: bool = Field(sa_column=Column(Boolean), default=False)
    completed_at: Optional[datetime] = Field(sa_column=Column(DateTime), default=None)
    user_id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False))  # Foreign key reference to user table
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)

    # Relationship to user
    user: Optional["User"] = Relationship(back_populates="tasks")


class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    tags: Optional[List[str]] = []
    due_date: Optional[datetime] = None
    completed: bool = False
    completed_at: Optional[datetime] = None


class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None