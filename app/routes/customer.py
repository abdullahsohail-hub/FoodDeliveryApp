from fastapi import APIRouter, Depends

from app.models.customer import Customer
from app.schemas.customer import CustomerResponse
from app.security import get_current_customer


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.get("/me", response_model=CustomerResponse)
def get_my_profile(
    current_customer: Customer = Depends(get_current_customer)
):
    return current_customer