from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def main():
    email = input("Admin email: ").strip().lower()
    password = getpass("New password (minimum 12 characters): ")
    confirm = getpass("Confirm new password: ")

    if len(password) < 12:
        print("Password must be at least 12 characters.")
        return

    if password != confirm:
        print("Passwords do not match.")
        return

    with SessionLocal() as db:
        user = db.scalar(
            select(User).where(User.email == email)
        )

        if user is None or user.role != "admin":
            print("Admin account not found.")
            return

        user.password_hash = hash_password(password)
        db.commit()

    print("Admin password updated successfully.")


if __name__ == "__main__":
    main()