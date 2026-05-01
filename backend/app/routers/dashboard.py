from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Task, ProjectMember, Project
from app.schemas import DashboardStats
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_ids = db.query(ProjectMember.project_id).filter(
        ProjectMember.user_id == current_user.id
    ).subquery()
    
    total_tasks = db.query(Task).filter(Task.project_id.in_(project_ids)).count()
    
    todo_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.status == "todo"
    ).count()
    
    in_progress_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.status == "in_progress"
    ).count()
    
    done_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.status == "done"
    ).count()
    
    overdue_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.due_date < datetime.utcnow(),
        Task.status != "done"
    ).count()
    
    tasks_by_user = db.query(
        User.name,
        func.count(Task.id).label("count")
    ).join(Task, Task.assigned_to == User.id).filter(
        Task.project_id.in_(project_ids)
    ).group_by(User.id, User.name).all()
    
    tasks_by_project = db.query(
        Project.name,
        func.count(Task.id).label("count")
    ).join(Task, Task.project_id == Project.id).filter(
        Project.id.in_(project_ids)
    ).group_by(Project.id, Project.name).all()
    
    five_days_from_now = datetime.utcnow() + timedelta(days=5)
    tasks_due_soon = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.due_date >= datetime.utcnow(),
        Task.due_date <= five_days_from_now,
        Task.status != "done"
    ).all()
    
    return {
        "total_tasks": total_tasks,
        "todo_tasks": todo_tasks,
        "in_progress_tasks": in_progress_tasks,
        "done_tasks": done_tasks,
        "overdue_tasks": overdue_tasks,
        "tasks_by_user": [{"name": name, "count": count} for name, count in tasks_by_user],
        "tasks_by_project": [{"name": name, "count": count} for name, count in tasks_by_project],
        "tasks_due_soon": [{"id": t.id, "title": t.title, "due_date": t.due_date} for t in tasks_due_soon]
    }