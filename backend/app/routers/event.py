from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.event import EventCategory
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event import get_all_events, get_event_by_id, create_event, update_event, delete_event
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=list[EventResponse])
def list_events(
    category: EventCategory | None = None,
    date: datetime | None = None,
    db: Session = Depends(get_db)
):
    return get_all_events(db, category, date)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return event


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: EventCreate,
    db: Session = Depends(get_db),
    _: any = Depends(require_admin)
):
    return create_event(db, data)


@router.put("/{event_id}", response_model=EventResponse)
def update(
    event_id: int,
    data: EventUpdate,
    db: Session = Depends(get_db),
    _: any = Depends(require_admin)
):
    event = update_event(db, event_id, data)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    event_id: int,
    db: Session = Depends(get_db),
    _: any = Depends(require_admin)
):
    success = delete_event(db, event_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
