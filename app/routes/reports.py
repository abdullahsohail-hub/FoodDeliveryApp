from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.security import get_current_admin

router = APIRouter(
    prefix="/admin/reports",
    tags=["Admin Reports"]
)


@router.get("/summary")
def get_report_summary(
    days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    start_date = datetime.utcnow() - timedelta(days=days)

    orders = db.query(Order).filter(
        Order.created_at >= start_date
    ).all()

    valid_orders = [
        order for order in orders
        if order.status != "cancelled"
    ]

    total_revenue = sum(
        float(order.total_amount or 0)
        for order in valid_orders
    )

    total_orders = len(valid_orders)

    total_customers = db.query(Customer).filter(
        Customer.is_admin == False
    ).count()

    average_order_value = (
        total_revenue / total_orders
        if total_orders else 0
    )

    daily_results = (
        db.query(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("orders"),
            func.sum(Order.total_amount).label("revenue")
        )
        .filter(
            Order.created_at >= start_date,
            Order.status != "cancelled"
        )
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )

    daily = [
        {
            "date": str(row.day),
            "orders": row.orders,
            "revenue": round(float(row.revenue or 0), 2)
        }
        for row in daily_results
    ]

    status_results = (
        db.query(
            Order.status,
            func.count(Order.id).label("count")
        )
        .filter(Order.created_at >= start_date)
        .group_by(Order.status)
        .all()
    )

    statuses = {
        status: count
        for status, count in status_results
    }

    restaurant_results = (
        db.query(
            Restaurant.name,
            func.count(Order.id).label("orders"),
            func.sum(Order.total_amount).label("revenue")
        )
        .join(
            Order,
            Order.restaurant_id == Restaurant.id
        )
        .filter(
            Order.created_at >= start_date,
            Order.status != "cancelled"
        )
        .group_by(Restaurant.id, Restaurant.name)
        .order_by(desc("revenue"))
        .limit(10)
        .all()
    )

    top_restaurants = [
        {
            "name": row.name,
            "orders": row.orders,
            "revenue": round(float(row.revenue or 0), 2)
        }
        for row in restaurant_results
    ]

    food_results = (
        db.query(
            FoodItem.name,
            func.sum(OrderItem.quantity).label("quantity"),
            func.sum(
                OrderItem.quantity * OrderItem.unit_price
            ).label("revenue")
        )
        .join(
            OrderItem,
            OrderItem.food_item_id == FoodItem.id
        )
        .join(
            Order,
            Order.id == OrderItem.order_id
        )
        .filter(
            Order.created_at >= start_date,
            Order.status != "cancelled"
        )
        .group_by(FoodItem.id, FoodItem.name)
        .order_by(desc("quantity"))
        .limit(10)
        .all()
    )

    top_foods = [
        {
            "name": row.name,
            "quantity": int(row.quantity or 0),
            "revenue": round(float(row.revenue or 0), 2)
        }
        for row in food_results
    ]

    return {
        "period_days": days,
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "average_order_value": round(average_order_value, 2),
        "daily": daily,
        "statuses": statuses,
        "top_restaurants": top_restaurants,
        "top_foods": top_foods
    }