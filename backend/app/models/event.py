from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from app.database import Base
import enum


class EventCategory(enum.Enum):
    food = "food"
    culture = "culture"
    outdoor = "outdoor"
    nightlife = "nightlife"
    shopping = "shopping"
    family = "family"
    history = "history"
    art = "art"
    sports = "sports"
    other = "other"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(EventCategory), nullable=False)
    location = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
