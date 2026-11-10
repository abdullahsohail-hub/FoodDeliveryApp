
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem
from app.models.order import Order
from app.models.order_item import OrderItem

from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate
)

from app.security import (
    get_current_customer,
    get_current_admin
)


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# CREATE AN ORDER
@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_customer=Depends(get_current_customer)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == order_data.restaurant_id
    ).first()

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    if not restaurant.is_active:
        raise HTTPException(400, "Restaurant is unavailable")

    food_ids = [item.food_item_id for item in order_data.items]

    food_items = db.query(FoodItem).filter(
        FoodItem.id.in_(food_ids)
    ).all()

    food_lookup = {
        food.id: food for food in food_items
    }

    for requested_item in order_data.items:
        food = food_lookup.get(requested_item.food_item_id)

        if food is None:
            raise HTTPException(
                404,
                f"Food item {requested_item.food_item_id} not found"
            )

        if food.restaurant_id != restaurant.id:
            raise HTTPException(
                400,
                "All food items must belong to the selected restaurant"
            )

        if not food.is_available:
            raise HTTPException(
                400,
                f"{food.name} is currently unavailable"
            )

    total = Decimal("0.00")

    for requested_item in order_data.items:
        food = food_lookup[requested_item.food_item_id]
        total += food.price * requested_item.quantity

    new_order = Order(
        customer_id=current_customer.id,
        restaurant_id=restaurant.id,
        delivery_address=order_data.delivery_address,
        total_amount=total
    )

    db.add(new_order)
    db.flush()

    for requested_item in order_data.items:
        food = food_lookup[requested_item.food_item_id]

        db.add(
            OrderItem(
                order_id=new_order.id,
                food_item_id=food.id,
                quantity=requested_item.quantity,
                unit_price=food.price
            )
        )

    db.commit()

    return db.query(Order).options(
        selectinload(Order.items)
    ).filter(
        Order.id == new_order.id
    ).first()


# CUSTOMER ORDER HISTORY
@router.get("/customer/me", response_model=list[OrderResponse])
def get_my_orders(
    status: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_customer=Depends(get_current_customer)
):
    query = db.query(Order).options(
        selectinload(Order.items)
    ).filter(
        Order.customer_id == current_customer.id
    )

    if status:
        query = query.filter(Order.status == status)

    return query.order_by(
        Order.created_at.desc()
    ).offset(skip).limit(limit).all()


# ADMIN: VIEW ALL ORDERS
@router.get(
    "/admin/all",
    response_model=list[OrderResponse],
    dependencies=[Depends(get_current_admin)]
)
def get_all_orders(
    status: str | None = None,
    customer_id: int | None = Query(default=None, gt=0),
    restaurant_id: int | None = Query(default=None, gt=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(
        selectinload(Order.items)
    )

    if status:
        query = query.filter(Order.status == status)

    if customer_id is not None:
        query = query.filter(Order.customer_id == customer_id)

    if restaurant_id is not None:
        query = query.filter(Order.restaurant_id == restaurant_id)

    return query.order_by(
        Order.created_at.desc()
    ).offset(skip).limit(limit).all()


# ADMIN: UPDATE ORDER STATUS
@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    dependencies=[Depends(get_current_admin)]
)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if order is None:
        raise HTTPException(404, "Order not found")

    allowed_transitions = {
        "pending": ["confirmed", "cancelled"],
        "confirmed": ["preparing", "cancelled"],
        "preparing": ["out_for_delivery"],
        "out_for_delivery": ["delivered"],
        "delivered": [],
        "cancelled": []
    }

    new_status = status_data.status

    if new_status not in allowed_transitions[order.status]:
        raise HTTPException(
            400,
            f"Cannot change order from {order.status} to {new_status}"
        )

    order.status = new_status

    db.commit()

    return db.query(Order).options(
        selectinload(Order.items)
    ).filter(
        Order.id == order_id
    ).first()


# CUSTOMER OR ADMIN: VIEW A SINGLE ORDER
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_customer=Depends(get_current_customer)
):
    order = db.query(Order).options(
        selectinload(Order.items)
    ).filter(
        Order.id == order_id
    ).first()

    if order is None:
        raise HTTPException(404, "Order not found")

    if (
        order.customer_id != current_customer.id
        and not current_customer.is_admin
    ):
        raise HTTPException(403, "You cannot access this order")

    return order
