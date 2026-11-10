
from pathlib import Path
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from app.database import migrate_database
from app.models import Customer, Restaurant, FoodItem, Order, OrderItem

from app.routes.restaurant import router as restaurant_router
from app.routes.food_item import router as food_item_router
from app.routes.customer import router as customer_router
from app.routes.order import router as order_router
from app.routes.invoice import router as invoice_router
from app.routes.auth import router as auth_router
from app.routes.admin_customer import router as admin_customer_router
from app.routes.reports import router as reports_router


# ---------------------------------
# LOGGING
# ---------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("foodhub")


# ---------------------------------
# DATABASE INITIALIZATION
# ---------------------------------

migrate_database()


# ---------------------------------
# FASTAPI APPLICATION
# ---------------------------------

app = FastAPI(
    title="Food Delivery API",
    description="A multi-restaurant food ordering system",
    version="1.0.0"
)


# ---------------------------------
# CHROME DEVTOOLS
# ---------------------------------

@app.get(
    "/.well-known/appspecific/com.chrome.devtools.json",
    include_in_schema=False
)
async def chrome_devtools_config():
    return Response(status_code=204)


# ---------------------------------
# VALIDATION ERROR HANDLER
# ---------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    errors = []

    for error in exc.errors():
        field = ".".join(
            str(part)
            for part in error["loc"]
            if part != "body"
        )

        errors.append({
            "field": field or "request",
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Please check the information you entered.",
            "errors": errors
        }
    )


# ---------------------------------
# GENERAL ERROR HANDLER
# ---------------------------------

@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception
):
    logger.exception(
        "Unexpected error while processing %s %s",
        request.method,
        request.url.path
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Something went wrong. Please try again later."
        }
    )


# ---------------------------------
# API ROUTERS
# ---------------------------------

app.include_router(restaurant_router)
app.include_router(food_item_router)
app.include_router(customer_router)
app.include_router(order_router)
app.include_router(invoice_router)
app.include_router(auth_router)
app.include_router(admin_customer_router)
app.include_router(reports_router)


# ---------------------------------
# FRONTEND STATIC FILES
# KEEP THIS LAST
# ---------------------------------

STATIC_DIRECTORY = Path(__file__).resolve().parent / "static"

app.mount(
    "/",
    StaticFiles(
        directory=str(STATIC_DIRECTORY),
        html=True
    ),
    name="frontend"
)
