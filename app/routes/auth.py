
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=201)
def register_customer(
    customer_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_customer = db.query(Customer).filter(
        Customer.email == customer_data.email
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists"
        )

    new_customer = Customer(
        name=customer_data.name,
        email=customer_data.email,
        phone=customer_data.phone,
        address=customer_data.address,
        password_hash=hash_password(customer_data.password)
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return {
        "message": "Customer account created successfully",
        "customer_id": new_customer.id,
        "customer_name": new_customer.name,
        "email": new_customer.email
    }


@router.post("/login", response_model=AuthResponse)
def login_customer(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.email == login_data.email
    ).first()

    if customer is None or customer.password_hash is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    if not verify_password(
        login_data.password,
        customer.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(customer.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "customer_id": customer.id,
        "customer_name": customer.name
    }
