from pydantic import BaseModel
from datetime import datetime
from app.models.event import EventCategory


class EventCreate(BaseModel):
    title: str
    description: str
    category: EventCategory
    location: str
    image_url: str | None = None
    start_datetime: datetime
    end_datetime: datetime


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: EventCategory | None = None
    location: str | None = None
    image_url: str | None = None
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    category: EventCategory
    location: str
    image_url: str | None = None
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
