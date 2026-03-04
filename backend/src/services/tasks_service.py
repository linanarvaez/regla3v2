from sqlalchemy.orm import Session
from src.db.models import Task
from sqlalchemy import func

def get_tasks(db: Session, user_name: str, date: str):
    return db.query(Task).filter(Task.user_name == user_name, Task.date == date).all()

def create_task(db: Session, data: dict):
    # Check limit of 3
    count = db.query(Task).filter(
        Task.user_name == data['user_name'], 
        Task.date == data['date'], 
        Task.category == data['category']
    ).count()
    
    if count >= 3:
        raise Exception("Limit of 3 tasks per category reached")
        
    db_task = Task(**data)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: str, data: dict):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        for key, value in data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: str):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return {"status": "success"}

def get_global_stats(db: Session):
    # Logic for weighted compliance per day
    results = db.query(
        Task.date,
        func.count(Task.id).label('total'),
        func.sum(func.cast(Task.completed, func.Integer)).label('completed')
    ).group_by(Task.date).all()
    
    return [{"date": r.date, "total": r.total, "completed": r.completed} for r in results]
