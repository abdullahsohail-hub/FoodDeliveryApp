
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem
from app.models.order import Order
from app.models.order_item import OrderItem

from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantUpdate,
    RestaurantAvailabilityUpdate,
    RestaurantResponse
)

from app.security import get_current_admin


router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"]
)


@router.post(
    "/",
    response_model=RestaurantResponse,
    status_code=201,
    dependencies=[Depends(get_current_admin)]
)
def create_restaurant(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db)
):
    new_restaurant = Restaurant(**restaurant.model_dump())
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant


@router.get("/", response_model=list[RestaurantResponse])
def get_restaurants(
    search: str | None = Query(default=None, min_length=1),
    category: str | None = None,
    active_only: bool = True,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)

    if active_only:
        query = query.filter(Restaurant.is_active.is_(True))

    if search:
        query = query.filter(Restaurant.name.ilike(f"%{search}%"))

    if category:
        query = query.filter(Restaurant.category.ilike(f"%{category}%"))

    return query.order_by(Restaurant.name).offset(skip).limit(limit).all()


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    return restaurant


@router.patch(
    "/{restaurant_id}",
    response_model=RestaurantResponse,
    dependencies=[Depends(get_current_admin)]
)
def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    updates = restaurant_data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(400, "No update information provided")

    for field, value in updates.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    return restaurant


@router.patch(
    "/{restaurant_id}/availability",
    response_model=RestaurantResponse,
    dependencies=[Depends(get_current_admin)]
)
def update_restaurant_availability(
    restaurant_id: int,
    availability_data: RestaurantAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    restaurant.is_active = availability_data.is_active
    db.commit()
    db.refresh(restaurant)

    return restaurant


@router.delete(
    "/{restaurant_id}",
    dependencies=[Depends(get_current_admin)]
)
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    try:
        has_orders = db.query(Order.id).filter(
            Order.restaurant_id == restaurant_id
        ).first() is not None

        if has_orders:
            restaurant.is_active = False
            db.commit()

            return {
                "success": True,
                "action": "archived",
                "message": (
                    f"{restaurant.name} was archived because it has "
                    "existing orders. Order history has been preserved."
                ),
                "restaurant_id": restaurant_id
            }

        foods = db.query(FoodItem).filter(
            FoodItem.restaurant_id == restaurant_id
        ).all()

        food_ids = [food.id for food in foods]

        if food_ids:
            has_order_items = db.query(OrderItem.id).filter(
                OrderItem.food_item_id.in_(food_ids)
            ).first() is not None

            if has_order_items:
                restaurant.is_active = False
                db.commit()

                return {
                    "success": True,
                    "action": "archived",
                    "message": "Restaurant archived to preserve order records.",
                    "restaurant_id": restaurant_id
                }

        for food in foods:
            db.delete(food)

        db.delete(restaurant)
        db.commit()

        return {
            "success": True,
            "action": "deleted",
            "message": f"{restaurant.name} was permanently deleted.",
            "restaurant_id": restaurant_id
        }

    except Exception:
        db.rollback()
        raise
