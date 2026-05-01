from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Task, Comment, ProjectMember
from app.schemas import CommentCreate, CommentResponse
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/task/{task_id}", response_model=List[CommentResponse])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if current_user.role != "admin":
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this project")
        
    comments = db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.created_at.asc()).all()
    return comments

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == comment.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if current_user.role != "admin":
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this project")
        
    new_comment = Comment(
        task_id=comment.task_id,
        user_id=current_user.id,
        content=comment.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment
