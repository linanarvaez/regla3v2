from sqlalchemy.orm import Session
from src.services import tasks_service

def get_user_tasks(db: Session, user_name: str, date: str):
    return tasks_service.get_tasks(db, user_name, date)

def create_task(db: Session, task_data: dict):
    return tasks_service.create_task(db, task_data)

def update_task(db: Session, task_id: str, task_data: dict):
    return tasks_service.update_task(db, task_id, task_data)

def delete_task(db: Session, task_id: str):
    return tasks_service.delete_task(db, task_id)

def get_global_stats(db: Session):
    return tasks_service.get_global_stats(db)
