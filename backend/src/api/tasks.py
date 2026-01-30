from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import uuid

from ..models.task import Task, TaskCreate, TaskRead, TaskUpdate
from ..models.user import User
from ..database.database import get_session
from ..services.auth_service import get_current_user_id


router = APIRouter()


@router.post("/", response_model=TaskRead)
def create_task(task_create: TaskCreate, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Create a new task for the current user"""
    # Convert current_user_id to UUID
    user_uuid = uuid.UUID(current_user_id)

    # Create task with current user's ID
    db_task = Task(
        title=task_create.title,
        description=task_create.description,
        priority=task_create.priority,
        tags=task_create.tags,
        due_date=task_create.due_date,
        completed=task_create.completed,
        completed_at=task_create.completed_at,
        user_id=user_uuid
    )

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return db_task


@router.get("/", response_model=List[TaskRead])
def get_tasks(current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get all tasks for the current user"""
    user_uuid = uuid.UUID(current_user_id)

    statement = select(Task).where(Task.user_id == user_uuid)
    tasks = session.exec(statement).all()

    return tasks


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: uuid.UUID, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get a specific task by ID for the current user"""
    user_uuid = uuid.UUID(current_user_id)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: uuid.UUID, task_update: TaskUpdate, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Update a specific task by ID for the current user"""
    user_uuid = uuid.UUID(current_user_id)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    db_task = session.exec(statement).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update task fields
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return db_task


@router.delete("/{task_id}")
def delete_task(task_id: uuid.UUID, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Delete a specific task by ID for the current user"""
    user_uuid = uuid.UUID(current_user_id)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    db_task = session.exec(statement).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(db_task)
    session.commit()

    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/toggle-complete", response_model=TaskRead)
def toggle_task_completion(task_id: uuid.UUID, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Toggle the completion status of a task for the current user"""
    user_uuid = uuid.UUID(current_user_id)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
    db_task = session.exec(statement).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    db_task.completed = not db_task.completed

    # Set completed_at timestamp if task is completed
    if db_task.completed:
        from datetime import datetime
        db_task.completed_at = datetime.utcnow()
    else:
        db_task.completed_at = None

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    return db_task


@router.get("/notifications/")
def get_notifications(current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get tasks due within the next 1 hour for the current user"""
    from datetime import datetime, timedelta, timezone

    user_uuid = uuid.UUID(current_user_id)

    # Calculate the time range: now to 1 hour from now
    now = datetime.now(timezone.utc)
    one_hour_later = now + timedelta(hours=1)

    # Query for incomplete tasks with due dates within the next hour
    statement = select(Task).where(
        Task.user_id == user_uuid,
        Task.completed == False,
        Task.due_date.is_not(None),
        Task.due_date >= now,
        Task.due_date <= one_hour_later
    ).order_by(Task.due_date.asc())

    notifications = session.exec(statement).all()

    # Return the array directly to allow frontend mapping, or empty array if none
    return notifications