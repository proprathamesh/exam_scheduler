
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.core.security import create_access_token


@pytest.fixture
def rbac_client():
    # Simulates a database user.
    user = SimpleNamespace(
        id=101,
        email="test@example.com",
        role="admin",
        is_active=True,
    )

    db = Mock()
    db.get.return_value = user

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client, user, db

    # Avoid affecting other tests.
    app.dependency_overrides.clear()


def authorized_get(client, path, user_id=101):
    token = create_access_token(user_id)
    return client.get(
        path,
        headers={"Authorization": f"Bearer {token}"},
    )


@pytest.mark.parametrize(
    "role,endpoint",
    [
        ("admin", "/api/v1/admin/dashboard"),
        ("faculty", "/api/v1/faculty/dashboard"),
        ("student", "/api/v1/student/dashboard"),
    ],
)
def test_allowed_roles(rbac_client, role, endpoint):
    client, user, db = rbac_client
    user.role = role

    response = authorized_get(client, endpoint)

    assert response.status_code == 200


@pytest.mark.parametrize(
    "role,endpoint",
    [
        ("student", "/api/v1/admin/dashboard"),
        ("faculty", "/api/v1/admin/dashboard"),
        ("admin", "/api/v1/faculty/dashboard"),
        ("admin", "/api/v1/student/dashboard"),
    ],
)
def test_forbidden_roles(rbac_client, role, endpoint):
    client, user, db = rbac_client
    user.role = role

    response = authorized_get(client, endpoint)

    assert response.status_code == 403


def test_unauthenticated_user(rbac_client):
    client, user, db = rbac_client

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == 401


def test_inactive_user(rbac_client):
    client, user, db = rbac_client
    user.is_active = False

    response = authorized_get(client, "/api/v1/admin/dashboard")

    assert response.status_code == 401


def test_nonexistent_user(rbac_client):
    client, user, db = rbac_client
    db.get.return_value = None

    response = authorized_get(client, "/api/v1/admin/dashboard")

    assert response.status_code == 401
