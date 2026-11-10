
const API = "";

let token = localStorage.getItem("foodhub_token");
let currentRestaurant = null;
let cart = [];

/* ------------------------------
   IMAGE CONFIGURATION
------------------------------ */

function imageURL(id) {
    if (String(id).startsWith("http")) return id;

    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
}

const RESTAURANT_DESIGNS = {
    "biryani master": {
        image: "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg",
        icon: "🍛"
    },
    "desi dera": {
        image: "photo-1589302168068-964664d93dc0",
        icon: "🫓"
    },
    "burger lab": {
        image: "photo-1568901346375-23c9450c58cd",
        icon: "🍔"
    },
    "foodhub burgers": {
        image: "photo-1550547660-d9450f859349",
        icon: "🍔"
    },
    "pizza palace": {
        image: "photo-1513104890138-7c749659a591",
        icon: "🍕"
    },
    "pasta corner": {
        image: "photo-1473093295043-cdd812d0e601",
        icon: "🍝"
    },
    "wrap house": {
        image: "photo-1626700051175-6818013e1d4f",
        icon: "🌯"
    }
};

const RESTAURANT_DEFAULTS = [
    "photo-1555396273-367ea4eb4db5",
    "photo-1414235077428-338989a2e8c0",
    "photo-1559339352-11d035aa65de",
    "photo-1517248135467-4c7edcad34c4",
    "photo-1513104890138-7c749659a591"
];

function getRestaurantDesign(restaurant, index = 0) {
    const name = String(restaurant.name || "").trim().toLowerCase();

    if (RESTAURANT_DESIGNS[name]) {
        return RESTAURANT_DESIGNS[name];
    }

    const cuisine = String(
        restaurant.cuisine || restaurant.category || ""
    ).toLowerCase();

    if (cuisine.includes("pizza")) {
        return { image: "photo-1513104890138-7c749659a591", icon: "🍕" };
    }

    if (cuisine.includes("pasta")) {
        return { image: "photo-1473093295043-cdd812d0e601", icon: "🍝" };
    }

    if (cuisine.includes("burger")) {
        return { image: "photo-1550547660-d9450f859349", icon: "🍔" };
    }

    if (cuisine.includes("biryani") || cuisine.includes("pakistani")) {
        return {
            image: "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg",
            icon: "🍛"
        };
    }

    if (cuisine.includes("chinese")) {
        return { image: "photo-1525755662778-989d0524087e", icon: "🥡" };
    }

    if (cuisine.includes("cafe") || cuisine.includes("coffee")) {
        return { image: "photo-1509042239860-f550ce710b93", icon: "☕" };
    }

    if (cuisine.includes("japanese") || cuisine.includes("sushi")) {
        return { image: "photo-1579871494447-9811cf80d66c", icon: "🍣" };
    }

    return {
        image: RESTAURANT_DEFAULTS[index % RESTAURANT_DEFAULTS.length],
        icon: "🍽️"
    };
}

/* ------------------------------
   RESTAURANT RATINGS
------------------------------ */

const RESTAURANT_RATINGS = {
    "biryani master": 4.8,
    "desi dera": 4.4,
    "burger lab": 4.9,
    "foodhub burgers": 4.3,
    "pizza palace": 4.6,
    "pasta corner": 4.7,
    "wrap house": 4.5
};

/* ------------------------------
   RESTAURANT DESCRIPTIONS
------------------------------ */

const RESTAURANT_DESCRIPTIONS = {
    "biryani master":
        "Aromatic, flavour-packed biryani made with fragrant basmati rice, rich spices and tender pieces of chicken.",

    "desi dera":
        "A taste of traditional Pakistani cooking, serving hearty desi favourites, freshly prepared with homestyle flavour.",

    "burger lab":
        "Big, bold burgers built with juicy patties, fresh toppings and signature sauces for a satisfying bite.",

    "foodhub burgers":
        "Your stop for classic burger comfort, from crispy chicken favourites to loaded burgers and golden sides.",

    "pizza palace":
        "Freshly baked pizzas topped with savoury sauces, melted cheese and generous combinations of your favourite toppings.",

    "pasta corner":
        "Comforting Italian-inspired pasta dishes tossed in rich sauces and paired with delicious herbs and toppings.",

    "wrap house":
        "Freshly rolled wraps packed with seasoned fillings, crisp vegetables and flavourful sauces for an easy, satisfying meal."
};

function getRestaurantDescription(restaurant) {
    const name = String(restaurant.name || "").trim().toLowerCase();

    return RESTAURANT_DESCRIPTIONS[name] ||
        restaurant.description ||
        "Freshly prepared favourites, made with care and served straight to your table.";
}

function getRestaurantRating(restaurant) {
    const name = String(restaurant.name || "").trim().toLowerCase();

    if (RESTAURANT_RATINGS[name] !== undefined) {
        return RESTAURANT_RATINGS[name].toFixed(1);
    }

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }

    return (4.0 + (hash % 11) / 10).toFixed(1);
}

/* ------------------------------
   FOOD IMAGES
------------------------------ */

function getFoodImage(food) {
    const text = `${food.name || ""} ${food.description || ""}`.toLowerCase();

    const images = [
        ["biryani", "photo-1563379091339-03246963d96c"],
        ["burger", "photo-1568901346375-23c9450c58cd"],
        ["pizza", "photo-1513104890138-7c749659a591"],
        ["sushi", "photo-1579871494447-9811cf80d66c"],
        ["pasta", "photo-1473093295043-cdd812d0e601"],
        ["cake", "photo-1578985545062-69928b1d9587"],
        ["dessert", "photo-1551024506-0bccd828d307"],
        ["coffee", "photo-1509042239860-f550ce710b93"],
        ["chicken", "photo-1604908176997-125f25cc6f3d"],
        ["fries", "photo-1573080496219-bb080dd4f877"],
        ["rice", "photo-1512058564366-18510be2db19"],
        ["wrap", "photo-1626700051175-6818013e1d4f"]
    ];

    for (const [keyword, image] of images) {
        if (text.includes(keyword)) {
            return imageURL(image);
        }
    }

    return imageURL("photo-1546069901-ba9599a7e63c");
}

function getRestaurantImage(restaurant, index = 0) {
    const design = getRestaurantDesign(restaurant, index);
    return design.image ? imageURL(design.image) : "";
}

/* ------------------------------
   GENERAL HELPERS
------------------------------ */

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
    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(API + endpoint, {
        ...options,
        headers
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.message ||
            `Request failed (${response.status})`
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

/* ------------------------------
   NAVIGATION
------------------------------ */

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (!section) return;

    section.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (sectionId === "restaurants") {
        loadRestaurants();
    }

    if (sectionId === "cart") {
        renderCart();
    }

    if (sectionId === "orders") {
        loadOrders();
    }

    if (sectionId === "checkout") {
        renderCheckout();
    }
}

function updateAccount() {
    document.getElementById("login-nav")
        .classList.toggle("hidden", !!token);

    document.getElementById("register-nav")
        .classList.toggle("hidden", !!token);

    document.getElementById("logout-nav")
        .classList.toggle("hidden", !token);

    document.getElementById("account-name").textContent =
        token ? (localStorage.getItem("foodhub_name") || "Account") : "";
}

function logout() {
    token = null;

    localStorage.removeItem("foodhub_token");
    localStorage.removeItem("foodhub_name");

    updateAccount();

    notify("Logged out successfully.");
    showSection("home");
}

/* ------------------------------
   RESTAURANTS
------------------------------ */

async function loadRestaurants(search = "") {
    try {
        const endpoint =
            `/restaurants/?active_only=true&limit=100` +
            (search ? `&search=${encodeURIComponent(search)}` : "");

        const response = await apiRequest(endpoint);

        const restaurants = Array.isArray(response)
            ? response
            : response.items || [];

        renderRestaurants(restaurants);

    } catch (error) {
        console.error("Restaurant loading error:", error);

        document.getElementById("restaurant-list").innerHTML = `
            <div class="empty-state">
                <h3>Unable to load restaurants</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;
    }
}

function renderRestaurants(restaurants) {
    const featured = restaurants.slice(0, 3);

    function createCard(restaurant, index) {
        const id = Number(restaurant.id);
        const name = escapeHTML(restaurant.name);

        const category = escapeHTML(
            restaurant.cuisine ||
            restaurant.category ||
            "Restaurant"
        );

        const description = escapeHTML(
            getRestaurantDescription(restaurant)
        );

        const design = getRestaurantDesign(restaurant, index);
        const image = getRestaurantImage(restaurant, index);
        const rating = getRestaurantRating(restaurant);

        return `
            <article class="restaurant-card">
                <div class="restaurant-image"
                     style="background-image:url('${image}')">

                    <div class="image-overlay"></div>

                    <span class="category-tag">
                        ${design.icon} ${category}
                    </span>

                    <span class="restaurant-image-name">
                        ${name}
                    </span>
                </div>

                <div class="restaurant-info">
                    <h3>${name}</h3>
                    <p>${description}</p>

                    <div class="restaurant-meta">
                        <span title="Restaurant rating">
                            ★ ${rating} Rating
                        </span>
                        <span>${category}</span>
                    </div>

                    <button class="card-action"
                        onclick="openRestaurant(${id})">
                        Explore Menu →
                    </button>
                </div>
            </article>
        `;
    }

    const restaurantList = document.getElementById("restaurant-list");
    const featuredList = document.getElementById("featured-restaurants");

    restaurantList.innerHTML = restaurants.length
        ? restaurants.map(createCard).join("")
        : `
            <div class="empty-state">
                <h3>No restaurants found</h3>
                <p>Try searching for something else.</p>
            </div>
        `;

    featuredList.innerHTML = featured.length
        ? featured.map(createCard).join("")
        : `
            <div class="empty-state">
                <h3>No featured restaurants available.</h3>
            </div>
        `;
}

/* ------------------------------
   RESTAURANT MENU
------------------------------ */

async function openRestaurant(restaurantId) {
    try {
        const response = await apiRequest(
            "/restaurants/?active_only=true&limit=100"
        );

        const restaurants = Array.isArray(response)
            ? response
            : response.items || [];

        currentRestaurant = restaurants.find(
            restaurant => Number(restaurant.id) === Number(restaurantId)
        );

        if (!currentRestaurant) {
            throw new Error("Restaurant not found.");
        }

        document.getElementById("menu-heading").innerHTML = `
            <span class="eyebrow">EXPLORE THE MENU</span>
            <h1>${escapeHTML(currentRestaurant.name)}</h1>
            <p>${escapeHTML(getRestaurantDescription(currentRestaurant))}</p>
        `;

        showSection("menu");

        const foodResponse = await apiRequest(
            `/restaurants/${restaurantId}/foods?available_only=true&limit=100`
        );

        const foods = Array.isArray(foodResponse)
            ? foodResponse
            : foodResponse.items || [];

        renderFoodItems(foods);

    } catch (error) {
        console.error(error);
        notify(error.message);
    }
}

/* ------------------------------
   FOOD ITEMS
------------------------------ */

function renderFoodItems(foods) {
    const container = document.getElementById("menu-items");

    if (!foods.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No food items available</h3>
                <p>Check back later.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = foods.map(food => {
        const image = getFoodImage(food);
        const name = escapeHTML(food.name);

        const description = escapeHTML(
            food.description || "Freshly prepared and delicious."
        );

        const price = Number(food.price);
        const foodId = Number(food.id);
        const restaurantId = Number(currentRestaurant.id);

        return `
            <article class="food-card">
                <div class="food-image"
                     style="background-image:url('${image}')">
                </div>

                <div class="food-info">
                    <h3>${name}</h3>
                    <p>${description}</p>

                    <div class="food-bottom">
                        <span class="food-price">
                            ${money(price)}
                        </span>

                        <button
                            class="add-button"
                            onclick="addToCartFromButton(this)"
                            data-food-id="${foodId}"
                            data-food-name="${name}"
                            data-food-price="${price}"
                            data-restaurant-id="${restaurantId}">
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

    if (
        !foodId ||
        !name ||
        !Number.isFinite(price) ||
        !restaurantId
    ) {
        console.error("Invalid food item data:", button.dataset);
        notify("Unable to add this item. Please refresh the menu.");
        return;
    }

    addToCart(foodId, name, price, restaurantId);
}

/* ------------------------------
   SHOPPING CART
------------------------------ */

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
    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    document.getElementById("cart-count").textContent = count;
}

function renderCart() {
    const container = document.getElementById("cart-items");
    const summary = document.getElementById("cart-summary");

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Your cart is empty.</h3>
                <p>Find something delicious to order.</p>

                <button class="btn btn-primary"
                    onclick="showSection('restaurants')">
                    Explore Restaurants
                </button>
            </div>
        `;

        summary.innerHTML = "";
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div>
                <strong>${escapeHTML(item.name)}</strong>
                <p>${money(item.price)} × ${item.quantity}</p>
            </div>

            <div>
                <strong>${money(item.price * item.quantity)}</strong>

                <button onclick="changeQuantity(${index}, -1)">−</button>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    summary.innerHTML = `
        <div class="cart-total">
            Total: ${money(total)}
        </div>

        <button class="btn btn-primary"
            onclick="showSection('checkout')">
            Proceed to Checkout →
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
    cart.splice(index, 1);

    updateCartCount();
    renderCart();
}

/* ------------------------------
   CHECKOUT
------------------------------ */

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

    document.getElementById("checkout-summary").innerHTML = `
        <div class="cart-total">
            Order total: ${money(total)}
        </div>

        <p>Payment method: Cash on Delivery</p>
    `;

    try {
        const profile = await apiRequest("/customers/me");
        const addressField = document.getElementById("checkout-address");

        if (profile.address && !addressField.value) {
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

    const address = document.getElementById("checkout-address").value.trim();

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

/* ------------------------------
   ORDER HISTORY
------------------------------ */

async function loadOrders() {
    const container = document.getElementById("order-list");

    if (!token) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Login to view your orders.</h3>

                <button class="btn btn-primary"
                    onclick="showSection('login')">
                    Login
                </button>
            </div>
        `;
        return;
    }

    try {
        const response = await apiRequest("/orders/customer/me");

        const orders = Array.isArray(response)
            ? response
            : response.items || [];

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
            <div class="order-card">
                <div>
                    <strong>Order #${Number(order.id)}</strong>

                    <p>
                        Status: ${escapeHTML(order.status || "Pending")}
                    </p>

                    <p>Total: ${money(order.total_amount)}</p>
                    <p>Payment: Cash on Delivery</p>
                </div>

                <button class="btn btn-outline"
                    onclick="downloadInvoice(${Number(order.id)})">
                    Download Invoice
                </button>
            </div>
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

/* ------------------------------
   INVOICE DOWNLOAD
------------------------------ */

async function downloadInvoice(orderId) {
    try {
        const schemaResponse = await fetch("/openapi.json");

        if (!schemaResponse.ok) {
            throw new Error("Could not inspect the invoice API.");
        }

        const schema = await schemaResponse.json();

        const paths = Object.entries(schema.paths || {});

        const candidates = paths.filter(([path, methods]) => {
            return path.toLowerCase().includes("invoice") && methods.get;
        });

        if (!candidates.length) {
            throw new Error("No invoice download endpoint was found.");
        }

        let selectedPath = candidates.find(([path]) =>
            path.includes("{order_id}") || path.includes("{id}")
        );

        if (!selectedPath) {
            selectedPath = candidates[0];
        }

        const endpoint = selectedPath[0]
            .replace("{order_id}", String(orderId))
            .replace("{id}", String(orderId));

        const response = await fetch(API + endpoint, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.detail || "Unable to download invoice."
            );
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

/* ------------------------------
   LOGIN
------------------------------ */

document.getElementById("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        // Backend expects JSON with email and password.
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        token = data.access_token;

        localStorage.setItem("foodhub_token", token);
        localStorage.setItem(
            "foodhub_name",
            data.customer_name || "Account"
        );

        updateAccount();

        notify("Welcome back!");
        showSection("home");

    } catch (error) {
        console.error("Login error:", error);
        notify(error.message || "Login failed. Please try again.");
    }
});

/* ------------------------------
   REGISTRATION
------------------------------ */

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

/* ------------------------------
   INITIALIZATION
------------------------------ */

updateAccount();
updateCartCount();
loadRestaurants();
