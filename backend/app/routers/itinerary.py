from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.itinerary import (
    ItineraryCreate,
    ItineraryResponse,
    ItineraryItemCreate,
    ItineraryItemUpdate,
    ItineraryItemResponse
)
from app.services.itinerary import create_itinerary, get_itinerary, get_user_itineraries, add_item, update_item, remove_item

router = APIRouter(
    prefix="/itineraries",
    tags=["itineraries"]
)


@router.post("/", response_model=ItineraryResponse, status_code=status.HTTP_201_CREATED)
async def create(data: ItineraryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_itinerary(db, data, current_user.id)


@router.get("/", response_model=list[ItineraryResponse])
def list_itineraries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_itineraries(db, current_user.id)


@router.get("/{itinerary_id}", response_model=ItineraryResponse)
def get_one(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary = get_itinerary(db, itinerary_id, current_user.id)
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )
    return itinerary


@router.post("/{itinerary_id}/items", response_model=ItineraryItemResponse, status_code=status.HTTP_201_CREATED)
def add_itinerary_item(
    itinerary_id: int,
    data: ItineraryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary = get_itinerary(db, itinerary_id, current_user.id)
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    return add_item(db, itinerary_id, data)


@router.patch("/{itinerary_id}/items/{item_id}", response_model=ItineraryItemResponse)
def update_itinerary_item(
    itinerary_id: int,
    item_id: int,
    data: ItineraryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary = get_itinerary(db, itinerary_id, current_user.id)
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    item = update_item(db, item_id, data)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item


@router.delete("/{itinerary_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_itinerary_item(
    itinerary_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary = get_itinerary(db, itinerary_id, current_user.id)
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    success = remove_item(db, item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
