
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FoodItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


class FoodItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2
    )


class FoodItemAvailabilityUpdate(BaseModel):
    is_available: bool


class FoodItemResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: Decimal
    is_available: bool
    restaurant_id: int

    model_config = ConfigDict(from_attributes=True)
