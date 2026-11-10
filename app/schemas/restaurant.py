
from pydantic import BaseModel, ConfigDict, Field


class RestaurantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    category: str = Field(min_length=2, max_length=100)
    address: str = Field(min_length=5, max_length=250)


class RestaurantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    address: str | None = Field(default=None, min_length=5, max_length=250)


class RestaurantAvailabilityUpdate(BaseModel):
    is_active: bool


class RestaurantResponse(BaseModel):
    id: int
    name: str
    category: str
    address: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
