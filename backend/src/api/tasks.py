from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import uuid

from ..models.task import Task, TaskCreate, TaskRead, TaskUpdate
from ..models.user import User
from ..database.database import get_session
from ..services.auth_service import get_current_user_id
from ..services.task_service_dapr import create_task as dapr_create_task, get_task_by_id as dapr_get_task_by_id, get_tasks as dapr_get_tasks, update_task as dapr_update_task, delete_task as dapr_delete_task, toggle_task_completion as dapr_toggle_task_completion


router = APIRouter()


@router.post("/", response_model=TaskRead)
def create_task(task_create: TaskCreate, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Create a new task for the current user"""
    # Use the Dapr-enhanced task service to create the task and publish event
    from uuid import UUID

    # Convert the current_user_id to UUID and create a TaskCreate object with the proper user_id
    task_create_dict = task_create.dict()
    task_create_dict['user_id'] = UUID(current_user_id)

    # Create a TaskCreate object with the converted user_id
    updated_task_create = TaskCreate(**task_create_dict)

    # Use the Dapr-enhanced service
    db_task = dapr_create_task(session=session, task_create=updated_task_create)

    return db_task


@router.get("/", response_model=List[TaskRead])
def get_tasks(current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get all tasks for the current user"""
    from uuid import UUID

    user_uuid = UUID(current_user_id)

    # Use the Dapr-enhanced task service
    tasks = dapr_get_tasks(session=session, user_id=user_uuid)

    return tasks


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: uuid.UUID, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get a specific task by ID for the current user"""
    from uuid import UUID

    user_uuid = UUID(current_user_id)

    # Use the Dapr-enhanced task service
    task = dapr_get_task_by_id(session=session, task_id=task_id, user_id=user_uuid)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: uuid.UUID, task_update: TaskUpdate, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Update a specific task by ID for the current user"""
    from uuid import UUID

    user_uuid = UUID(current_user_id)

    # Use the Dapr-enhanced task service
    db_task = dapr_update_task(session=session, task_id=task_id, task_update=task_update, user_id=user_uuid)

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return db_task


@router.delete("/{task_id}")
def delete_task(task_id: uuid.UUID, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Delete a specific task by ID for the current user"""
    from uuid import UUID

    user_uuid = UUID(current_user_id)

    # Use the Dapr-enhanced task service
    success = dapr_delete_task(session=session, task_id=task_id, user_id=user_uuid)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/toggle-complete", response_model=TaskRead)
def toggle_task_completion(task_id: uuid.UUID, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Toggle the completion status of a task for the current user"""
    from uuid import UUID

    user_uuid = UUID(current_user_id)

    # Use the Dapr-enhanced task service
    db_task = dapr_toggle_task_completion(session=session, task_id=task_id, user_id=user_uuid)

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

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