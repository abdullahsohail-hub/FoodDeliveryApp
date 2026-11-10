from app.database import SessionLocal
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem

restaurants_data = [
    {
        "name": "FoodHub Burgers",
        "category": "Burgers",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Classic Zinger Burger", "Crispy chicken fillet with special sauce", 550),
            ("Beef Smash Burger", "Beef patty with cheese and sauce", 750),
            ("Loaded Fries", "Fries topped with cheese and sauce", 400),
            ("Chicken Wings", "Spicy crispy chicken wings", 500),
        ],
    },
    {
        "name": "Pizza Palace",
        "category": "Pizza",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Chicken Tikka Pizza", "Chicken tikka, cheese and vegetables", 1200),
            ("Fajita Pizza", "Chicken fajita with mozzarella", 1250),
            ("Pepperoni Pizza", "Pepperoni and mozzarella cheese", 1400),
            ("Garlic Bread", "Toasted garlic bread", 350),
        ],
    },
    {
        "name": "Biryani Master",
        "category": "Pakistani",
        "address": "Canal Road, Lahore",
        "foods": [
            ("Chicken Biryani", "Traditional spicy chicken biryani", 350),
            ("Beef Biryani", "Aromatic beef biryani", 450),
            ("Chicken Pulao", "Chicken pulao with raita", 350),
            ("Seekh Kebab", "Grilled chicken seekh kebabs", 300),
        ],
    },
    {
        "name": "Pasta Corner",
        "category": "Italian",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Alfredo Pasta", "Creamy white sauce pasta", 650),
            ("Arrabbiata Pasta", "Spicy tomato sauce pasta", 600),
            ("Chicken Lasagna", "Baked chicken lasagna", 750),
            ("Mac and Cheese", "Creamy macaroni and cheese", 550),
        ],
    },
    {
        "name": "Desi Dera",
        "category": "Pakistani",
        "address": "Model Town, Lahore",
        "foods": [
            ("Chicken Karahi", "Traditional chicken karahi", 1100),
            ("Chicken Handi", "Creamy chicken handi", 1200),
            ("Chicken Tikka", "Grilled chicken tikka", 450),
            ("Roghni Naan", "Fresh baked roghni naan", 100),
        ],
    },
    {
        "name": "Wrap House",
        "category": "Fast Food",
        "address": "Faisal Town, Lahore",
        "foods": [
            ("Chicken Chipotle Wrap", "Chicken wrap with chipotle sauce", 450),
            ("Mexican Beef Wrap", "Beef with Mexican spices", 550),
            ("Crispy Chicken Wrap", "Crispy chicken with fresh vegetables", 400),
            ("Loaded Nachos", "Nachos with cheese and salsa", 450),
        ],
    },
    {
        "name": "Sweet Treats",
        "category": "Desserts",
        "address": "Gulberg, Lahore",
        "foods": [
            ("Chocolate Brownie", "Rich chocolate brownie", 250),
            ("Chocolate Cake", "Chocolate layered cake slice", 350),
            ("Lotus Cheesecake", "Creamy Lotus cheesecake", 450),
            ("Chocolate Sundae", "Ice cream with chocolate sauce", 300),
        ],
    },
    {
        "name": "Grill Station",
        "category": "BBQ",
        "address": "DHA, Lahore",
        "foods": [
            ("Chicken Malai Boti", "Creamy grilled chicken pieces", 550),
            ("Chicken Seekh Kebab", "Grilled chicken kebabs", 400),
            ("Beef Boti", "Spiced grilled beef", 650),
            ("BBQ Platter", "Assorted grilled meats", 1400),
        ],
    },
]


def seed_database():
    db = SessionLocal()

    try:
        existing_restaurants = db.query(Restaurant).all()

        if len(existing_restaurants) > 8:
            print("Your database already has more than 8 restaurants.")
            print("No restaurants were added.")
            return

        for data in restaurants_data:
            restaurant = (
                db.query(Restaurant)
                .filter(Restaurant.name == data["name"])
                .first()
            )

            if restaurant is None:
                current_count = db.query(Restaurant).count()

                if current_count >= 8:
                    break

                restaurant = Restaurant(
                    name=data["name"],
                    category=data["category"],
                    address=data["address"],
                    is_active=True,
                )

                db.add(restaurant)
                db.flush()

                print(f"Added restaurant: {restaurant.name}")

            existing_foods = {
                food.name
                for food in db.query(FoodItem)
                .filter(FoodItem.restaurant_id == restaurant.id)
                .all()
            }

            for name, description, price in data["foods"]:
                if name in existing_foods:
                    continue

                food = FoodItem(
                    name=name,
                    description=description,
                    price=price,
                    is_available=True,
                    restaurant_id=restaurant.id,
                )

                db.add(food)
                print(f"  Added: {name}")

        db.commit()

        total_restaurants = db.query(Restaurant).count()
        total_foods = db.query(FoodItem).count()

        print("\nFoodHub demo data setup complete.")
        print(f"Total restaurants: {total_restaurants}")
        print(f"Total food items: {total_foods}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()