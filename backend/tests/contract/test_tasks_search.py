"""
Contract test for search endpoint
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


def test_search_tasks_by_title(client: TestClient):
    """Test searching tasks by title"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks
        task_data_1 = {
            "title": "Meeting with John",
            "description": "Discuss project timeline",
            "user_id": mock_user_id
        }

        task_data_2 = {
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "user_id": mock_user_id
        }

        client.post("/api/tasks/", json=task_data_1)
        client.post("/api/tasks/", json=task_data_2)

        # Search for "meeting"
        response = client.get("/api/tasks/search/?q=meeting")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["query"] == "meeting"
        assert len(data["data"]) >= 1
        found_task = any("Meeting" in task["title"] for task in data["data"])
        assert found_task


def test_search_tasks_by_description(client: TestClient):
    """Test searching tasks by description"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks
        task_data_1 = {
            "title": "Project Review",
            "description": "Review quarterly budget proposal with finance team",
            "user_id": mock_user_id
        }

        task_data_2 = {
            "title": "Team Lunch",
            "description": "Weekly team lunch at the restaurant",
            "user_id": mock_user_id
        }

        client.post("/api/tasks/", json=task_data_1)
        client.post("/api/tasks/", json=task_data_2)

        # Search for "budget"
        response = client.get("/api/tasks/search/?q=budget")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["query"] == "budget"
        assert len(data["data"]) >= 1
        found_task = any("budget" in task["description"] for task in data["data"])
        assert found_task


def test_search_tasks_by_tags(client: TestClient):
    """Test searching tasks by tags"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks with tags
        task_data_1 = {
            "title": "Work Task",
            "description": "Important work task",
            "tags": ["work", "urgent"],
            "user_id": mock_user_id
        }

        task_data_2 = {
            "title": "Personal Task",
            "description": "Personal errands",
            "tags": ["personal", "home"],
            "user_id": mock_user_id
        }

        client.post("/api/tasks/", json=task_data_1)
        client.post("/api/tasks/", json=task_data_2)

        # Search for "work"
        response = client.get("/api/tasks/search/?q=work")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["query"] == "work"
        assert len(data["data"]) >= 1
        found_task = any("work" in task["tags"] for task in data["data"])
        assert found_task