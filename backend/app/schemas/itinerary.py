from pydantic import BaseModel
from datetime import datetime
from app.schemas.event import EventResponse


class ItineraryItemCreate(BaseModel):
    event_id: int
    day_index: int
    custom_note: str | None = None


class ItineraryItemUpdate(BaseModel):
    day_index: int | None = None
    custom_note: str | None = None


class ItineraryItemResponse(BaseModel):
    id: int
    event_id: int
    day_index: int
    custom_note: str | None = None
    event: EventResponse

    model_config = {"from_attributes": True}


class ItineraryCreate(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime


class ItineraryResponse(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    created_at: datetime
    items: list[ItineraryItemResponse] = []

    model_config = {"from_attributes": True}
