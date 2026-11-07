
from email_validator import validate_email, EmailNotValidError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password


ALLOWED_ROLES = {"admin", "faculty", "student"}


class UserAlreadyExistsError(ValueError):
    pass


def create_user(
    db: Session,
    email: str,
    password: str,
    role: str,
) -> User:

    if role not in ALLOWED_ROLES:
        raise ValueError("Invalid user role")

    try:
        email = validate_email(
            email.strip(),
            check_deliverability=False,
        ).normalized.lower()
    except EmailNotValidError as exc:
        raise ValueError("Invalid email address") from exc

    if len(password) < 8:
        raise ValueError(
            "Password must be at least 8 characters"
        )

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise UserAlreadyExistsError(
            "An account with this email already exists"
        )

    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
    )

    db.add(user)
    db.flush()

    return user
