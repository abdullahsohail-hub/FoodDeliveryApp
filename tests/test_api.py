# -----------------------------------------
# WEBSITE PAGES
# -----------------------------------------

def test_homepage_loads(client):
    assert client.get("/").status_code == 200


def test_admin_page_loads(client):
    assert client.get("/admin.html").status_code == 200


def test_customer_page_loads(client):
    assert client.get("/customers.html").status_code == 200


def test_reports_page_loads(client):
    assert client.get("/reports.html").status_code == 200


# -----------------------------------------
# CUSTOMER REGISTRATION AND LOGIN
# -----------------------------------------

def test_customer_registration(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "New Customer",
            "email": "new@example.com",
            "phone": "03001234567",
            "address": "Lahore",
            "password": "Password123"
        }
    )

    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"


def test_duplicate_registration_rejected(client):
    details = {
        "name": "Duplicate Customer",
        "email": "duplicate@example.com",
        "phone": "03001234567",
        "address": "Lahore",
        "password": "Password123"
    }

    assert client.post("/auth/register", json=details).status_code == 201
    assert client.post("/auth/register", json=details).status_code == 409


def test_invalid_registration_rejected(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "A",
            "email": "not-an-email",
            "phone": "123",
            "address": "X",
            "password": "123"
        }
    )

    assert response.status_code == 422


def test_customer_login(client, customer_auth):
    assert customer_auth["token"]


def test_wrong_password_rejected(client, customer_auth):
    response = client.post(
        "/auth/login",
        json={
            "email": "customer@example.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401


def test_customer_profile(client, customer_auth):
    response = client.get(
        "/customers/me",
        headers=customer_auth["headers"]
    )

    assert response.status_code == 200
    assert response.json()["email"] == "customer@example.com"


def test_profile_requires_login(client):
    assert client.get("/customers/me").status_code == 401


# -----------------------------------------
# RESTAURANT MANAGEMENT
# -----------------------------------------

def test_restaurants_endpoint(client, restaurant_and_food):
    response = client.get("/restaurants/")

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_restaurant_creation_requires_admin(client):
    response = client.post(
        "/restaurants/",
        json={
            "name": "Unauthorized Restaurant",
            "category": "Fast Food",
            "address": "Lahore"
        }
    )

    assert response.status_code == 401


def test_customer_cannot_create_restaurant(client, customer_auth):
    response = client.post(
        "/restaurants/",
        headers=customer_auth["headers"],
        json={
            "name": "Unauthorized Restaurant",
            "category": "Fast Food",
            "address": "Lahore"
        }
    )

    assert response.status_code == 403


def test_admin_can_update_restaurant(
    client, admin_auth, restaurant_and_food
):
    restaurant_id = restaurant_and_food["restaurant"]["id"]

    response = client.patch(
        f"/restaurants/{restaurant_id}",
        headers=admin_auth["headers"],
        json={"name": "Updated Restaurant"}
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated Restaurant"


def test_admin_can_deactivate_restaurant(
    client, admin_auth, restaurant_and_food
):
    restaurant_id = restaurant_and_food["restaurant"]["id"]

    response = client.patch(
        f"/restaurants/{restaurant_id}/availability",
        headers=admin_auth["headers"],
        json={"is_active": False}
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is False


# -----------------------------------------
# FOOD MANAGEMENT
# -----------------------------------------

def test_restaurant_menu(client, restaurant_and_food):
    restaurant_id = restaurant_and_food["restaurant"]["id"]

    response = client.get(
        f"/restaurants/{restaurant_id}/foods"
    )

    assert response.status_code == 200
    assert response.json()[0]["name"] == "Test Burger"


def test_admin_can_update_food(
    client, admin_auth, restaurant_and_food
):
    food_id = restaurant_and_food["food"]["id"]

    response = client.patch(
        f"/foods/{food_id}",
        headers=admin_auth["headers"],
        json={"price": "650.00"}
    )

    assert response.status_code == 200
    assert float(response.json()["price"]) == 650.00


def test_admin_can_mark_food_unavailable(
    client, admin_auth, restaurant_and_food
):
    food_id = restaurant_and_food["food"]["id"]

    response = client.patch(
        f"/foods/{food_id}/availability",
        headers=admin_auth["headers"],
        json={"is_available": False}
    )

    assert response.status_code == 200
    assert response.json()["is_available"] is False


def test_customer_cannot_create_food(
    client, customer_auth, restaurant_and_food
):
    restaurant_id = restaurant_and_food["restaurant"]["id"]

    response = client.post(
        f"/restaurants/{restaurant_id}/foods",
        headers=customer_auth["headers"],
        json={
            "name": "Unauthorized Food",
            "description": "Not allowed",
            "price": "100.00"
        }
    )

    assert response.status_code == 403


# -----------------------------------------
# ORDERING
# -----------------------------------------

def test_customer_can_place_order(
    client, customer_auth, restaurant_and_food
):
    restaurant_id = restaurant_and_food["restaurant"]["id"]
    food_id = restaurant_and_food["food"]["id"]

    response = client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_id,
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": food_id,
                    "quantity": 2
                }
            ]
        }
    )

    assert response.status_code == 201

    order = response.json()

    assert float(order["total_amount"]) == 1000.00
    assert order["payment_method"] == "cash_on_delivery"
    assert order["status"] == "pending"
    assert len(order["items"]) == 1


def test_order_requires_login(client, restaurant_and_food):
    response = client.post(
        "/orders/",
        json={
            "restaurant_id": restaurant_and_food["restaurant"]["id"],
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": restaurant_and_food["food"]["id"],
                    "quantity": 1
                }
            ]
        }
    )

    assert response.status_code == 401


def test_customer_order_history(
    client, customer_auth, restaurant_and_food
):
    restaurant_id = restaurant_and_food["restaurant"]["id"]
    food_id = restaurant_and_food["food"]["id"]

    client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_id,
            "delivery_address": "Johar Town, Lahore",
            "items": [{"food_item_id": food_id, "quantity": 1}]
        }
    )

    response = client.get(
        "/orders/customer/me",
        headers=customer_auth["headers"]
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_customer_cannot_view_another_customers_order(
    client, customer_auth, second_customer_auth, restaurant_and_food
):
    restaurant_id = restaurant_and_food["restaurant"]["id"]
    food_id = restaurant_and_food["food"]["id"]

    order = client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_id,
            "delivery_address": "Johar Town, Lahore",
            "items": [{"food_item_id": food_id, "quantity": 1}]
        }
    ).json()

    response = client.get(
        f"/orders/{order['id']}",
        headers=second_customer_auth["headers"]
    )

    assert response.status_code == 403


# -----------------------------------------
# ADMIN ORDER MANAGEMENT
# -----------------------------------------

def test_admin_can_view_all_orders(
    client, customer_auth, admin_auth, restaurant_and_food
):
    client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_and_food["restaurant"]["id"],
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": restaurant_and_food["food"]["id"],
                    "quantity": 1
                }
            ]
        }
    )

    response = client.get(
        "/orders/admin/all",
        headers=admin_auth["headers"]
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_admin_can_update_order_status(
    client, customer_auth, admin_auth, restaurant_and_food
):
    order = client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_and_food["restaurant"]["id"],
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": restaurant_and_food["food"]["id"],
                    "quantity": 1
                }
            ]
        }
    ).json()

    response = client.patch(
        f"/orders/{order['id']}/status",
        headers=admin_auth["headers"],
        json={"status": "confirmed"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_invalid_order_status_transition_rejected(
    client, customer_auth, admin_auth, restaurant_and_food
):
    order = client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_and_food["restaurant"]["id"],
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": restaurant_and_food["food"]["id"],
                    "quantity": 1
                }
            ]
        }
    ).json()

    response = client.patch(
        f"/orders/{order['id']}/status",
        headers=admin_auth["headers"],
        json={"status": "delivered"}
    )

    assert response.status_code == 400


# -----------------------------------------
# INVOICES
# -----------------------------------------

def test_customer_can_download_invoice(
    client, customer_auth, restaurant_and_food
):
    order = client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_and_food["restaurant"]["id"],
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": restaurant_and_food["food"]["id"],
                    "quantity": 1
                }
            ]
        }
    ).json()

    response = client.get(
        f"/invoices/{order['id']}/pdf",
        headers=customer_auth["headers"]
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_customer_cannot_download_another_customers_invoice(
    client, customer_auth, second_customer_auth, restaurant_and_food
):
    order = client.post(
        "/orders/",
        headers=customer_auth["headers"],
        json={
            "restaurant_id": restaurant_and_food["restaurant"]["id"],
            "delivery_address": "Johar Town, Lahore",
            "items": [
                {
                    "food_item_id": restaurant_and_food["food"]["id"],
                    "quantity": 1
                }
            ]
        }
    ).json()

    response = client.get(
        f"/invoices/{order['id']}/pdf",
        headers=second_customer_auth["headers"]
    )

    assert response.status_code == 404


# -----------------------------------------
# ADMIN CUSTOMERS AND REPORTS
# -----------------------------------------

def test_admin_can_view_customers(client, admin_auth, customer_auth):
    response = client.get(
        "/admin/customers/",
        headers=admin_auth["headers"]
    )

    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_customer_cannot_view_admin_customer_list(
    client, customer_auth
):
    response = client.get(
        "/admin/customers/",
        headers=customer_auth["headers"]
    )

    assert response.status_code == 403


def test_admin_reports_load(client, admin_auth, customer_auth):
    response = client.get(
        "/admin/reports/summary?days=30",
        headers=admin_auth["headers"]
    )

    assert response.status_code == 200
    assert "total_revenue" in response.json()
    assert "total_orders" in response.json()
    assert "top_restaurants" in response.json()


def test_customer_cannot_view_admin_reports(
    client, customer_auth
):
    response = client.get(
        "/admin/reports/summary",
        headers=customer_auth["headers"]
    )

    assert response.status_code == 403