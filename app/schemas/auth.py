import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)
    address: str = Field(min_length=5, max_length=250)
    password: str = Field(min_length=8, max_length=128)

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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    customer_id: int
    customer_name: str