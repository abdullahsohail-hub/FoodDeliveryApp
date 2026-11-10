
from app.database import SessionLocal
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem


restaurants_data = [
    {
        "name": "FoodHub Burgers",
        "category": "American Burgers",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Classic Zinger Burger", "Crispy chicken fillet, fresh lettuce and signature mayo.", 550),
            ("Beef Smash Burger", "Double-seared beef patty with cheddar and house sauce.", 750),
            ("Loaded Fries", "Golden fries topped with cheese sauce and seasoning.", 400),
            ("Chicken Wings", "Crispy wings tossed in a spicy glaze.", 500),
            ("BBQ Beef Burger", "Grilled beef, smoky barbecue sauce and caramelised onions.", 850),
            ("Mushroom Swiss Burger", "Beef patty with sautéed mushrooms and Swiss-style cheese.", 900),
            ("Spicy Chicken Tenders", "Crispy chicken strips with a spicy dipping sauce.", 450),
            ("Onion Rings", "Crunchy battered onion rings.", 300),
            ("Chocolate Milkshake", "Thick chocolate milkshake made with ice cream.", 400),
            ("Classic Lemonade", "Chilled lemonade with freshly squeezed lemon.", 220),
        ],
    },
    {
        "name": "Pizza Palace",
        "category": "Italian Pizza",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Chicken Tikka Pizza", "Chicken tikka, mozzarella and peppers.", 1200),
            ("Fajita Pizza", "Chicken fajita, onions, capsicum and mozzarella.", 1250),
            ("Pepperoni Pizza", "Pepperoni slices with rich tomato sauce and mozzarella.", 1400),
            ("Garlic Bread", "Oven-baked bread with garlic butter.", 350),
            ("Four Cheese Pizza", "A blend of four cheeses on a thin crust.", 1450),
            ("Creamy Alfredo Pizza", "White sauce, grilled chicken and mushrooms.", 1350),
            ("BBQ Chicken Pizza", "Smoky BBQ chicken, onions and mozzarella.", 1300),
            ("Stuffed Crust Pizza", "Classic pizza with a cheese-filled crust.", 1550),
            ("Chicken Wings", "Oven-baked wings with a barbecue glaze.", 500),
            ("Peach Iced Tea", "Cold peach tea served over ice.", 250),
        ],
    },
    {
        "name": "Biryani Master",
        "category": "Pakistani Biryani",
        "address": "Canal Road, Lahore",
        "foods": [
            ("Chicken Biryani", "Fragrant basmati rice layered with spiced chicken.", 350),
            ("Beef Biryani", "Aromatic rice cooked with tender beef and whole spices.", 450),
            ("Chicken Pulao", "Mildly spiced rice cooked in chicken stock.", 350),
            ("Seekh Kebab", "Grilled minced chicken kebabs with traditional spices.", 300),
            ("Sindhi Biryani", "Spicy biryani with potatoes, chicken and tangy masala.", 420),
            ("Aloo Biryani", "Basmati rice with seasoned potatoes and herbs.", 280),
            ("Chicken Chapli Kebab", "Pan-grilled minced chicken patty with spices.", 350),
            ("Raita", "Cool yoghurt with cucumber and mint.", 100),
            ("Gulab Jamun", "Soft milk-based sweets soaked in sugar syrup.", 180),
            ("Sweet Lassi", "Traditional chilled yoghurt drink.", 200),
        ],
    },
    {
        "name": "Pasta Corner",
        "category": "Italian Pasta",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Alfredo Pasta", "Pasta tossed in creamy white sauce.", 650),
            ("Arrabbiata Pasta", "Penne in a spicy tomato and garlic sauce.", 600),
            ("Chicken Lasagna", "Layers of pasta, chicken, sauce and melted cheese.", 750),
            ("Mac and Cheese", "Creamy macaroni with a rich cheese sauce.", 550),
            ("Chicken Pesto Pasta", "Pasta with basil pesto, chicken and parmesan.", 780),
            ("Creamy Mushroom Pasta", "Mushrooms in a smooth garlic cream sauce.", 700),
            ("Spaghetti Bolognese", "Spaghetti served with a rich minced beef tomato sauce.", 850),
            ("Baked Penne", "Penne baked with tomato sauce and mozzarella.", 750),
            ("Bruschetta", "Toasted bread topped with tomato and basil.", 300),
            ("Italian Lemon Soda", "Sparkling lemon drink with a refreshing citrus taste.", 280),
        ],
    },
    {
        "name": "Desi Dera",
        "category": "Traditional Pakistani",
        "address": "Model Town, Lahore",
        "foods": [
            ("Chicken Karahi", "Traditional chicken karahi with tomatoes and green chillies.", 1100),
            ("Chicken Handi", "Creamy chicken handi cooked with aromatic spices.", 1200),
            ("Chicken Tikka", "Char-grilled chicken marinated in desi spices.", 450),
            ("Roghni Naan", "Soft oven-baked naan topped with sesame seeds.", 100),
            ("Mutton Karahi", "Tender mutton cooked in a traditional karahi masala.", 1800),
            ("Daal Makhani", "Slow-cooked lentils in a creamy buttery sauce.", 550),
            ("Beef Nihari", "Slow-cooked beef in a rich traditional gravy.", 850),
            ("Chicken Seekh Kebab", "Minced chicken kebabs grilled over charcoal.", 400),
            ("Kheer", "Traditional chilled rice pudding.", 220),
            ("Mint Lemonade", "Fresh mint and lemon blended into a chilled drink.", 200),
        ],
    },
    {
        "name": "Wrap House",
        "category": "Wraps and Mexican Street Food",
        "address": "Faisal Town, Lahore",
        "foods": [
            ("Chicken Chipotle Wrap", "Grilled chicken, vegetables and smoky chipotle sauce.", 450),
            ("Mexican Beef Wrap", "Seasoned beef with salsa and fresh vegetables.", 550),
            ("Crispy Chicken Wrap", "Crunchy chicken strips with creamy dressing.", 400),
            ("Loaded Nachos", "Tortilla chips with cheese, salsa and jalapeños.", 450),
            ("Chicken Quesadilla", "Grilled tortilla filled with chicken and melted cheese.", 600),
            ("Beef Burrito", "Large tortilla packed with beef, rice, beans and salsa.", 650),
            ("Chicken Fajita Bowl", "Seasoned chicken with rice, peppers and beans.", 580),
            ("Jalapeño Cheese Bites", "Crispy bites filled with cheese and jalapeños.", 350),
            ("Classic Iced Tea", "Freshly brewed chilled iced tea.", 200),
            ("Strawberry Cooler", "Chilled strawberry and citrus refreshment.", 280),
        ],
    },
    {
        "name": "Sweet Treats",
        "category": "Desserts and Bakery",
        "address": "Gulberg, Lahore",
        "foods": [
            ("Chocolate Brownie", "Fudgy chocolate brownie with a soft centre.", 250),
            ("Chocolate Cake", "Moist layered chocolate cake slice.", 350),
            ("Lotus Cheesecake", "Creamy cheesecake with Lotus biscuit topping.", 450),
            ("Chocolate Sundae", "Vanilla ice cream topped with chocolate sauce.", 300),
            ("Red Velvet Cupcake", "Soft red velvet sponge with cream cheese frosting.", 280),
            ("Strawberry Waffle", "Warm waffle topped with strawberries and cream.", 450),
            ("Cookie Dough", "Chocolate chip cookie dough dessert.", 350),
            ("Caramel Pudding", "Silky baked custard with caramel topping.", 300),
            ("Oreo Milkshake", "Thick milkshake blended with Oreo biscuits.", 400),
            ("Iced Mocha", "Cold espresso blended with chocolate and milk.", 350),
        ],
    },
    {
        "name": "Grill Station",
        "category": "BBQ and Grilled Food",
        "address": "DHA, Lahore",
        "foods": [
            ("Chicken Malai Boti", "Creamy marinated chicken grilled over charcoal.", 550),
            ("Chicken Seekh Kebab", "Traditional minced chicken kebabs.", 400),
            ("Beef Boti", "Tender beef cubes marinated with spices and grilled.", 650),
            ("BBQ Platter", "Selection of grilled chicken and beef favourites.", 1400),
            ("Afghani Boti", "Mildly spiced creamy chicken grilled until tender.", 600),
            ("Beef Seekh Kebab", "Charcoal-grilled beef kebabs with herbs.", 550),
            ("Grilled Chicken Breast", "Herb-seasoned chicken breast with vegetables.", 750),
            ("Masala Fries", "Crispy fries tossed in house masala seasoning.", 250),
            ("Fresh Mint Margarita", "Mint, lemon and soda served chilled.", 250),
            ("Pepsi", "Chilled soft drink.", 120),
        ],
    },
    {
        "name": "Sushi House",
        "category": "Japanese Sushi and Ramen",
        "address": "Gulberg, Lahore",
        "foods": [
            ("California Roll", "Crab-style filling, cucumber and avocado in seasoned rice.", 850),
            ("Salmon Maki", "Fresh salmon rolled with seasoned sushi rice.", 1100),
            ("Crispy Tempura Roll", "Crunchy prawn tempura with rice and special sauce.", 1050),
            ("Chicken Teriyaki Bowl", "Grilled teriyaki chicken served over steamed rice.", 750),
            ("Chicken Ramen", "Japanese noodle soup with chicken and vegetables.", 850),
            ("Vegetable Gyoza", "Japanese pan-fried dumplings with vegetable filling.", 550),
            ("Prawn Tempura", "Lightly battered prawns served with dipping sauce.", 950),
            ("Edamame", "Steamed soybeans lightly seasoned with salt.", 350),
            ("Matcha Latte", "Japanese green tea blended with milk.", 400),
            ("Yuzu Lemonade", "Citrus lemonade with a Japanese yuzu-inspired flavour.", 350),
        ],
    },
    {
        "name": "Taco Loco",
        "category": "Mexican Street Food",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Beef Street Tacos", "Soft tortillas filled with seasoned beef and salsa.", 650),
            ("Chicken Tacos", "Grilled chicken with pico de gallo and lime.", 550),
            ("Chicken Burrito", "Rice, beans, grilled chicken and salsa wrapped in a tortilla.", 700),
            ("Beef Quesadilla", "Toasted tortilla filled with beef and melted cheese.", 750),
            ("Loaded Mexican Nachos", "Corn chips topped with cheese, beans and jalapeños.", 550),
            ("Chicken Enchiladas", "Tortillas filled with chicken and baked in red sauce.", 700),
            ("Mexican Rice Bowl", "Seasoned rice with beans, corn and salsa.", 500),
            ("Churros", "Fried cinnamon pastry served with chocolate dip.", 350),
            ("Horchata", "Chilled cinnamon and rice-based Mexican drink.", 300),
            ("Mango Agua Fresca", "Refreshing mango drink with a light citrus finish.", 280),
        ],
    },
    {
        "name": "Seoul Kitchen",
        "category": "Korean Cuisine",
        "address": "DHA, Lahore",
        "foods": [
            ("Korean Fried Chicken", "Crispy chicken coated in sweet and spicy Korean glaze.", 750),
            ("Beef Bibimbap", "Rice bowl with beef, vegetables and Korean-style sauce.", 850),
            ("Chicken Bibimbap", "Korean rice bowl with chicken and assorted vegetables.", 750),
            ("Tteokbokki", "Chewy rice cakes cooked in a spicy Korean sauce.", 600),
            ("Japchae Noodles", "Sweet potato noodles stir-fried with vegetables.", 650),
            ("Korean Beef Bulgogi", "Thinly sliced beef marinated in a savoury sweet sauce.", 950),
            ("Kimchi Fried Rice", "Fried rice with Korean-style fermented cabbage.", 600),
            ("Korean Dumplings", "Steamed dumplings with a savoury filling.", 500),
            ("Korean Banana Milk", "Sweet chilled banana-flavoured milk.", 300),
            ("Yuja Tea", "Korean citrus tea served warm or chilled.", 280),
        ],
    },
    {
        "name": "Ocean Basket",
        "category": "Seafood",
        "address": "Gulberg, Lahore",
        "foods": [
            ("Fish and Chips", "Golden battered fish served with seasoned fries.", 950),
            ("Grilled Lemon Fish", "Grilled fish fillet with lemon butter sauce.", 1100),
            ("Garlic Butter Prawns", "Prawns sautéed in garlic butter.", 1200),
            ("Crispy Calamari", "Lightly fried squid rings with dipping sauce.", 850),
            ("Seafood Pasta", "Pasta tossed with prawns and a creamy seafood sauce.", 1050),
            ("Grilled Salmon", "Salmon fillet with herbs and seasonal vegetables.", 1600),
            ("Prawn Tempura", "Crispy prawns served with a light dipping sauce.", 1100),
            ("Tuna Sandwich", "Tuna filling with lettuce in toasted bread.", 550),
            ("Classic Lime Soda", "Sparkling lime drink served chilled.", 220),
            ("Tropical Fruit Cooler", "Mixed tropical fruit drink served over ice.", 300),
        ],
    },
    {
        "name": "Morning Theory",
        "category": "Breakfast and Cafe",
        "address": "Model Town, Lahore",
        "foods": [
            ("Classic Pancakes", "Fluffy pancakes served with maple-style syrup.", 550),
            ("Nutella French Toast", "Golden French toast topped with chocolate spread.", 650),
            ("Eggs Benedict", "Poached eggs served on toasted bread with creamy sauce.", 750),
            ("Cheese Omelette", "Three-egg omelette with melted cheese.", 450),
            ("Chicken Club Sandwich", "Toasted sandwich layered with chicken and vegetables.", 600),
            ("Avocado Toast", "Sourdough toast topped with avocado and seasoning.", 650),
            ("Belgian Waffles", "Crisp waffles served with cream and fruit.", 600),
            ("Breakfast Platter", "Eggs, toast, sausages and breakfast potatoes.", 850),
            ("Cappuccino", "Espresso topped with steamed milk foam.", 350),
            ("Caramel Iced Latte", "Cold espresso with milk and caramel.", 400),
            ("Fresh Orange Juice", "Freshly squeezed orange juice.", 300),
        ],
    },
    {
        "name": "Dragon Wok",
        "category": "Chinese Cuisine",
        "address": "Johar Town, Lahore",
        "foods": [
            ("Chicken Chow Mein", "Stir-fried noodles with chicken and vegetables.", 650),
            ("Beef Chilli Dry", "Beef strips tossed with chillies and savoury sauce.", 850),
            ("Chicken Manchurian", "Chicken pieces in a tangy Manchurian sauce.", 700),
            ("Egg Fried Rice", "Wok-fried rice with egg and spring onions.", 450),
            ("Chicken Hakka Noodles", "Wok-tossed noodles with chicken and vegetables.", 600),
            ("Kung Pao Chicken", "Chicken stir-fried with peanuts and spicy sauce.", 750),
            ("Vegetable Spring Rolls", "Crispy rolls filled with seasoned vegetables.", 350),
            ("Chicken Dumplings", "Steamed dumplings filled with seasoned chicken.", 550),
            ("Classic Milk Tea", "Creamy tea served chilled or warm.", 250),
            ("Brown Sugar Bubble Tea", "Milk tea with brown sugar flavour and tapioca pearls.", 450),
        ],
    },
    {
        "name": "Beirut Table",
        "category": "Lebanese and Middle Eastern",
        "address": "DHA, Lahore",
        "foods": [
            ("Chicken Shawarma", "Marinated chicken wrapped with garlic sauce and pickles.", 450),
            ("Beef Shawarma Platter", "Sliced beef served with rice, salad and sauces.", 850),
            ("Hummus with Pita", "Creamy chickpea dip served with warm pita bread.", 450),
            ("Falafel Wrap", "Crispy chickpea falafel with tahini and vegetables.", 500),
            ("Chicken Shish Tawook", "Lebanese-style grilled chicken skewers.", 750),
            ("Mixed Grill Platter", "Selection of grilled meats with rice and dips.", 1400),
            ("Fattoush Salad", "Fresh salad with toasted pita and tangy dressing.", 450),
            ("Baba Ganoush", "Smoky roasted aubergine dip with olive oil.", 400),
            ("Fresh Mint Lemonade", "Lemonade blended with fresh mint.", 280),
            ("Mango Lassi", "Creamy yoghurt drink blended with mango.", 300),
        ],
    },
]


def seed_database():
    db = SessionLocal()

    try:
        for data in restaurants_data:
            restaurant = (
                db.query(Restaurant)
                .filter(Restaurant.name.ilike(data["name"]))
                .first()
            )

            if restaurant is None:
                restaurant = Restaurant(
                    name=data["name"],
                    category=data["category"],
                    address=data["address"],
                    is_active=True,
                )
                db.add(restaurant)
                db.flush()
                print(f"Added restaurant: {restaurant.name}")
            else:
                print(f"Found existing restaurant: {restaurant.name}")

            existing_foods = {
                food.name.strip().lower(): food
                for food in db.query(FoodItem)
                .filter(FoodItem.restaurant_id == restaurant.id)
                .all()
            }

            for name, description, price in data["foods"]:
                if name.strip().lower() in existing_foods:
                    continue

                food = FoodItem(
                    name=name,
                    description=description,
                    price=price,
                    is_available=True,
                    restaurant_id=restaurant.id,
                )
                db.add(food)
                print(f"  Added menu item: {name}")

        db.commit()

        total_restaurants = db.query(Restaurant).count()
        total_foods = db.query(FoodItem).count()

        print("\nFOODHUB SEED COMPLETE")
        print("=====================")
        print(f"Total restaurants: {total_restaurants}")
        print(f"Total food items: {total_foods}")

        if total_restaurants != 15:
            print(
                "\nNOTE: Your database does not contain exactly 15 restaurants. "
                "Check for old or differently named restaurant entries."
            )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
