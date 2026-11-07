
from app.core.security import (
    hash_password,
    verify_password,
)


def test_password_hashing():
    password = "TestPassword@123"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$argon2")
    assert verify_password(password, hashed)


def test_wrong_password():
    hashed = hash_password("CorrectPassword@123")

    assert not verify_password(
        "WrongPassword@123",
        hashed,
    )


def test_unique_password_hashes():
    first = hash_password("SamePassword@123")
    second = hash_password("SamePassword@123")

    assert first != second
    assert verify_password("SamePassword@123", first)
    assert verify_password("SamePassword@123", second)
