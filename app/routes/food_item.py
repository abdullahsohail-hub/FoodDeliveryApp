
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.models.order_item import OrderItem

from app.schemas.food_item import (
    FoodItemCreate,
    FoodItemUpdate,
    FoodItemAvailabilityUpdate,
    FoodItemResponse
)

from app.security import get_current_admin


router = APIRouter(
    tags=["Food Items"]
)


@router.post(
    "/restaurants/{restaurant_id}/foods",
    response_model=FoodItemResponse,
    status_code=201,
    dependencies=[Depends(get_current_admin)]
)
def create_food_item(
    restaurant_id: int,
    food_item: FoodItemCreate,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    new_food_item = FoodItem(
        **food_item.model_dump(),
        restaurant_id=restaurant_id
    )

    db.add(new_food_item)
    db.commit()
    db.refresh(new_food_item)

    return new_food_item


@router.get(
    "/restaurants/{restaurant_id}/foods",
    response_model=list[FoodItemResponse]
)
def get_restaurant_menu(
    restaurant_id: int,
    search: str | None = Query(default=None, min_length=1),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    available_only: bool = True,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    if min_price is not None and max_price is not None:
        if min_price > max_price:
            raise HTTPException(
                400,
                "Minimum price cannot exceed maximum price"
            )

    query = db.query(FoodItem).filter(
        FoodItem.restaurant_id == restaurant_id
    )

    if available_only:
        query = query.filter(FoodItem.is_available == True)

    if search:
        query = query.filter(
            FoodItem.name.ilike(f"%{search}%")
        )

    if min_price is not None:
        query = query.filter(FoodItem.price >= min_price)

    if max_price is not None:
        query = query.filter(FoodItem.price <= max_price)

    return query.order_by(
        FoodItem.name
    ).offset(skip).limit(limit).all()


@router.get(
    "/foods/{food_item_id}",
    response_model=FoodItemResponse
)
def get_food_item(
    food_item_id: int,
    db: Session = Depends(get_db)
):
    food_item = db.query(FoodItem).filter(
        FoodItem.id == food_item_id
    ).first()

    if food_item is None:
        raise HTTPException(404, "Food item not found")

    return food_item


@router.patch(
    "/foods/{food_item_id}",
    response_model=FoodItemResponse,
    dependencies=[Depends(get_current_admin)]
)
def update_food_item(
    food_item_id: int,
    food_data: FoodItemUpdate,
    db: Session = Depends(get_db)
):
    food_item = db.query(FoodItem).filter(
        FoodItem.id == food_item_id
    ).first()

    if food_item is None:
        raise HTTPException(404, "Food item not found")

    updates = food_data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(400, "No update information provided")

    for field, value in updates.items():
        setattr(food_item, field, value)

    db.commit()
    db.refresh(food_item)

    return food_item


@router.patch(
    "/foods/{food_item_id}/availability",
    response_model=FoodItemResponse,
    dependencies=[Depends(get_current_admin)]
)
def update_food_availability(
    food_item_id: int,
    availability_data: FoodItemAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    food_item = db.query(FoodItem).filter(
        FoodItem.id == food_item_id
    ).first()

    if food_item is None:
        raise HTTPException(404, "Food item not found")

    food_item.is_available = availability_data.is_available

    db.commit()
    db.refresh(food_item)

    return food_item


@router.delete(
    "/foods/{food_item_id}",
    dependencies=[Depends(get_current_admin)]
)
def delete_food_item(
    food_item_id: int,
    db: Session = Depends(get_db)
):
    food_item = db.query(FoodItem).filter(
        FoodItem.id == food_item_id
    ).first()

    if food_item is None:
        raise HTTPException(404, "Food item not found")

    existing_order_item = db.query(OrderItem).filter(
        OrderItem.food_item_id == food_item_id
    ).first()

    if existing_order_item:
        raise HTTPException(
            409,
            "This food item belongs to an existing order. "
            "Mark it unavailable instead of deleting it."
        )

    db.delete(food_item)
    db.commit()

    return {
        "message": "Food item deleted successfully",
        "food_item_id": food_item_id
    }
