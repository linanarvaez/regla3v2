from sqlalchemy.orm import Session
from src.db.models import Task
from sqlalchemy import func, case
from datetime import datetime, timedelta

def get_team_kpis(db: Session):
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.completed == True).scalar() or 0
    
    compliance = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
    
    # Avg by category
    categories = ['critical', 'administrative', 'micro']
    cat_stats = {}
    for cat in categories:
        cat_total = db.query(func.count(Task.id)).filter(Task.category == cat).scalar() or 0
        cat_comp = db.query(func.count(Task.id)).filter(Task.category == cat, Task.completed == True).scalar() or 0
        cat_stats[cat] = round((cat_comp / cat_total * 100), 1) if cat_total > 0 else 0
        
    active_users = db.query(func.count(func.distinct(Task.user_name))).scalar() or 0
    total_days = db.query(func.count(func.distinct(Task.date))).scalar() or 0
    
    # Category with most delay (lowest compliance)
    most_delayed = min(cat_stats, key=cat_stats.get) if cat_stats else "N/A"
    
    return {
        "compliance": compliance,
        "category_stats": cat_stats,
        "active_users": active_users,
        "total_days": total_days,
        "most_delayed_category": most_delayed
    }

def get_team_trend(db: Session):
    # Last 7 days
    today = datetime.now()
    dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(6, -1, -1)]
    
    trend = []
    for date in dates:
        total = db.query(func.count(Task.id)).filter(Task.date == date).scalar() or 0
        comp = db.query(func.count(Task.id)).filter(Task.date == date, Task.completed == True).scalar() or 0
        compliance = round((comp / total * 100), 1) if total > 0 else 0
        trend.append({
            "date": date,
            "display_date": datetime.strptime(date, '%Y-%m-%d').strftime('%d %b'),
            "compliance": compliance
        })
    return trend

def get_team_category_average(db: Session):
    categories = ['critical', 'administrative', 'micro']
    stats = {}
    for cat in categories:
        total = db.query(func.count(Task.id)).filter(Task.category == cat).scalar() or 0
        comp = db.query(func.count(Task.id)).filter(Task.category == cat, Task.completed == True).scalar() or 0
        stats[cat] = round((comp / total * 100), 1) if total > 0 else 0
    return stats

def get_team_consistency(db: Session):
    # Group by user
    users = db.query(Task.user_name).distinct().all()
    consistency = []
    
    for (user,) in users:
        total = db.query(func.count(Task.id)).filter(Task.user_name == user).scalar() or 0
        comp = db.query(func.count(Task.id)).filter(Task.user_name == user, Task.completed == True).scalar() or 0
        avg_comp = round((comp / total * 100), 1) if total > 0 else 0
        
        # Perfect days
        dates = db.query(Task.date).filter(Task.user_name == user).distinct().all()
        perfect_days = 0
        for (date,) in dates:
            d_total = db.query(func.count(Task.id)).filter(Task.user_name == user, Task.date == date).scalar() or 0
            d_comp = db.query(func.count(Task.id)).filter(Task.user_name == user, Task.date == date, Task.completed == True).scalar() or 0
            if d_total > 0 and d_total == d_comp:
                perfect_days += 1
                
        consistency.append({
            "user": user,
            "compliance": avg_comp,
            "perfect_days": perfect_days
        })
        
    return sorted(consistency, key=lambda x: x['compliance'], reverse=True)

def get_team_alerts(db: Session):
    # Days where critical tasks were not 100% completed
    alerts = db.query(
        Task.user_name,
        Task.date,
        func.count(Task.id).label('total_critical'),
        func.sum(case((Task.completed == False, 1), else_=0)).label('pending_critical')
    ).filter(Task.category == 'critical').group_by(Task.user_name, Task.date).all()
    
    filtered_alerts = [
        {
            "user": a.user_name,
            "date": a.date,
            "pending": a.pending_critical
        }
        for a in alerts if a.pending_critical > 0
    ]
    
    return filtered_alerts
