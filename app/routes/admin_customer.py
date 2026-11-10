from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.security import get_current_admin

router = APIRouter(
    prefix="/admin/customers",
    tags=["Admin Customer Management"]
)


@router.get("/")
def get_all_customers(
    search: str = Query(default="", max_length=100),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    query = db.query(Customer).filter(
        Customer.is_admin == False
    )

    if search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Customer.name.ilike(term)) |
            (Customer.email.ilike(term)) |
            (Customer.phone.ilike(term))
        )

    total = query.count()

    customers = (
        query.order_by(Customer.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    results = []

    for customer in customers:
        customer_orders = (
            db.query(Order)
            .filter(Order.customer_id == customer.id)
            .all()
        )

        valid_orders = [
            order for order in customer_orders
            if order.status != "cancelled"
        ]

        total_spent = sum(
            float(order.total_amount or 0)
            for order in valid_orders
        )

        results.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "address": customer.address,
            "order_count": len(customer_orders),
            "total_spent": round(total_spent, 2),
            "last_order": (
                max(
                    customer_orders,
                    key=lambda order: order.created_at
                ).created_at.isoformat()
                if customer_orders else None
            )
        })

    return {
        "total": total,
        "customers": results
    }


@router.get("/{customer_id}/orders")
def get_customer_order_history(
    customer_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.is_admin == False
    ).first()

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    orders = (
        db.query(Order)
        .filter(Order.customer_id == customer_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    results = []

    for order in orders:
        restaurant = db.query(Restaurant).filter(
            Restaurant.id == order.restaurant_id
        ).first()

        order_items = db.query(OrderItem).filter(
            OrderItem.order_id == order.id
        ).all()

        items = []

        for item in order_items:
            food = db.query(FoodItem).filter(
                FoodItem.id == item.food_item_id
            ).first()

            items.append({
                "name": food.name if food else "Unavailable item",
                "quantity": item.quantity,
                "unit_price": float(item.unit_price or 0),
                "subtotal": round(
                    float(item.unit_price or 0) * item.quantity,
                    2
                )
            })

        results.append({
            "id": order.id,
            "restaurant": (
                restaurant.name if restaurant else "Unavailable restaurant"
            ),
            "delivery_address": order.delivery_address,
            "total_amount": float(order.total_amount or 0),
            "status": order.status,
            "payment_method": order.payment_method,
            "created_at": (
                order.created_at.isoformat()
                if order.created_at else None
            ),
            "items": items
        })

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "address": customer.address
        },
        "total_orders": len(results),
        "orders": results
    }