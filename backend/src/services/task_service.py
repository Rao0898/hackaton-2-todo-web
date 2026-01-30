from typing import List, Optional
from sqlmodel import Session, select, and_, func
from datetime import datetime
from uuid import UUID
import json

from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate
from ..models.user import User


def create_task(*, session: Session, task_create: TaskCreate) -> Task:
    """
    Create a new task with user_id filtering
    """
    from uuid import UUID

    # Handle user_id conversion more safely
    if isinstance(task_create.user_id, UUID):
        user_id_uuid = task_create.user_id
    else:
        try:
            user_id_uuid = UUID(task_create.user_id)
        except ValueError:
            raise ValueError(f"Invalid user_id format: {task_create.user_id}")

    # Verify that the user_id in the request matches an existing user
    user_statement = select(User).where(User.id == user_id_uuid)
    user = session.exec(user_statement).first()

    if not user:
        raise ValueError(f"User with id {task_create.user_id} does not exist")

    # Create the task using model_validate with proper conversion
    task_data = task_create.dict()
    task_data['user_id'] = user_id_uuid  # Replace string user_id with UUID

    db_task = Task.model_validate(task_data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_task_by_id(*, session: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
    """
    Get a task by ID with user_id filtering to ensure user isolation
    """
    statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    task = session.exec(statement).first()
    return task


def get_tasks(*, session: Session, user_id: UUID,
              priority: Optional[str] = None,
              completed: Optional[bool] = None,
              due_after: Optional[datetime] = None,
              due_before: Optional[datetime] = None,
              search: Optional[str] = None,
              limit: int = 50,
              offset: int = 0) -> List[Task]:
    """
    Get all tasks for a user with optional filtering
    """
    statement = select(Task).where(Task.user_id == user_id)

    # Apply filters
    if priority:
        statement = statement.where(Task.priority == priority)

    if completed is not None:
        statement = statement.where(Task.completed == completed)

    if due_after:
        statement = statement.where(Task.due_date >= due_after)

    if due_before:
        statement = statement.where(Task.due_date <= due_before)

    # Apply search filter (search in title, description, and tags)
    if search:
        search_lower = f"%{search.lower()}%"
        statement = statement.where(
            (Task.title.ilike(search_lower)) |
            (Task.description.ilike(search_lower))
        )

    # Apply pagination
    statement = statement.offset(offset).limit(limit)

    tasks = session.exec(statement).all()
    return tasks


def update_task(*, session: Session, task_id: UUID, task_update: TaskUpdate, user_id: UUID) -> Optional[Task]:
    """
    Update a task with user_id filtering to ensure user isolation
    """
    statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    db_task = session.exec(statement).first()

    if not db_task:
        return None

    # Update task fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    # Update timestamp
    db_task.updated_at = datetime.now()

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def delete_task(*, session: Session, task_id: UUID, user_id: UUID) -> bool:
    """
    Delete a task with user_id filtering to ensure user isolation
    """
    statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    db_task = session.exec(statement).first()

    if not db_task:
        return False

    session.delete(db_task)
    session.commit()
    return True


def toggle_task_completion(*, session: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
    """
    Toggle the completion status of a task
    """
    statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    db_task = session.exec(statement).first()

    if not db_task:
        return None

    # Toggle completion status
    db_task.completed = not db_task.completed

    # Set completion timestamp
    if db_task.completed:
        db_task.completed_at = datetime.now()
    else:
        db_task.completed_at = None

    db_task.updated_at = datetime.now()

    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Handle recurring tasks - if completed and has recurrence pattern, create next occurrence
    # This is done after the main task is updated and returned to avoid delays in the response
    # Note: In a production system, this should be done asynchronously to avoid blocking
    if db_task.completed and db_task.recurrence_pattern:
        create_next_occurrence(session, db_task)

    return db_task


def create_next_occurrence(session: Session, task: Task):
    """
    Create the next occurrence of a recurring task
    """
    if not task.recurrence_pattern or not task.recurrence_pattern.get('type'):
        return

    recurrence_type = task.recurrence_pattern['type']
    interval = task.recurrence_pattern.get('interval', 1)
    end_date = task.recurrence_pattern.get('end_date')

    # Calculate the next occurrence date
    current_date = task.next_occurrence or task.due_date or task.created_at
    next_date = calculate_next_occurrence_date(current_date, recurrence_type, interval)

    # If end date is reached, don't create new occurrence
    if end_date and next_date > end_date:
        return

    # Create a new task instance with the same properties
    new_task_data = {
        'title': task.title,
        'description': task.description,
        'priority': task.priority,
        'tags': task.tags,
        'due_date': next_date,
        'recurrence_pattern': task.recurrence_pattern,
        'completed': False,
        'user_id': task.user_id,
        'next_occurrence': calculate_next_occurrence_date(next_date, recurrence_type, interval) if recurrence_type != 'daily' else None
    }

    new_task = Task(**new_task_data)
    session.add(new_task)
    session.commit()  # Commit the transaction to persist the new task
    session.refresh(new_task)  # Refresh to get the generated ID
    return new_task


def calculate_next_occurrence_date(current_date: datetime, recurrence_type: str, interval: int) -> datetime:
    """
    Calculate the next occurrence date based on recurrence type and interval
    """
    from datetime import timedelta

    if recurrence_type == 'daily':
        return current_date + timedelta(days=interval)
    elif recurrence_type == 'weekly':
        return current_date + timedelta(weeks=interval)
    elif recurrence_type == 'monthly':
        # For monthly, we add the interval in months (approximate)
        import calendar
        year = current_date.year
        month = current_date.month + interval

        # Adjust for year overflow
        while month > 12:
            year += 1
            month -= 12

        # Handle day overflow (e.g. Jan 31 + 1 month)
        max_day = calendar.monthrange(year, month)[1]
        day = min(current_date.day, max_day)

        return current_date.replace(year=year, month=month, day=day)
    elif recurrence_type == 'yearly':
        return current_date.replace(year=current_date.year + interval)
    else:
        # Default to daily if invalid type
        return current_date + timedelta(days=interval)


def search_tasks(*, session: Session, user_id: UUID,
                 query: str,
                 priority: Optional[str] = None,
                 completed: Optional[bool] = None,
                 tags: Optional[List[str]] = None) -> List[Task]:
    """
    Search tasks with multiple filters
    """
    statement = select(Task).where(Task.user_id == user_id)

    # Apply search query
    if query:
        search_lower = f"%{query.lower()}%"
        statement = statement.where(
            (Task.title.ilike(search_lower)) |
            (Task.description.ilike(search_lower))
        )

    # Apply additional filters
    if priority:
        statement = statement.where(Task.priority == priority)

    if completed is not None:
        statement = statement.where(Task.completed == completed)

    if tags:
        for tag in tags:
            statement = statement.where(Task.tags.contains([tag]))

    tasks = session.exec(statement).all()
    return tasks