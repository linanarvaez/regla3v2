from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.controllers import team_controller

router = APIRouter(prefix="/api/team", tags=["team"])

@router.get("/kpis")
def get_team_kpis(db: Session = Depends(get_db)):
    return team_controller.get_team_kpis(db)

@router.get("/trend")
def get_team_trend(db: Session = Depends(get_db)):
    return team_controller.get_team_trend(db)

@router.get("/category-average")
def get_team_category_average(db: Session = Depends(get_db)):
    return team_controller.get_team_category_average(db)

@router.get("/consistency")
def get_team_consistency(db: Session = Depends(get_db)):
    return team_controller.get_team_consistency(db)

@router.get("/alerts")
def get_team_alerts(db: Session = Depends(get_db)):
    return team_controller.get_team_alerts(db)
