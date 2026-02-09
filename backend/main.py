from fastapi import FastAPI, Response
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
import csv, io, json

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, func
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./analytics.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String, index=True)
    store_id = Column(String, nullable=True)
    floor = Column(String, nullable=True)
    extra = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

app = FastAPI()

class EventIn(BaseModel):
    event_type: str
    store_id: Optional[str] = None
    floor: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None

@app.post("/api/events")
def log_event(event: EventIn):
    db = SessionLocal()
    try:
        db_event = Event(
            event_type=event.event_type,
            store_id=event.store_id,
            floor=event.floor,
            extra=json.dumps(event.extra) if event.extra else None,
        )
        db.add(db_event)
        db.commit()
        return {"status": "ok"}
    finally:
        db.close()

@app.get("/api/report/summary.csv")
def summary_csv():
    db = SessionLocal()
    try:
        rows = (
            db.query(Event.event_type, func.count(Event.id))
            .group_by(Event.event_type)
            .all()
        )
    finally:
        db.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["event_type", "count"])
    for event_type, count in rows:
        writer.writerow([event_type, count])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=summary.csv"},
    )

@app.get("/api/report/store_clicks.csv")
def store_clicks_csv():
    db = SessionLocal()
    try:
        rows = (
            db.query(Event.store_id, func.count(Event.id))
            .filter(Event.event_type == "store_click", Event.store_id.isnot(None))
            .group_by(Event.store_id)
            .all()
        )
    finally:
        db.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["store_id", "clicks"])
    for store_id, clicks in rows:
        writer.writerow([store_id, clicks])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=store_clicks.csv"},
    )