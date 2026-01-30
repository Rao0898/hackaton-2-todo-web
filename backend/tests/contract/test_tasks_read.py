"""
Contract test for get all tasks endpoint
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool
from unittest.mock import patch
from datetime import datetime

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


def test_get_all_tasks_empty(client: TestClient):
    """Test getting all tasks when none exist"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        response = client.get("/api/tasks/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


def test_get_all_tasks_with_data(client: TestClient):
    """Test getting all tasks when some exist"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # First, create a task
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": "medium",
            "tags": ["test"],
            "user_id": mock_user_id
        }

        create_response = client.post("/api/tasks/", json=task_data)
        assert create_response.status_code == 200

        # Now get all tasks
        response = client.get("/api/tasks/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["title"] == "Test Task"
        assert data[0]["description"] == "Test Description"
        assert data[0]["priority"] == "medium"


def test_get_all_tasks_with_filters(client: TestClient):
    """Test getting all tasks with filters"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create tasks with different priorities
        task_data_1 = {
            "title": "High Priority Task",
            "description": "Test Description",
            "priority": "high",
            "user_id": mock_user_id
        }

        task_data_2 = {
            "title": "Low Priority Task",
            "description": "Test Description",
            "priority": "low",
            "user_id": mock_user_id
        }

        create_response_1 = client.post("/api/tasks/", json=task_data_1)
        create_response_2 = client.post("/api/tasks/", json=task_data_2)

        assert create_response_1.status_code == 200
        assert create_response_2.status_code == 200

        # Get tasks filtered by priority
        response = client.get("/api/tasks/?priority=high")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["title"] == "High Priority Task"
        assert data[0]["priority"] == "high"