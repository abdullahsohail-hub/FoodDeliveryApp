
from getpass import getpass

from app.database import SessionLocal
from app.models.customer import Customer
from app.security import hash_password


def create_admin():
    print("\nFOODHUB - ADMIN ACCOUNT SETUP")
    print("=" * 35)

    email = input("Enter the registered customer email: ").strip().lower()

    if not email:
        print("ERROR: Email cannot be empty.")
        return

    password = getpass("Enter the new admin password: ")
    confirm_password = getpass("Confirm the admin password: ")

    if len(password) < 8:
        print("ERROR: Password must be at least 8 characters.")
        return

    if password != confirm_password:
        print("ERROR: Passwords do not match.")
        return

    db = SessionLocal()

    try:
        customer = db.query(Customer).filter(
            Customer.email == email
        ).first()

        if customer is None:
            print("\nERROR: No account found.")
            print("Register a customer account first.")
            return

        customer.is_admin = True
        customer.password_hash = hash_password(password)

        db.commit()

        print("\nADMIN ACCOUNT CREATED SUCCESSFULLY")
        print("-----------------------------------")
        print(f"Email: {customer.email}")
        print("Administrator access: Enabled")
        print("Password: Securely stored as a hash")

    except Exception as error:
        db.rollback()
        print("\nERROR WHILE CREATING ADMIN:")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
