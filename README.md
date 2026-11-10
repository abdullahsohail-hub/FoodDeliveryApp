
# FoodHub - Multi-Restaurant Food Delivery System

FoodHub is a Python-based food delivery application built with FastAPI, SQLAlchemy, SQLite and JavaScript.

## Features

- Customer registration and login
- Multiple restaurants and food menus
- Shopping cart and order placement
- Cash on Delivery
- Order management
- Admin dashboard
- Restaurant and food management
- Customer management
- Sales reports
- Secure password hashing and JWT authentication

## Requirements

- Python 3.11 or newer
- Git

## Installation

Clone the repository:

```bash
git clone https://github.com/abdullahsohail-hub/FoodDeliveryApp.git
cd FoodDeliveryApp
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Environment Setup

Copy `.env.example` to `.env`.

Generate a unique secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Put the generated key in your `.env` file.

Each installation should use its own secret key and database.

## Demo Data

Run:

```bash
python seed_demo_data.py
```

## Start FoodHub

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Open:

- Customer application: http://127.0.0.1:8001/
- Admin dashboard: http://127.0.0.1:8001/admin.html
- API documentation: http://127.0.0.1:8001/docs

## Administrator Setup

1. Register a normal customer account through the application.
2. Run:

```bash
python create_admin.py
```

3. Enter the registered email address.
4. Set an administrator password.

Administrator privileges are assigned locally through this setup script.

## Security

- Never publish your `.env` file.
- Never publish your database.
- Never share your secret key.
- Each installation should maintain its own database and administrator account.

## Technology Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite
- PostgreSQL support
- JavaScript
- HTML
- CSS
