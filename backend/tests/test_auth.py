
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.auth import router
from app.database import get_db
from app.core.security import (
    create_access_token,
    verify_access_token,
    hash_password,
)


@pytest.fixture
def auth_setup():
    # A fake database user for isolated API tests.
    # No actual PostgreSQL records will be changed.
    user = SimpleNamespace(
        id=1,
        email="admin@example.com",
        role="admin",
        is_active=True,
        password_hash=hash_password("SecurePassword123!"),
    )

    db = Mock()
    db.scalar.return_value = user
    db.get.return_value = user

    app = FastAPI()
    app.include_router(router)

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client, db, user


# Test 1: JWT generation, validation and tampering
def test_jwt_creation_and_verification():
    token = create_access_token(123)

    assert isinstance(token, str)
    assert verify_access_token(token) == 123

    # Modifying the token must invalidate it
    assert verify_access_token(token + "invalid") is None


# Test 2: Successful login
def test_login_success(auth_setup):
    client, db, user = auth_setup

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@example.com",
            "password": "SecurePassword123!",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["token_type"] == "bearer"
    assert verify_access_token(data["access_token"]) == 1


# Test 3: Incorrect password
def test_login_wrong_password(auth_setup):
    client, db, user = auth_setup

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@example.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401


# Test 4: Protected endpoint without authentication
def test_me_without_token(auth_setup):
    client, db, user = auth_setup

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


# Test 5: Protected endpoint with valid token
def test_me_with_valid_token(auth_setup):
    client, db, user = auth_setup

    token = create_access_token(user.id)

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["email"] == "admin@example.com"
    assert data["role"] == "admin"
    assert data["is_active"] is True
    assert "password_hash" not in data


# Test 6: Inactive user must be rejected
def test_inactive_user_rejected(auth_setup):
    client, db, user = auth_setup
    user.is_active = False

    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@example.com",
            "password": "SecurePassword123!",
        },
    )

    assert login_response.status_code == 401

    token = create_access_token(user.id)

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 401
