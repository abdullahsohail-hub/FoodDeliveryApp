import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)
    address: str = Field(min_length=5, max_length=250)

    @field_validator("name", "email", "phone", "address", mode="before")
    @classmethod
    def strip_whitespace(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if not re.fullmatch(r"[0-9+\-\s()]+", value):
            raise ValueError("Phone number contains invalid characters.")

        if sum(character.isdigit() for character in value) < 7:
            raise ValueError("Phone number must contain at least 7 digits.")

        return value


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: str

    model_config = ConfigDict(from_attributes=True)