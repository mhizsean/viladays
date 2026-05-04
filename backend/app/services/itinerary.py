from sqlalchemy.orm import Session
from app.models.itinerary import Itinerary, ItineraryItem
from app.schemas.itinerary import ItineraryCreate, ItineraryItemCreate, ItineraryItemUpdate


def create_itinerary(db: Session, data: ItineraryCreate, user_id: int) -> Itinerary:
    itinerary = Itinerary(
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
        user_id=user_id
    )
    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)
    return itinerary


def get_itinerary(db: Session, itinerary_id: int, user_id: int) -> Itinerary | None:
    return db.query(Itinerary).filter(
        Itinerary.id == itinerary_id,
        Itinerary.user_id == user_id
    ).first()


def get_user_itineraries(db: Session, user_id: int) -> list[Itinerary]:
    return db.query(Itinerary).filter(Itinerary.user_id == user_id).all()


def add_item(db: Session, itinerary_id: int, data: ItineraryItemCreate) -> ItineraryItem:
    item = ItineraryItem(
        itinerary_id=itinerary_id,
        event_id=data.event_id,
        day_index=data.day_index,
        custom_note=data.custom_note,
        custom_title=data.custom_title,
        custom_location=data.custom_location,
        custom_start_time=data.custom_start_time,
        custom_end_time=data.custom_end_time,
        custom_notes=data.custom_notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, item_id: int, data: ItineraryItemUpdate) -> ItineraryItem | None:
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def remove_item(db: Session, item_id: int) -> bool:
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
