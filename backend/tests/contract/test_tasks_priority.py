"""
Contract test for priority filtering functionality
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


def test_create_task_with_priority(client: TestClient):
    """Test creating a task with different priority levels"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Test high priority
        task_data = {
            "title": "High Priority Task",
            "description": "Test Description",
            "priority": "high",
            "user_id": mock_user_id
        }

        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["priority"] == "high"

        # Test medium priority
        task_data["title"] = "Medium Priority Task"
        task_data["priority"] = "medium"
        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["priority"] == "medium"

        # Test low priority
        task_data["title"] = "Low Priority Task"
        task_data["priority"] = "low"
        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["priority"] == "low"


def test_get_tasks_filtered_by_priority(client: TestClient):
    """Test getting tasks filtered by priority"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks with different priorities
        priorities = ["high", "medium", "low"]
        for i, priority in enumerate(priorities):
            task_data = {
                "title": f"{priority.capitalize()} Priority Task {i}",
                "description": f"Test Description for {priority} priority",
                "priority": priority,
                "user_id": mock_user_id
            }
            response = client.post("/api/tasks/", json=task_data)
            assert response.status_code == 200

        # Get tasks filtered by high priority
        response = client.get("/api/tasks/?priority=high")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["priority"] == "high"

        # Get tasks filtered by medium priority
        response = client.get("/api/tasks/?priority=medium")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["priority"] == "medium"