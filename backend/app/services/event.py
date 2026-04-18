from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timezone
from app.models.event import Event, EventCategory
from app.schemas.event import EventCreate, EventUpdate


def get_all_events(
    db: Session,
    category: EventCategory | None = None,
    date: datetime | None = None,
) -> list[Event]:
    query = db.query(Event)
    if category:
        query = query.filter(Event.category == category)
    if date:
        query = query.filter(
            and_(
                Event.start_datetime >= date,
                Event.start_datetime < datetime(
                    date.year, date.month, date.day + 1)
            )
        )
    return query.all()


def get_event_by_id(db: Session, event_id: int) -> Event | None:
    return db.query(Event).filter(Event.id == event_id).first()


def create_event(db: Session, data: EventCreate) -> Event:
    now = datetime.now(timezone.utc)
    event = Event(
        **data.model_dump(),
        created_at=now,
        updated_at=now,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event_id: int, data: EventUpdate) -> Event | None:
    event = get_event_by_id(db, event_id)
    if not event:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    event.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: int) -> bool:
    event = get_event_by_id(db, event_id)
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True
