"""
Contract test for recurring task functionality
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool
from unittest.mock import patch
from datetime import datetime, timedelta

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


def test_create_recurring_task(client: TestClient):
    """Test creating a recurring task"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create a daily recurring task
        task_data = {
            "title": "Daily Exercise",
            "description": "30 minutes of exercise",
            "priority": "medium",
            "tags": ["health", "routine"],
            "recurrence_pattern": {
                "type": "daily",
                "interval": 1
            },
            "user_id": mock_user_id
        }

        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Daily Exercise"
        assert data["recurrence_pattern"]["type"] == "daily"
        assert data["recurrence_pattern"]["interval"] == 1


def test_create_weekly_recurring_task(client: TestClient):
    """Test creating a weekly recurring task"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create a weekly recurring task
        task_data = {
            "title": "Weekly Team Meeting",
            "description": "Team sync meeting",
            "priority": "high",
            "tags": ["work", "meeting"],
            "recurrence_pattern": {
                "type": "weekly",
                "interval": 1
            },
            "user_id": mock_user_id
        }

        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Weekly Team Meeting"
        assert data["recurrence_pattern"]["type"] == "weekly"
        assert data["recurrence_pattern"]["interval"] == 1


def test_create_monthly_recurring_task(client: TestClient):
    """Test creating a monthly recurring task"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create a monthly recurring task
        task_data = {
            "title": "Monthly Budget Review",
            "description": "Review monthly expenses",
            "priority": "medium",
            "tags": ["finance", "review"],
            "recurrence_pattern": {
                "type": "monthly",
                "interval": 1
            },
            "user_id": mock_user_id
        }

        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Monthly Budget Review"
        assert data["recurrence_pattern"]["type"] == "monthly"
        assert data["recurrence_pattern"]["interval"] == 1