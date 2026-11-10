from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

from app.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.customer import Customer
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem

from app.security import get_current_customer


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


@router.get("/{order_id}/pdf")
def generate_invoice(
    order_id: int,
    db: Session = Depends(get_db),
    current_customer=Depends(get_current_customer)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_customer.id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    customer = db.query(Customer).filter(
        Customer.id == order.customer_id
    ).first()

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == order.restaurant_id
    ).first()

    if customer is None or restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Customer or restaurant information not found"
        )

    order_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    food_ids = [item.food_item_id for item in order_items]

    foods = db.query(FoodItem).filter(
        FoodItem.id.in_(food_ids)
    ).all()

    food_lookup = {
        food.id: food for food in foods
    }

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=24,
        spaceAfter=10
    )

    normal_style = styles["Normal"]

    elements = []

    elements.append(
        Paragraph("FOOD DELIVERY APP", title_style)
    )

    elements.append(
        Paragraph("CUSTOMER INVOICE", styles["Heading2"])
    )

    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(f"<b>Invoice / Order Number:</b> #{order.id}", normal_style)
    )

    elements.append(
        Paragraph(f"<b>Customer:</b> {customer.name}", normal_style)
    )

    elements.append(
        Paragraph(f"<b>Email:</b> {customer.email}", normal_style)
    )

    elements.append(
        Paragraph(f"<b>Restaurant:</b> {restaurant.name}", normal_style)
    )

    elements.append(
        Paragraph(
            f"<b>Restaurant Address:</b> {restaurant.address}",
            normal_style
        )
    )

    elements.append(
        Paragraph(
            f"<b>Delivery Address:</b> {order.delivery_address}",
            normal_style
        )
    )

    elements.append(
        Paragraph(
            f"<b>Order Date:</b> {order.created_at.strftime('%d %B %Y, %I:%M %p')}",
            normal_style
        )
    )

    elements.append(Spacer(1, 20))

    table_data = [
        ["Food Item", "Quantity", "Unit Price", "Subtotal"]
    ]

    for item in order_items:
        food = food_lookup.get(item.food_item_id)

        food_name = food.name if food else f"Food item #{item.food_item_id}"

        subtotal = item.unit_price * item.quantity

        table_data.append([
            food_name,
            str(item.quantity),
            f"Rs. {item.unit_price:,.2f}",
            f"Rs. {subtotal:,.2f}"
        ])

    invoice_table = Table(
        table_data,
        colWidths=[75 * mm, 25 * mm, 35 * mm, 35 * mm]
    )

    invoice_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263238")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
        ])
    )

    elements.append(invoice_table)
    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            f"<b>Total Amount: Rs. {order.total_amount:,.2f}</b>",
            styles["Heading2"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Payment Method:</b> {order.payment_method.replace('_', ' ').title()}",
            normal_style
        )
    )

    elements.append(
        Paragraph(
            f"<b>Order Status:</b> {order.status.title()}",
            normal_style
        )
    )

    elements.append(Spacer(1, 30))

    elements.append(
        Paragraph(
            "Thank you for ordering with us!",
            ParagraphStyle(
                "Footer",
                parent=normal_style,
                alignment=TA_CENTER
            )
        )
    )

    document.build(elements)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{order.id}.pdf"
        }
    )