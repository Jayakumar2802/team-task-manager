from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Task, ProjectMember
from app.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.auth.jwt import get_current_user
from app.websockets import manager

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "due_date",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).join(
        ProjectMember, Task.project_id == ProjectMember.project_id
    ).filter(
        ProjectMember.user_id == current_user.id,
        or_(
            ProjectMember.role == "admin",
            Task.assigned_to == current_user.id
        )
    )
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
        
    if sort_by == "priority":
        query = query.order_by(Task.priority.desc())
    else:
        query = query.order_by(Task.due_date.asc().nullslast())
    
    tasks = query.all()
    return tasks

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not project or project.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create tasks for this project")
    
    new_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        status=task.status,
        assigned_to=task.assigned_to,
        project_id=task.project_id,
        created_by=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    await manager.broadcast("task_created")
    return new_task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this project")
        
    if membership.role != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this task")
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this project")
        
    if membership.role != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.assigned_to is not None:
        task.assigned_to = task_update.assigned_to
    
    db.commit()
    db.refresh(task)
    await manager.broadcast("task_updated")
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete tasks")
    
    db.delete(task)
    db.commit()
    await manager.broadcast("task_deleted")
    
    return {"message": "Task deleted successfully"}