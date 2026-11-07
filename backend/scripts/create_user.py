
from getpass import getpass

from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.services.user_service import (
    create_user,
    UserAlreadyExistsError,
)


def main():
    email = input("Email: ").strip()
    role = input(
        "Role (admin/faculty/student): "
    ).strip().lower()

    password = getpass("Password: ")
    confirm = getpass("Confirm password: ")

    if password != confirm:
        print("Passwords do not match.")
        return

    try:
        with SessionLocal.begin() as db:
            user = create_user(
                db=db,
                email=email,
                password=password,
                role=role,
            )
            db.flush()
            user_id = user.id

        print(f"User created successfully. ID: {user_id}")

    except UserAlreadyExistsError:
        print("An account with this email already exists.")

    except IntegrityError:
        print("Could not create user: database constraint violated.")

    except ValueError as exc:
        print(f"Validation error: {exc}")


if __name__ == "__main__":
    main()
