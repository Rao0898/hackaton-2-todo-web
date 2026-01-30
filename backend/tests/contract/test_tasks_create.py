"""
Contract test for create task endpoint
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool
from unittest.mock import patch

from backend.src.main import app
from backend.src.models.task import TaskCreate


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


def test_create_task_success(client: TestClient):
    """Test successful task creation"""
    # Mock user ID for the test
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    # Mock the authentication service to return the user ID
    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": "medium",
            "tags": ["test", "important"],
            "due_date": "2023-12-31T10:00:00",
            "recurrence_pattern": None,
            "completed": False,
            # Note: user_id is no longer required in the request body
        }

        response = client.post("/api/tasks/", json=task_data)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["description"] == "Test Description"
        assert data["priority"] == "medium"
        assert "test" in data["tags"]
        assert "important" in data["tags"]


def test_create_task_missing_title(client: TestClient):
    """Test task creation with missing title (should fail validation)"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        task_data = {
            "description": "Test Description",
            "priority": "medium",
            # Note: user_id is no longer required in the request body
        }

        response = client.post("/api/tasks/", json=task_data)

        assert response.status_code == 422  # Validation error