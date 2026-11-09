from fastapi import APIRouter, Depends

from app.core.permissions import require_roles
from app.models.user import User

router = APIRouter(prefix="/api/v1", tags=["RBAC Testing"])


@router.get("/admin/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_roles("admin")),
):
    return {
        "message": "Welcome, Admin",
        "email": current_user.email,
    }


@router.get("/faculty/dashboard")
def faculty_dashboard(
    current_user: User = Depends(require_roles("faculty")),
):
    return {"message": "Welcome, Faculty"}


@router.get("/student/dashboard")
def student_dashboard(
    current_user: User = Depends(require_roles("student")),
):
    return {"message": "Welcome, Student"}