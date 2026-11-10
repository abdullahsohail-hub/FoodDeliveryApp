import sys
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

# Prevent the app's startup migration from running against the real database
# when pytest imports the application.
import app.database as database

database.migrate_database = lambda: None

from app.database import Base, get_db
from app.main import app

# Import all models so SQLAlchemy registers their tables.
from app.models import Customer, Restaurant, FoodItem, Order, OrderItem


import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def test_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )

    Base.metadata.create_all(bind=engine)

    yield engine

    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine):
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )

    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(test_engine):
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def customer_auth(client):
    registration = client.post(
        "/auth/register",
        json={
            "name": "Test Customer",
            "email": "customer@example.com",
            "phone": "03001234567",
            "address": "Test Street, Lahore",
            "password": "CustomerPass123"
        }
    )

    assert registration.status_code == 201

    login = client.post(
        "/auth/login",
        json={
            "email": "customer@example.com",
            "password": "CustomerPass123"
        }
    )

    assert login.status_code == 200

    return {
        "token": login.json()["access_token"],
        "id": registration.json()["customer_id"],
        "headers": {
            "Authorization": f"Bearer {login.json()['access_token']}"
        }
    }


@pytest.fixture
def second_customer_auth(client):
    client.post(
        "/auth/register",
        json={
            "name": "Second Customer",
            "email": "second@example.com",
            "phone": "03007654321",
            "address": "Second Street, Lahore",
            "password": "SecondPass123"
        }
    )

    login = client.post(
        "/auth/login",
        json={
            "email": "second@example.com",
            "password": "SecondPass123"
        }
    )

    return {
        "token": login.json()["access_token"],
        "id": login.json()["customer_id"],
        "headers": {
            "Authorization": f"Bearer {login.json()['access_token']}"
        }
    }


@pytest.fixture
def admin_auth(client, db_session):
    registration = client.post(
        "/auth/register",
        json={
            "name": "Test Admin",
            "email": "admin@example.com",
            "phone": "03001112222",
            "address": "Admin Street, Lahore",
            "password": "AdminPass123"
        }
    )

    assert registration.status_code == 201

    admin = db_session.query(Customer).filter(
        Customer.email == "admin@example.com"
    ).first()

    admin.is_admin = True
    db_session.commit()

    login = client.post(
        "/auth/login",
        json={
            "email": "admin@example.com",
            "password": "AdminPass123"
        }
    )

    assert login.status_code == 200

    return {
        "token": login.json()["access_token"],
        "id": registration.json()["customer_id"],
        "headers": {
            "Authorization": f"Bearer {login.json()['access_token']}"
        }
    }


@pytest.fixture
def restaurant_and_food(client, admin_auth):
    restaurant_response = client.post(
        "/restaurants/",
        headers=admin_auth["headers"],
        json={
            "name": "Test Restaurant",
            "category": "Fast Food",
            "address": "Johar Town, Lahore"
        }
    )

    assert restaurant_response.status_code == 201

    restaurant = restaurant_response.json()

    food_response = client.post(
        f"/restaurants/{restaurant['id']}/foods",
        headers=admin_auth["headers"],
        json={
            "name": "Test Burger",
            "description": "A test burger",
            "price": "500.00"
        }
    )

    assert food_response.status_code == 201

    return {
        "restaurant": restaurant,
        "food": food_response.json()
    }