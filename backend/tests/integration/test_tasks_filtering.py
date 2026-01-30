"""
Integration test for keyword filtering functionality
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


def test_end_to_end_task_lifecycle_with_filtering(client: TestClient):
    """Test the complete lifecycle of a task with filtering capabilities"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # 1. Create a task
        task_data = {
            "title": "Complete project documentation",
            "description": "Write detailed documentation for the project",
            "priority": "high",
            "tags": ["documentation", "important", "work"],
            "user_id": mock_user_id
        }

        create_response = client.post("/api/tasks/", json=task_data)
        assert create_response.status_code == 200
        created_task = create_response.json()
        task_id = created_task["id"]
        assert created_task["title"] == "Complete project documentation"
        assert "documentation" in created_task["tags"]
        assert created_task["priority"] == "high"

        # 2. Retrieve all tasks (should include our task)
        get_all_response = client.get("/api/tasks/")
        assert get_all_response.status_code == 200
        all_tasks = get_all_response.json()
        assert len(all_tasks) == 1
        assert all_tasks[0]["id"] == task_id

        # 3. Filter by priority (high)
        get_filtered_response = client.get("/api/tasks/?priority=high")
        assert get_filtered_response.status_code == 200
        filtered_tasks = get_filtered_response.json()
        assert len(filtered_tasks) == 1
        assert filtered_tasks[0]["id"] == task_id

        # 4. Search by keyword
        search_response = client.get("/api/tasks/search/?q=documentation")
        assert search_response.status_code == 200
        search_results = search_response.json()
        assert search_results["success"] is True
        assert search_results["total_results"] >= 1
        found_task = any(task["id"] == task_id for task in search_results["data"])
        assert found_task

        # 5. Update the task
        update_data = {
            "completed": True
        }
        update_response = client.put(f"/api/tasks/{task_id}", json=update_data)
        assert update_response.status_code == 200
        updated_task = update_response.json()
        assert updated_task["completed"] is True

        # 6. Verify update via get request
        get_updated_response = client.get(f"/api/tasks/{task_id}")
        assert get_updated_response.status_code == 200
        assert get_updated_response.json()["completed"] is True

        # 7. Toggle completion status
        toggle_response = client.patch(f"/api/tasks/{task_id}/toggle-complete")
        assert toggle_response.status_code == 200
        toggled_task = toggle_response.json()
        assert toggled_task["completed"] is False  # Should be toggled back to False

        # 8. Delete the task
        delete_response = client.delete(f"/api/tasks/{task_id}")
        assert delete_response.status_code == 200

        # 9. Verify task is deleted
        get_deleted_response = client.get(f"/api/tasks/{task_id}")
        assert get_deleted_response.status_code == 404


def test_multiple_filters_integration(client: TestClient):
    """Test applying multiple filters together"""
    mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

    with patch("backend.src.services.auth_service.get_current_user_id", return_value=mock_user_id):
        # Create multiple tasks with different attributes
        tasks = [
            {
                "title": "Urgent Work Task",
                "description": "Critical work item",
                "priority": "high",
                "tags": ["work", "urgent"],
                "user_id": mock_user_id
            },
            {
                "title": "Low Priority Personal Task",
                "description": "Something to do eventually",
                "priority": "low",
                "tags": ["personal"],
                "user_id": mock_user_id
            },
            {
                "title": "Medium Priority Work Task",
                "description": "Regular work task",
                "priority": "medium",
                "tags": ["work"],
                "user_id": mock_user_id
            }
        ]

        # Create all tasks
        task_ids = []
        for task_data in tasks:
            response = client.post("/api/tasks/", json=task_data)
            assert response.status_code == 200
            task_ids.append(response.json()["id"])

        # Test filtering by priority and tags
        # Get high priority work tasks
        response = client.get("/api/tasks/?priority=high")
        assert response.status_code == 200
        high_priority_tasks = response.json()
        assert len(high_priority_tasks) >= 1
        # Verify all returned tasks have high priority
        for task in high_priority_tasks:
            assert task["priority"] == "high"

        # Search for work-related tasks
        search_response = client.get("/api/tasks/search/?q=work")
        assert search_response.status_code == 200
        work_tasks = search_response.json()
        assert work_tasks["success"] is True
        assert work_tasks["total_results"] >= 2  # Should find at least 2 work tasks