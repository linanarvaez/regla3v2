from sqlalchemy.orm import Session
from src.services import team_service

def get_team_kpis(db: Session):
    return team_service.get_team_kpis(db)

def get_team_trend(db: Session):
    return team_service.get_team_trend(db)

def get_team_category_average(db: Session):
    return team_service.get_team_category_average(db)

def get_team_consistency(db: Session):
    return team_service.get_team_consistency(db)

def get_team_alerts(db: Session):
    return team_service.get_team_alerts(db)
