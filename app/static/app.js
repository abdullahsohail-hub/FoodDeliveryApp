
const API = "";

let token = localStorage.getItem("foodhub_token");
let currentRestaurant = null;
let cart = [];

const RESTAURANT_DESIGNS = {
    "burger lab": {
        description: "A classic burger kitchen serving crispy chicken, stacked beef burgers and satisfying sides.",
        accent: "#c62828", soft: "#fff0ed", dark: "#651b1b", style: "stacked"
    },
    "foodhub burgers": {
        description: "American-style burgers, crispy chicken sandwiches and loaded sides made for serious cravings.",
        accent: "#d92727", soft: "#fff0ef", dark: "#641414", style: "bold"
    },
    "pizza palace": {
        description: "Oven-baked pizzas with rich tomato sauce, generous toppings and golden melted cheese.",
        accent: "#d94b35", soft: "#fff0e9", dark: "#70261b", style: "italian"
    },
    "biryani master": {
        description: "Aromatic dum biryani layered with fragrant basmati rice, tender meat and traditional Pakistani spices.",
        accent: "#c58a17", soft: "#fff7df", dark: "#60420c", style: "heritage"
    },
    "pasta corner": {
        description: "Italian-inspired pasta, rich sauces, fresh herbs and comforting oven-baked favourites.",
        accent: "#367b51", soft: "#eaf5ed", dark: "#19482c", style: "modern"
    },
    "desi dera": {
        description: "Traditional Pakistani cooking, from rich karahi and slow-cooked curries to freshly prepared naan.",
        accent: "#95602e", soft: "#f8eee1", dark: "#56351b", style: "heritage"
    },
    "wrap house": {
        description: "Freshly assembled wraps, grilled fillings, house sauces and satisfying street-food sides.",
        accent: "#668b27", soft: "#f1f8e6", dark: "#3d5515", style: "fresh"
    },
    "sweet treats": {
        description: "A dessert collection of cakes, brownies, pastries, ice cream and freshly prepared sweet favourites.",
        accent: "#d45b91", soft: "#fff0f6", dark: "#7b2850", style: "soft"
    },
    "grill station": {
        description: "Chargrilled meats, smoky marinades and barbecue favourites prepared with bold seasoning.",
        accent: "#e05a27", soft: "#fff0e8", dark: "#65250d", style: "dark"
    },
    "sushi house": {
        description: "Japanese-inspired sushi, rice bowls, ramen and carefully prepared Asian favourites.",
        accent: "#354b83", soft: "#edf1fc", dark: "#202f58", style: "minimal"
    },
    "taco loco": {
        description: "Mexican street-food favourites featuring loaded tacos, fresh salsa and bold fillings.",
        accent: "#df7627", soft: "#fff2df", dark: "#71390d", style: "vibrant"
    },
    "seoul kitchen": {
        description: "Korean comfort food featuring savoury rice bowls, glazed chicken and traditional noodles.",
        accent: "#8e426d", soft: "#f8edf4", dark: "#562443", style: "modern"
    },
    "ocean basket": {
        description: "Seafood favourites featuring grilled fish, prawns, calamari and coastal-inspired dishes.",
        accent: "#1685a0", soft: "#e8f7fb", dark: "#0c4c5c", style: "coastal"
    },
    "morning theory": {
        description: "A relaxed café serving breakfast plates, freshly brewed coffee and bakery favourites.",
        accent: "#91613f", soft: "#f5eee7", dark: "#533722", style: "cafe"
    },
    "dragon wok": {
        description: "Wok-inspired Chinese dishes, fried rice, noodles and stir-fried favourites.",
        accent: "#b72b2b", soft: "#fff0f0", dark: "#661616", style: "bold"
    },
    "beirut table": {
        description: "Lebanese and Middle Eastern favourites with shawarma, hummus, grilled kebabs and fresh wraps.",
        accent: "#75834b", soft: "#f1f4e7", dark: "#46502c", style: "earthy"
    }
};

/* UNIQUE RESTAURANT IMAGES */

const RESTAURANT_IMAGES = {
    "burger lab": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop",
    "foodhub burgers": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&auto=format&fit=crop",
    "pizza palace": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop",

    // Updated Biryani Master image
    "biryani master": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900&auto=format&fit=crop",

    "pasta corner": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&auto=format&fit=crop",
    "desi dera": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900&auto=format&fit=crop",
    "wrap house": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=900&auto=format&fit=crop",
    "sweet treats": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&auto=format&fit=crop",
    "grill station": "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop",
    "sushi house": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&auto=format&fit=crop",
    "taco loco": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=900&auto=format&fit=crop",
    "seoul kitchen": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=900&auto=format&fit=crop",
    "ocean basket": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&auto=format&fit=crop",
    "morning theory": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop",
    "dragon wok": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&auto=format&fit=crop",
    "beirut table": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop"
};

const BIRYANI_FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=900&auto=format&fit=crop";

const RATINGS = {
    "burger lab": "4.4",
    "foodhub burgers": "4.3",
    "pizza palace": "4.6",
    "biryani master": "4.8",
    "pasta corner": "4.7",
    "desi dera": "4.4",
    "wrap house": "4.5",
    "sweet treats": "4.8",
    "grill station": "4.7",
    "sushi house": "4.9",
    "taco loco": "4.6",
    "seoul kitchen": "4.8",
    "ocean basket": "4.7",
    "morning theory": "4.5",
    "dragon wok": "4.6",
    "beirut table": "4.8"
};

function getRestaurantDesign(restaurant) {
    const name = String(restaurant.name || "").trim().toLowerCase();

    return RESTAURANT_DESIGNS[name] || {
        description: restaurant.description || "Freshly prepared favourites made with care.",
        accent: "#f36b32",
        soft: "#fff0e8",
        dark: "#702b18",
        style: "modern"
    };
}

function getRestaurantDescription(restaurant) {
    return getRestaurantDesign(restaurant).description;
}

function getRestaurantRating(restaurant) {
    const name = String(restaurant.name || "").trim().toLowerCase();
    return RATINGS[name] || "4.5";
}

function getRestaurantImage(restaurant) {
    const name = String(restaurant.name || "").trim().toLowerCase();
    return RESTAURANT_IMAGES[name] || RESTAURANT_IMAGES["burger lab"];
}

function getSlug(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function getFoodStyle(food, index) {
    const name = String(food.name || "").toLowerCase();

    const categories = [
        { keywords: ["drink", "tea", "coffee", "juice", "lemonade", "lassi", "soda", "milkshake"], type: "drink" },
        { keywords: ["cake", "brownie", "cheesecake", "pudding", "waffle", "churros", "ice cream"], type: "dessert" },
        { keywords: ["rice", "biryani", "pulao", "bibimbap"], type: "rice" },
        { keywords: ["pizza", "flatbread", "naan", "bread"], type: "baked" },
        { keywords: ["pasta", "noodle", "ramen", "spaghetti", "lasagna"], type: "noodles" },
        { keywords: ["burger", "sandwich", "wrap", "shawarma", "burrito"], type: "handheld" },
        { keywords: ["fish", "prawn", "shrimp", "calamari", "salmon", "seafood"], type: "seafood" },
        { keywords: ["grill", "kebab", "boti", "karahi", "steak", "chicken", "beef"], type: "grilled" }
    ];

    const match = categories.find(category =>
        category.keywords.some(keyword => name.includes(keyword))
    );

    return match ? match.type : ["classic", "fresh", "special"][index % 3];
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function money(value) {
    return "Rs. " + Number(value || 0).toLocaleString("en-PK", {
        maximumFractionDigits: 2
    });
}

async function apiRequest(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(API + endpoint, {
        ...options,
        headers
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.detail || data.message || `Request failed (${response.status})`
        );
    }

    return data;
}

function notify(message) {
    const element = document.getElementById("notification");

    if (!element) {
        console.log(message);
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}

function getList(response) {
    if (Array.isArray(response)) return response;
    return response?.items || response?.results || [];
}

/* NAVIGATION */

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);
    if (!section) return;

    section.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (sectionId === "restaurants") loadRestaurants();
    if (sectionId === "cart") renderCart();
    if (sectionId === "orders") loadOrders();
    if (sectionId === "checkout") renderCheckout();
}

function updateAccount() {
    const login = document.getElementById("login-nav");
    const register = document.getElementById("register-nav");
    const logoutButton = document.getElementById("logout-nav");
    const accountName = document.getElementById("account-name");

    if (!login || !register || !logoutButton || !accountName) return;

    login.classList.toggle("hidden", !!token);
    register.classList.toggle("hidden", !!token);
    logoutButton.classList.toggle("hidden", !token);

    accountName.textContent = token
        ? (localStorage.getItem("foodhub_name") || "Account")
        : "";
}

function logout() {
    token = null;
    localStorage.removeItem("foodhub_token");
    localStorage.removeItem("foodhub_name");

    updateAccount();
    notify("Logged out successfully.");
    showSection("home");
}

/* RESTAURANTS */

async function loadRestaurants(search = "") {
    try {
        const endpoint =
            `/restaurants/?active_only=true&limit=100` +
            (search ? `&search=${encodeURIComponent(search)}` : "");

        const response = await apiRequest(endpoint);
        renderRestaurants(getList(response));

    } catch (error) {
        console.error("Restaurant loading error:", error);

        const container = document.getElementById("restaurant-list");

        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load restaurants</h3>
                    <p>${escapeHTML(error.message)}</p>
                </div>
            `;
        }
    }
}

function createRestaurantCard(restaurant, index) {
    const id = Number(restaurant.id);
    const name = escapeHTML(restaurant.name);
    const normalizedName = String(restaurant.name || "").trim().toLowerCase();

    const category = escapeHTML(
        restaurant.cuisine || restaurant.category || "Restaurant"
    );

    const rating = getRestaurantRating(restaurant);
    const image = getRestaurantImage(restaurant);

    const imageFallback = normalizedName === "biryani master"
        ? BIRYANI_FALLBACK_IMAGE
        : "";

    return `
        <article class="restaurant-card">

            <div class="restaurant-image">
                <img
                    src="${image}"
                    alt="${name}"
                    loading="lazy"
                    onerror="${imageFallback
                        ? `this.onerror=null;this.src='${imageFallback}';`
                        : "this.onerror=null;this.style.display='none';this.parentElement.classList.add('image-unavailable');"
                    }"
                >

                <div class="restaurant-image-overlay"></div>

                <span class="restaurant-category">${category}</span>

                <div class="restaurant-image-content">
                    <h3>${name}</h3>
                </div>
            </div>

            <div class="restaurant-info">
                <div class="restaurant-info-heading">
                    <h3>${name}</h3>
                    <span class="restaurant-rating">
                        <span class="rating-star">★</span> ${rating}
                    </span>
                </div>

                <p class="restaurant-description">
                    ${escapeHTML(getRestaurantDescription(restaurant))}
                </p>

                <div class="restaurant-meta">
                    <span>${category}</span>
                    <span>Freshly prepared</span>
                </div>

                <button class="restaurant-button" onclick="openRestaurant(${id})">
                    Explore Menu <span>→</span>
                </button>
            </div>

        </article>
    `;
}

function renderRestaurants(restaurants) {
    const featuredList = document.getElementById("featured-restaurants");
    const restaurantList = document.getElementById("restaurant-list");

    const cards = restaurants.map(createRestaurantCard).join("");

    if (restaurantList) {
        restaurantList.innerHTML = restaurants.length
            ? cards
            : `<div class="empty-state"><h3>No restaurants found</h3><p>Try another search.</p></div>`;
    }

    if (featuredList) {
        featuredList.innerHTML = restaurants.length
            ? restaurants.slice(0, 3).map(createRestaurantCard).join("")
            : `<div class="empty-state"><h3>No restaurants available yet.</h3></div>`;
    }
}

/* RESTAURANT MENU */

async function openRestaurant(restaurantId) {
    try {
        const response = await apiRequest(
            "/restaurants/?active_only=true&limit=100"
        );

        const restaurants = getList(response);

        currentRestaurant = restaurants.find(
            restaurant => Number(restaurant.id) === Number(restaurantId)
        );

        if (!currentRestaurant) {
            throw new Error("Restaurant not found.");
        }

        const menuHeading = document.getElementById("menu-heading");

        menuHeading.innerHTML = `
            <div class="menu-brand">
                <div class="menu-brand-topline">
                    <span class="eyebrow">FOODHUB COLLECTION</span>
                </div>

                <h1>${escapeHTML(currentRestaurant.name)}</h1>
                <p>${escapeHTML(getRestaurantDescription(currentRestaurant))}</p>

                <div class="menu-brand-footer">
                    <span>CURATED MENU</span>
                    <span>PREPARED FRESH</span>
                </div>
            </div>
        `;

        showSection("menu");

        const foodResponse = await apiRequest(
            `/restaurants/${restaurantId}/foods?available_only=true&limit=100`
        );

        renderFoodItems(getList(foodResponse));

    } catch (error) {
        console.error(error);
        notify(error.message);
    }
}

/* FOOD ITEMS */

function renderFoodItems(foods) {
    const container = document.getElementById("menu-items");

    if (!container) return;

    if (!foods.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No food items available</h3>
                <p>Check back later.</p>
            </div>
        `;
        return;
    }

    const design = getRestaurantDesign(currentRestaurant);

    container.innerHTML = foods.map((food, index) => {
        const name = escapeHTML(food.name);
        const description = escapeHTML(
            food.description || "Prepared fresh for your order."
        );

        const price = Number(food.price);
        const foodId = Number(food.id);
        const restaurantId = Number(currentRestaurant.id);
        const foodType = getFoodStyle(food, index);

        return `
            <article class="food-card">
                <div class="food-card-top" style="--food-accent:${design.accent};--food-soft:${design.soft}">
                    <span class="food-card-number">${String(index + 1).padStart(2, "0")}</span>
                    <span class="food-card-type">${foodType}</span>
                    <div class="food-card-decoration"></div>
                </div>

                <div class="food-info">
                    <h3>${name}</h3>
                    <p>${description}</p>

                    <div class="food-bottom">
                        <strong>${money(price)}</strong>

                        <button
                            class="add-button"
                            onclick="addToCartFromButton(this)"
                            data-food-id="${foodId}"
                            data-food-name="${name}"
                            data-food-price="${price}"
                            data-restaurant-id="${restaurantId}"
                        >
                            + Add
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function addToCartFromButton(button) {
    const foodId = Number(button.dataset.foodId);
    const name = button.dataset.foodName;
    const price = Number(button.dataset.foodPrice);
    const restaurantId = Number(button.dataset.restaurantId);

    if (!foodId || !name || !Number.isFinite(price) || !restaurantId) {
        notify("Unable to add this item. Please refresh the menu.");
        return;
    }

    addToCart(foodId, name, price, restaurantId);
}

/* SHOPPING CART */

function addToCart(foodId, name, price, restaurantId) {
    if (
        cart.length &&
        Number(cart[0].restaurantId) !== Number(restaurantId)
    ) {
        notify("Please finish your current restaurant order first.");
        return;
    }

    const existing = cart.find(
        item => Number(item.foodId) === Number(foodId)
    );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            foodId,
            name,
            price,
            restaurantId,
            quantity: 1
        });
    }

    updateCartCount();
    notify(`${name} added to cart.`);
}

function updateCartCount() {
    const element = document.getElementById("cart-count");
    if (!element) return;

    element.textContent = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}

function renderCart() {
    const container = document.getElementById("cart-items");
    const summary = document.getElementById("cart-summary");

    if (!container || !summary) return;

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Your cart is empty.</h3>
                <p>Find something delicious to order.</p>
                <button class="primary-button" onclick="showSection('restaurants')">
                    Explore restaurants
                </button>
            </div>
        `;

        summary.innerHTML = "";
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-details">
                <strong>${escapeHTML(item.name)}</strong>
                <p>${money(item.price)} each</p>
            </div>

            <div class="cart-item-actions">
                <button onclick="changeQuantity(${index}, -1)" aria-label="Decrease quantity">−</button>
                <strong>${item.quantity}</strong>
                <button onclick="changeQuantity(${index}, 1)" aria-label="Increase quantity">+</button>
                <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
            </div>

            <strong class="cart-item-total">${money(item.price * item.quantity)}</strong>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    summary.innerHTML = `
        <div class="cart-total-row">
            <span>Total</span>
            <strong>${money(total)}</strong>
        </div>
        <button class="primary-button full-button" onclick="showSection('checkout')">
            Proceed to checkout <span>→</span>
        </button>
    `;
}

function changeQuantity(index, amount) {
    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    if (!cart[index]) return;

    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

/* CHECKOUT */

async function renderCheckout() {
    if (!token) {
        notify("Please login before checking out.");
        showSection("login");
        return;
    }

    if (!cart.length) {
        notify("Your cart is empty.");
        showSection("restaurants");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const summary = document.getElementById("checkout-summary");

    if (summary) {
        summary.innerHTML = `
            ${cart.map(item => `
                <div class="checkout-summary-item">
                    <span>${escapeHTML(item.name)} × ${item.quantity}</span>
                    <strong>${money(item.price * item.quantity)}</strong>
                </div>
            `).join("")}
            <div class="cart-total-row">
                <span>Total</span>
                <strong>${money(total)}</strong>
            </div>
            <p class="checkout-cod-note">Payment: Cash on Delivery</p>
        `;
    }

    try {
        const profile = await apiRequest("/customers/me");
        const addressField = document.getElementById("checkout-address");

        if (profile.address && addressField && !addressField.value) {
            addressField.value = profile.address;
        }
    } catch (error) {
        console.warn("Could not retrieve customer address:", error);
    }
}

async function placeOrder() {
    if (!token) {
        notify("Please login first.");
        showSection("login");
        return;
    }

    if (!cart.length) {
        notify("Your cart is empty.");
        showSection("restaurants");
        return;
    }

    const addressField = document.getElementById("checkout-address");
    const address = addressField ? addressField.value.trim() : "";

    if (!address) {
        notify("Please enter your delivery address.");
        return;
    }

    const payload = {
        restaurant_id: cart[0].restaurantId,
        delivery_address: address,
        payment_method: "cash_on_delivery",
        items: cart.map(item => ({
            food_item_id: item.foodId,
            quantity: item.quantity
        }))
    };

    try {
        await apiRequest("/orders/", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        cart = [];
        updateCartCount();
        notify("Order placed successfully!");
        showSection("orders");

    } catch (error) {
        console.error(error);
        notify(error.message);
    }
}

/* ORDER HISTORY */

async function loadOrders() {
    const container = document.getElementById("order-list");

    if (!container) return;

    if (!token) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Login to view your orders.</h3>
                <button class="primary-button" onclick="showSection('login')">Login</button>
            </div>
        `;
        return;
    }

    try {
        const response = await apiRequest("/orders/customer/me");
        const orders = getList(response);

        if (!orders.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No orders yet.</h3>
                    <p>Your orders will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <article class="order-card">
                <div class="order-card-main">
                    <span class="eyebrow">FOODHUB ORDER</span>
                    <h3>Order #${Number(order.id)}</h3>
                    <p>Status: <strong>${escapeHTML(order.status || "Pending")}</strong></p>
                    <p>Total: <strong>${money(order.total_amount)}</strong></p>
                    <p>Payment: Cash on Delivery</p>
                </div>

                <button class="outline-button" onclick="downloadInvoice(${Number(order.id)})">
                    Download invoice ↓
                </button>
            </article>
        `).join("");

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <div class="empty-state">
                <h3>Could not load orders.</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;
    }
}

/* INVOICE DOWNLOAD */

async function downloadInvoice(orderId) {
    try {
        const schemaResponse = await fetch("/openapi.json");

        if (!schemaResponse.ok) {
            throw new Error("Could not inspect the invoice API.");
        }

        const schema = await schemaResponse.json();

        const candidates = Object.entries(schema.paths || {})
            .filter(([path, methods]) =>
                path.toLowerCase().includes("invoice") && methods.get
            );

        if (!candidates.length) {
            throw new Error("No invoice download endpoint was found.");
        }

        let selectedPath = candidates.find(([path]) =>
            path.includes("{order_id}") || path.includes("{id}")
        );

        if (!selectedPath) selectedPath = candidates[0];

        const endpoint = selectedPath[0]
            .replace("{order_id}", String(orderId))
            .replace("{id}", String(orderId));

        const response = await fetch(API + endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Unable to download invoice.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `FoodHub-Invoice-${orderId}.pdf`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
        console.error(error);
        notify(error.message);
    }
}

/* LOGIN */

document.getElementById("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        token = data.access_token;

        localStorage.setItem("foodhub_token", token);
        localStorage.setItem("foodhub_name", data.customer_name || "Account");

        updateAccount();
        notify("Welcome back!");
        showSection("home");

    } catch (error) {
        console.error("Login error:", error);
        notify(error.message || "Login failed. Please try again.");
    }
});

/* REGISTRATION */

document.getElementById("register-form").addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
        name: document.getElementById("register-name").value.trim(),
        email: document.getElementById("register-email").value.trim(),
        phone: document.getElementById("register-phone").value.trim(),
        address: document.getElementById("register-address").value.trim(),
        password: document.getElementById("register-password").value
    };

    try {
        await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        notify("Account created. Please login.");
        showSection("login");

    } catch (error) {
        console.error(error);
        notify(error.message);
    }
});

/* SEARCH */

const restaurantSearch = document.getElementById("restaurant-search");

if (restaurantSearch) {
    let searchTimeout;

    restaurantSearch.addEventListener("input", () => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            loadRestaurants(restaurantSearch.value.trim());
        }, 250);
    });
}

/* MOBILE NAVIGATION */

const mobileToggle = document.getElementById("mobile-menu-toggle");

if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
        document.querySelector(".desktop-nav")?.classList.toggle("mobile-open");
    });
}

/* INITIALIZATION */

updateAccount();
updateCartCount();
loadRestaurants();
