from sqlmodel import SQLModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
import uuid


class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class RecurrencePattern(BaseModel):
    type: str  # daily, weekly, monthly, yearly
    interval: int
    end_date: Optional[datetime] = None


class TaskBase(SQLModel):
    title: str = ""
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    tags: Optional[List[str]] = []
    due_date: Optional[datetime] = None
    recurrence_pattern: Optional[Dict[str, Any]] = None
    completed: bool = False
    completed_at: Optional[datetime] = None
    next_occurrence: Optional[datetime] = None


class TaskCreateRequest(TaskBase):
    """Schema for task creation request - user_id will be added by the backend"""
    title: str


class TaskCreate(TaskBase):
    title: str
    user_id: str  # Changed to str to match UUID string from auth


class TaskRead(TaskBase):
    id: uuid.UUID  # Use UUID type
    user_id: uuid.UUID  # Use UUID type
    created_at: datetime
    updated_at: datetime


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    recurrence_pattern: Optional[Dict[str, Any]] = None
    completed: Optional[bool] = None
    next_occurrence: Optional[datetime] = None