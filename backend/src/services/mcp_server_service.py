from typing import Dict, Any, List
from sqlmodel import Session, select
from uuid import UUID
from ..models.task import Task, TaskRead
from ..models.user import User
from datetime import datetime

class MCPServerService:
    """
    MCP Server service that exposes task operations to the AI agent
    """

    def __init__(self, session: Session):
        self.session = session

    def add_task(self, title: str, description: str, user_id: str, due_date: str = None, time: str = None) -> Dict[str, Any]:
        """
        Add a new task for the specified user

        Args:
            title: Task title
            description: Task description
            user_id: ID of the user who owns the task
            due_date: Due date of the task in YYYY-MM-DD format (optional)
            time: Time of the task in HH:MM format (optional)

        Returns:
            Dictionary with task information
        """
        try:
            from ..models.task import Task, PriorityEnum
            from uuid import UUID

            # Convert user_id to UUID
            user_uuid = UUID(user_id)

            # Combine due_date and time if both are provided
            combined_due_date = None
            if due_date:
                if time:
                    # Combine date and time
                    combined_due_date = f"{due_date}T{time}:00"
                else:
                    # Just date
                    combined_due_date = f"{due_date}T00:00:00"

            # Create new task
            db_task = Task(
                title=title,
                description=description,
                priority=PriorityEnum.medium,  # Default priority
                user_id=user_uuid,
                due_date=combined_due_date
            )

            self.session.add(db_task)
            self.session.commit()
            self.session.refresh(db_task)

            # Convert to TaskRead for response
            task_read = TaskRead.from_orm(db_task) if hasattr(TaskRead, 'from_orm') else TaskRead(**db_task.dict())

            return {
                "success": True,
                "message": "Task added successfully",
                "task": task_read.dict() if hasattr(task_read, 'dict') else task_read.__dict__
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error adding task: {str(e)}"
            }

    def list_tasks(self, user_id: str, status_filter: str = "all") -> Dict[str, Any]:
        """
        List tasks for the specified user with optional status filtering

        Args:
            user_id: ID of the user whose tasks to list
            status_filter: Filter by status ("all", "pending", "completed")

        Returns:
            Dictionary with list of tasks
        """
        try:
            from ..models.task import Task
            from uuid import UUID

            # Convert user_id to UUID
            user_uuid = UUID(user_id)

            # Build query based on status filter
            query = select(Task).where(Task.user_id == user_uuid)

            if status_filter == "pending":
                query = query.where(Task.completed == False)
            elif status_filter == "completed":
                query = query.where(Task.completed == True)
            # For "all", no additional filter needed

            tasks = self.session.exec(query).all()

            # Convert to TaskRead objects
            task_list = []
            for task in tasks:
                task_read = TaskRead.from_orm(task) if hasattr(TaskRead, 'from_orm') else TaskRead(**task.dict())
                task_list.append(task_read.dict() if hasattr(task_read, 'dict') else task_read.__dict__)

            return {
                "success": True,
                "message": f"Retrieved {len(task_list)} tasks",
                "tasks": task_list
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error listing tasks: {str(e)}"
            }

    def complete_task(self, task_id: str) -> Dict[str, Any]:
        """
        Mark a task as complete

        Args:
            task_id: ID of the task to mark as complete

        Returns:
            Dictionary with operation result
        """
        try:
            from ..models.task import Task
            from uuid import UUID

            # Convert task_id to UUID
            task_uuid = UUID(task_id)

            # Find the task
            statement = select(Task).where(Task.id == task_uuid)
            task = self.session.exec(statement).first()

            if not task:
                return {
                    "success": False,
                    "message": "Task not found"
                }

            # Update task completion status
            task.completed = True
            task.completed_at = datetime.utcnow()

            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

            # Convert to TaskRead for response
            task_read = TaskRead.from_orm(task) if hasattr(TaskRead, 'from_orm') else TaskRead(**task.dict())

            return {
                "success": True,
                "message": "Task marked as complete",
                "task": task_read.dict() if hasattr(task_read, 'dict') else task_read.__dict__
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error completing task: {str(e)}"
            }

    def delete_task(self, task_id: str) -> Dict[str, Any]:
        """
        Delete a task

        Args:
            task_id: ID of the task to delete

        Returns:
            Dictionary with operation result
        """
        try:
            from ..models.task import Task
            from uuid import UUID

            # Convert task_id to UUID
            task_uuid = UUID(task_id)

            # Find the task
            statement = select(Task).where(Task.id == task_uuid)
            task = self.session.exec(statement).first()

            if not task:
                return {
                    "success": False,
                    "message": "Task not found"
                }

            # Delete the task
            self.session.delete(task)
            self.session.commit()

            return {
                "success": True,
                "message": "Task deleted successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error deleting task: {str(e)}"
            }

    def update_task(self, task_id: str, title: str = None, description: str = None) -> Dict[str, Any]:
        """
        Update a task's title or description

        Args:
            task_id: ID of the task to update
            title: New title (optional)
            description: New description (optional)

        Returns:
            Dictionary with operation result
        """
        try:
            from ..models.task import Task
            from uuid import UUID

            # Convert task_id to UUID
            task_uuid = UUID(task_id)

            # Find the task
            statement = select(Task).where(Task.id == task_uuid)
            task = self.session.exec(statement).first()

            if not task:
                return {
                    "success": False,
                    "message": "Task not found"
                }

            # Update fields if provided
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description

            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

            # Convert to TaskRead for response
            task_read = TaskRead.from_orm(task) if hasattr(TaskRead, 'from_orm') else TaskRead(**task.dict())

            return {
                "success": True,
                "message": "Task updated successfully",
                "task": task_read.dict() if hasattr(task_read, 'dict') else task_read.__dict__
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error updating task: {str(e)}"
            }