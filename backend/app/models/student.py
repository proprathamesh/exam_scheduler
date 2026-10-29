
from sqlalchemy import BigInteger, ForeignKey, Identity, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(
        BigInteger, Identity(), primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    roll_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )

    program: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    batch: Mapped[str] = mapped_column(
        String(20), nullable=False
    )

    user = relationship("User", back_populates="student")
