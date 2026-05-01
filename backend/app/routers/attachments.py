import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Task, Attachment, ProjectMember
from app.schemas import AttachmentResponse
from app.auth.jwt import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/task/{task_id}", response_model=List[AttachmentResponse])
def get_attachments(
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
        
    attachments = db.query(Attachment).filter(Attachment.task_id == task_id).all()
    return attachments

@router.post("/task/{task_id}", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
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
        
    file_location = f"{UPLOAD_DIR}/{task_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_attachment = Attachment(
        task_id=task_id,
        file_path=file_location
    )
    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)
    return new_attachment
