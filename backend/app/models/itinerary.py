from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timezone


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship(
        "ItineraryItem", back_populates="itinerary", cascade="all, delete-orphan")
    user = relationship("User", back_populates="itineraries")


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey(
        "itineraries.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    day_index = Column(Integer, nullable=False)
    custom_note = Column(Text, nullable=True)

    itinerary = relationship("Itinerary", back_populates="items")
    event = relationship("Event")
