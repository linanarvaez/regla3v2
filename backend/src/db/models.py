from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from src.db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    user_name = Column(String, index=True)
    date = Column(String, index=True)
    category = Column(String) # critical, administrative, micro
    text = Column(String)
    completed = Column(Boolean, default=False)
