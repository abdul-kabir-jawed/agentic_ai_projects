"""
Integration tests for API endpoints.
Tests full request/response cycle with authentication and database.
"""

import pytest
from fastapi.testclient import TestClient


class TestCreateTask:
    def test_create_task_success(self, client, auth_headers):
        payload = {
            "description": "Buy groceries",
            "priority": "high",
            "tags": "shopping,urgent",
        }
        response = client.post(
            "/api/v1/tasks",
            json=payload,
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Buy groceries"


class TestListTasks:
    def test_list_tasks_empty(self, client, auth_headers, test_user):
        response = client.get("/api/v1/tasks", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data


class TestGetTask:
    def test_get_task_success(self, client, auth_headers, sample_task):
        response = client.get(
            f"/api/v1/tasks/{sample_task.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_task.id


class TestUpdateTask:
    def test_update_task_success(self, client, auth_headers, sample_task):
        payload = {
            "description": "Updated description",
            "priority": "low",
        }
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            json=payload,
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestCompleteTask:
    def test_complete_task_success(self, client, auth_headers, sample_task):
        response = client.patch(
            f"/api/v1/tasks/{sample_task.id}/complete",
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestDeleteTask:
    def test_delete_task_success(self, client, auth_headers, sample_task):
        response = client.delete(
            f"/api/v1/tasks/{sample_task.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204
