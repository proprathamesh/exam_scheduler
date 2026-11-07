
from unittest.mock import MagicMock

import pytest

from app.services.user_service import (
    create_user,
    UserAlreadyExistsError,
)
from app.core.security import verify_password


def test_create_student_user():
    db = MagicMock()
    db.scalar.return_value = None

    user = create_user(
        db,
        "Student@Example.com",
        "SecurePassword@123",
        "student",
    )

    assert user.email == "student@example.com"
    assert user.role == "student"
    assert user.is_active is True
    assert verify_password(
        "SecurePassword@123",
        user.password_hash,
    )

    db.add.assert_called_once_with(user)
    db.flush.assert_called_once()


def test_invalid_role_rejected():
    db = MagicMock()

    with pytest.raises(ValueError):
        create_user(
            db,
            "test@example.com",
            "SecurePassword@123",
            "superadmin",
        )

    db.add.assert_not_called()


def test_duplicate_user_rejected():
    db = MagicMock()
    db.scalar.return_value = object()

    with pytest.raises(UserAlreadyExistsError):
        create_user(
            db,
            "test@example.com",
            "SecurePassword@123",
            "student",
        )

    db.add.assert_not_called()


def test_short_password_rejected():
    db = MagicMock()

    with pytest.raises(ValueError):
        create_user(
            db,
            "test@example.com",
            "123",
            "student",
        )

    db.add.assert_not_called()
