
from sqlalchemy import BigInteger, ForeignKey, Identity, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Faculty(Base):
    __tablename__ = "faculty"

    id: Mapped[int] = mapped_column(
        BigInteger, Identity(), primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    employee_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )

    department: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    user = relationship("User", back_populates="faculty")
