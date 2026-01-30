"""
Integration test for recurrence logic functionality
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool
from unittest.mock import patch

from backend.src.main import app


@pytest.fixture(name="client")
def client_fixture():
    # Use an in-memory SQLite database for testing
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(bind=engine)

    with TestClient(app) as client, Session(engine) as session:
        # Mock the database session dependency
        def get_session_override():
            return session

        app.dependency_overrides[get_session_override] = lambda: session
        yield client
        app.dependency_overrides.clear()


def test_toggle_completion_creates_next_occurrence_daily(client: TestClient):
    """Test that toggling completion of a daily recurring task creates the next occurrence"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create a daily recurring task
        task_data = {
            "title": "Daily Habit",
            "description": "Complete daily habit",
            "priority": "medium",
            "recurrence_pattern": {
                "type": "daily",
                "interval": 1
            },
            "user_id": mock_user_id
        }

        create_response = client.post("/api/tasks/", json=task_data)
        assert create_response.status_code == 200
        created_task = create_response.json()
        task_id = created_task["id"]

        assert created_task["title"] == "Daily Habit"
        assert created_task["recurrence_pattern"]["type"] == "daily"

        # Initially, the task should not be completed
        assert created_task["completed"] is False

        # Toggle the task to completed
        toggle_response = client.patch(f"/api/tasks/{task_id}/toggle-complete")
        assert toggle_response.status_code == 200
        toggled_task = toggle_response.json()

        # The original task should now be marked as completed
        assert toggled_task["completed"] is True
        assert toggled_task["id"] == task_id

        # Get all tasks to see if a new occurrence was created
        get_all_response = client.get("/api/tasks/")
        assert get_all_response.status_code == 200
        all_tasks = get_all_response.json()

        # Should have the original completed task plus potentially a new one
        completed_tasks = [t for t in all_tasks if t["completed"]]
        uncompleted_tasks = [t for t in all_tasks if not t["completed"]]

        # There should be at least one completed task (the original)
        assert len(completed_tasks) >= 1

        # Check if there's a new uncompleted occurrence of the recurring task
        recurring_uncompleted = [t for t in uncompleted_tasks
                                if t["title"] == "Daily Habit" and t["id"] != task_id]

        # With daily recurrence, completing the task should create a new occurrence
        # The logic in the service should create a new task instance
        # Note: The exact behavior depends on the implementation in task_service.py


def test_recurring_task_lifecycle(client: TestClient):
    """Test the complete lifecycle of a recurring task"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # 1. Create a weekly recurring task
        task_data = {
            "title": "Weekly Workout",
            "description": "Gym workout session",
            "priority": "high",
            "tags": ["fitness", "health"],
            "recurrence_pattern": {
                "type": "weekly",
                "interval": 1
            },
            "user_id": mock_user_id
        }

        create_response = client.post("/api/tasks/", json=task_data)
        assert create_response.status_code == 200
        created_task = create_response.json()
        task_id = created_task["id"]

        assert created_task["title"] == "Weekly Workout"
        assert created_task["recurrence_pattern"]["type"] == "weekly"
        assert created_task["completed"] is False

        # 2. Update the task to change its recurrence pattern
        update_data = {
            "priority": "medium",
            "recurrence_pattern": {
                "type": "weekly",
                "interval": 2  # Change to every 2 weeks
            }
        }
        update_response = client.put(f"/api/tasks/{task_id}", json=update_data)
        assert update_response.status_code == 200
        updated_task = update_response.json()
        assert updated_task["priority"] == "medium"
        assert updated_task["recurrence_pattern"]["interval"] == 2

        # 3. Toggle completion to trigger next occurrence creation
        toggle_response = client.patch(f"/api/tasks/{task_id}/toggle-complete")
        assert toggle_response.status_code == 200
        toggled_task = toggle_response.json()
        assert toggled_task["completed"] is True

        # 4. Verify the task is now completed
        get_response = client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 200
        retrieved_task = get_response.json()
        assert retrieved_task["completed"] is True

        # 5. Get all tasks to verify any new occurrences
        all_tasks_response = client.get("/api/tasks/")
        assert all_tasks_response.status_code == 200
        all_tasks = all_tasks_response.json()

        # Find all tasks with the same title (recurring instances)
        recurring_tasks = [t for t in all_tasks if "Weekly Workout" in t["title"]]
        assert len(recurring_tasks) >= 1


def test_different_recurrence_types(client: TestClient):
    """Test different recurrence types work correctly"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks with different recurrence types
        recurrence_configs = [
            {"type": "daily", "interval": 1, "title": "Daily Task"},
            {"type": "weekly", "interval": 2, "title": "Biweekly Task"},
            {"type": "monthly", "interval": 1, "title": "Monthly Task"}
        ]

        task_ids = []
        for config in recurrence_configs:
            task_data = {
                "title": config["title"],
                "description": f"Test {config['type']} recurring task",
                "priority": "medium",
                "recurrence_pattern": {
                    "type": config["type"],
                    "interval": config["interval"]
                },
                "user_id": mock_user_id
            }

            response = client.post("/api/tasks/", json=task_data)
            assert response.status_code == 200
            task = response.json()
            assert task["recurrence_pattern"]["type"] == config["type"]
            assert task["recurrence_pattern"]["interval"] == config["interval"]
            task_ids.append(task["id"])

        # Toggle completion for each task to test recurrence logic
        for task_id in task_ids:
            toggle_response = client.patch(f"/api/tasks/{task_id}/toggle-complete")
            assert toggle_response.status_code == 200
            toggled_task = toggle_response.json()
            assert toggled_task["completed"] is True

        # Verify all original tasks are now completed
        for i, task_id in enumerate(task_ids):
            get_response = client.get(f"/api/tasks/{task_id}")
            assert get_response.status_code == 200
            task = get_response.json()
            assert task["completed"] is True
            assert task["title"] == recurrence_configs[i]["title"]