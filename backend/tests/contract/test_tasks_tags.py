"""
Contract test for tag assignment functionality
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


def test_create_task_with_tags(client: TestClient):
    """Test creating a task with tags"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Test creating a task with tags
        task_data = {
            "title": "Task with Tags",
            "description": "Test Description",
            "tags": ["work", "important", "urgent"],
            "user_id": mock_user_id
        }

        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert "work" in data["tags"]
        assert "important" in data["tags"]
        assert "urgent" in data["tags"]
        assert len(data["tags"]) == 3


def test_update_task_with_tags(client: TestClient):
    """Test updating a task with tags"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create a task first
        task_data = {
            "title": "Initial Task",
            "description": "Initial Description",
            "tags": ["initial"],
            "user_id": mock_user_id
        }

        create_response = client.post("/api/tasks/", json=task_data)
        assert create_response.status_code == 200
        initial_task = create_response.json()
        task_id = initial_task["id"]

        # Update the task with new tags
        update_data = {
            "tags": ["updated", "changed", "new"]
        }

        update_response = client.put(f"/api/tasks/{task_id}", json=update_data)
        assert update_response.status_code == 200
        updated_task = update_response.json()
        assert "updated" in updated_task["tags"]
        assert "changed" in updated_task["tags"]
        assert "new" in updated_task["tags"]
        assert "initial" not in updated_task["tags"]  # Old tag should be gone
        assert len(updated_task["tags"]) == 3


def test_get_tasks_filtered_by_tags(client: TestClient):
    """Test getting tasks filtered by tags (through search endpoint)"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks with different tags
        task_data_1 = {
            "title": "Work Task",
            "description": "Work related task",
            "tags": ["work", "important"],
            "user_id": mock_user_id
        }

        task_data_2 = {
            "title": "Personal Task",
            "description": "Personal task",
            "tags": ["personal", "home"],
            "user_id": mock_user_id
        }

        create_response_1 = client.post("/api/tasks/", json=task_data_1)
        create_response_2 = client.post("/api/tasks/", json=task_data_2)
        assert create_response_1.status_code == 200
        assert create_response_2.status_code == 200

        # Search for tasks with "work" tag
        search_response = client.get("/api/tasks/search/?q=work")
        assert search_response.status_code == 200
        search_data = search_response.json()
        assert search_data["success"] is True
        assert search_data["total_results"] >= 1
        found_work_task = any("work" in task["tags"] for task in search_data["data"])
        assert found_work_task