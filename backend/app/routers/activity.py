from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, ActivityLog, ProjectMember
from app.schemas import ActivityLogResponse
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/project/{project_id}", response_model=List[ActivityLogResponse])
def get_project_activity(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this project")
        
    activities = db.query(ActivityLog).filter(
        ActivityLog.project_id == project_id
    ).order_by(ActivityLog.timestamp.desc()).all()
    return activities
