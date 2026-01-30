"""
Service for handling recurring task logic
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session
import calendar

from ..models.task import Task


def calculate_next_occurrence_date(current_date: datetime, recurrence_type: str, interval: int) -> datetime:
    """
    Calculate the next occurrence date based on recurrence type and interval
    """
    if recurrence_type == 'daily':
        return current_date + timedelta(days=interval)
    elif recurrence_type == 'weekly':
        return current_date + timedelta(weeks=interval)
    elif recurrence_type == 'monthly':
        # For monthly, we add the interval in months (approximate)
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


def create_next_occurrence(session: Session, task: Task) -> Optional[Task]:
    """
    Create the next occurrence of a recurring task
    """
    if not task.recurrence_pattern or not task.recurrence_pattern.get('type'):
        return None

    recurrence_type = task.recurrence_pattern['type']
    interval = task.recurrence_pattern.get('interval', 1)
    end_date = task.recurrence_pattern.get('end_date')

    # Calculate the next occurrence date
    current_date = task.next_occurrence or task.created_at
    next_date = calculate_next_occurrence_date(current_date, recurrence_type, interval)

    # If end date is reached, don't create new occurrence
    if end_date and next_date > end_date:
        return None

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
    session.commit()
    session.refresh(new_task)

    return new_task