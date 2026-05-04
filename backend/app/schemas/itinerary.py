from pydantic import BaseModel, model_validator
from datetime import datetime
from app.schemas.event import EventResponse


class ItineraryItemCreate(BaseModel):
    event_id: int | None = None
    day_index: int
    custom_note: str | None = None

    # Custom event fields (used when event_id is None)
    custom_title: str | None = None
    custom_location: str | None = None
    custom_start_time: datetime | None = None
    custom_end_time: datetime | None = None
    custom_notes: str | None = None

    @model_validator(mode="after")
    def check_event_or_custom(self):
        if not self.event_id and not self.custom_title:
            raise ValueError("Either event_id or custom_title must be provided")
        return self


class ItineraryItemUpdate(BaseModel):
    day_index: int | None = None
    custom_note: str | None = None
    custom_title: str | None = None
    custom_location: str | None = None
    custom_start_time: datetime | None = None
    custom_end_time: datetime | None = None
    custom_notes: str | None = None


class ItineraryItemResponse(BaseModel):
    id: int
    event_id: int | None = None
    day_index: int
    custom_note: str | None = None
    event: EventResponse | None = None

    custom_title: str | None = None
    custom_location: str | None = None
    custom_start_time: datetime | None = None
    custom_end_time: datetime | None = None
    custom_notes: str | None = None

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
