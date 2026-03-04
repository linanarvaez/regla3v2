from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.controllers import tasks_controller

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/{user_name}/{date}")
def get_tasks(user_name: str, date: str, db: Session = Depends(get_db)):
    return tasks_controller.get_user_tasks(db, user_name, date)

@router.post("/")
def create_task(task_data: dict, db: Session = Depends(get_db)):
    return tasks_controller.create_task(db, task_data)

@router.put("/{task_id}")
def update_task(task_id: str, task_data: dict, db: Session = Depends(get_db)):
    return tasks_controller.update_task(db, task_id, task_data)

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    return tasks_controller.delete_task(db, task_id)

@router.get("/stats/global")
def get_global_stats(db: Session = Depends(get_db)):
    return tasks_controller.get_global_stats(db)
