const API = "";
const TOKEN_KEY = "foodhub_token";

let token = localStorage.getItem(TOKEN_KEY);
let restaurants = [];
let orders = [];
let selectedRestaurantId = null;
let foods = [];

let restaurantSearch = "";
let restaurantStatusFilter = "all";

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginMessage = document.getElementById("login-message");


/* --------------------------------
   GENERAL HELPERS
-------------------------------- */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function money(value) {
    return "Rs. " + Number(value || 0).toLocaleString("en-PK", {
        maximumFractionDigits: 2
    });
}

function notify(message, type = "success") {
    let notification = document.getElementById("admin-notification");

    if (!notification) {
        notification = document.createElement("p");
        notification.id = "admin-notification";
        dashboardSection.prepend(notification);
    }

    notification.textContent = message;
    notification.className = `admin-notification ${type}`;

    window.clearTimeout(notification.hideTimer);

    notification.hideTimer = window.setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
}

function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);

    token = null;
    selectedRestaurantId = null;
    restaurants = [];
    orders = [];
    foods = [];

    document.getElementById("food-list").innerHTML = "";

    showLogin();
}


/* --------------------------------
   API REQUEST HANDLER
-------------------------------- */

async function apiRequest(path, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API}${path}`, {
        ...options,
        headers
    });

    let data = null;

    if (response.status !== 204) {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }
    }

    if (response.status === 401) {
        logout();
        throw new Error("Your session has expired. Please sign in again.");
    }

    if (!response.ok) {
        const detail = data?.detail || data || "Request failed";

        throw new Error(
            typeof detail === "string"
                ? detail
                : JSON.stringify(detail)
        );
    }

    return data;
}


/* --------------------------------
   LOGIN
-------------------------------- */

document.getElementById("login-form").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        loginMessage.textContent = "Signing in...";

        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed.");
            }

            token = data.access_token;

            if (!token) {
                throw new Error("Login response did not contain an access token.");
            }

            await apiRequest("/orders/admin/all?limit=1");

            localStorage.setItem(TOKEN_KEY, token);

            document.getElementById("password").value = "";

            showDashboard();

            await loadDashboard();
            await loadRestaurantOptions();

            loginMessage.textContent = "";

        } catch (error) {
            token = null;
            localStorage.removeItem(TOKEN_KEY);

            loginMessage.textContent = error.message;
        }
    }
);

document.getElementById("logout-button").addEventListener(
    "click",
    logout
);


/* --------------------------------
   DASHBOARD
-------------------------------- */

async function loadDashboard() {
    try {
        const [restaurantData, orderData] = await Promise.all([
            apiRequest("/restaurants/?active_only=false&limit=100"),
            apiRequest("/orders/admin/all?limit=100")
        ]);

        restaurants = restaurantData;
        orders = orderData;

        const foodCounts = await Promise.all(
            restaurants.map(async restaurant => {
                const restaurantFoods = await apiRequest(
                    `/restaurants/${restaurant.id}/foods?available_only=false&limit=100`
                );

                return Array.isArray(restaurantFoods)
                    ? restaurantFoods.length
                    : 0;
            })
        );

        const totalFoods = foodCounts.reduce(
            (total, count) => total + count,
            0
        );

        document.getElementById("total-restaurants").textContent =
            restaurants.length;

        document.getElementById("total-foods").textContent =
            totalFoods;

        document.getElementById("total-orders").textContent =
            orders.length;

        document.getElementById("pending-orders").textContent =
            orders.filter(order => order.status === "pending").length;

        renderRestaurants();
        renderOrders();

    } catch (error) {
        notify(error.message, "error");
        throw error;
    }
}


/* --------------------------------
   RESTAURANT SEARCH AND FILTERS
-------------------------------- */

function setupRestaurantFilters() {
    const list = document.getElementById("restaurant-list");

    if (document.getElementById("restaurant-search")) {
        return;
    }

    const toolbar = document.createElement("div");

    toolbar.className = "restaurant-toolbar";

    toolbar.innerHTML = `
        <div class="restaurant-search-wrapper">
            <input
                type="search"
                id="restaurant-search"
                placeholder="Search restaurants by name..."
                aria-label="Search restaurants"
            >
        </div>

        <select id="restaurant-status-filter">
            <option value="all">All restaurants</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
        </select>
    `;

    list.parentNode.insertBefore(toolbar, list);

    document.getElementById("restaurant-search").addEventListener(
        "input",
        event => {
            restaurantSearch = event.target.value.trim().toLowerCase();
            renderRestaurants();
        }
    );

    document.getElementById("restaurant-status-filter").addEventListener(
        "change",
        event => {
            restaurantStatusFilter = event.target.value;
            renderRestaurants();
        }
    );
}


/* --------------------------------
   RESTAURANT MANAGEMENT
-------------------------------- */

document.getElementById("add-restaurant-button").addEventListener(
    "click",
    () => {
        const form = document.getElementById("restaurant-form");

        form.reset();

        document.getElementById("restaurant-id").value = "";

        document.getElementById("restaurant-form-title").textContent =
            "Add Restaurant";

        form.hidden = false;

        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
);

document.getElementById("cancel-restaurant").addEventListener(
    "click",
    () => {
        const form = document.getElementById("restaurant-form");

        form.hidden = true;
        form.reset();
    }
);


// Add or edit restaurant.
document.getElementById("restaurant-form").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const id = document.getElementById("restaurant-id").value;

        const restaurant = {
            name: document.getElementById("restaurant-name").value.trim(),
            category: document.getElementById("restaurant-category").value.trim(),
            address: document.getElementById("restaurant-address").value.trim()
        };

        try {
            await apiRequest(
                id ? `/restaurants/${id}` : "/restaurants/",
                {
                    method: id ? "PATCH" : "POST",
                    body: JSON.stringify(restaurant)
                }
            );

            event.target.reset();
            event.target.hidden = true;

            await loadDashboard();
            await loadRestaurantOptions();

            notify(
                id
                    ? "Restaurant updated successfully."
                    : "Restaurant added successfully."
            );

        } catch (error) {
            notify(error.message, "error");
        }
    }
);


// Display restaurant cards.
function renderRestaurants() {
    const container = document.getElementById("restaurant-list");

    setupRestaurantFilters();

    let filteredRestaurants = [...restaurants];

    if (restaurantSearch) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(restaurantSearch)
        );
    }

    if (restaurantStatusFilter === "active") {
        filteredRestaurants = filteredRestaurants.filter(
            restaurant => restaurant.is_active
        );
    }

    if (restaurantStatusFilter === "inactive") {
        filteredRestaurants = filteredRestaurants.filter(
            restaurant => !restaurant.is_active
        );
    }

    if (!filteredRestaurants.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No restaurants found</h3>
                <p>Try changing your search or filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredRestaurants.map(restaurant => `
        <article class="restaurant-card">
            <div class="restaurant-card-header">
                <div class="restaurant-card-info">
                    <h3>${escapeHTML(restaurant.name)}</h3>
                    <p class="restaurant-category">
                        ${escapeHTML(restaurant.category)}
                    </p>
                </div>

                <span class="restaurant-status ${
                    restaurant.is_active ? "active" : "inactive"
                }">
                    ${restaurant.is_active ? "Active" : "Inactive"}
                </span>
            </div>

            <p class="restaurant-address">
                ${escapeHTML(restaurant.address)}
            </p>

            <div class="card-actions">
                <button
                    class="small-btn edit-btn"
                    data-action="edit-restaurant"
                    data-id="${restaurant.id}">
                    Edit
                </button>

                <button
                    class="small-btn ${
                        restaurant.is_active ? "orange" : "green"
                    }"
                    data-action="toggle-restaurant"
                    data-id="${restaurant.id}">
                    ${restaurant.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                    class="small-btn red"
                    data-action="delete-restaurant"
                    data-id="${restaurant.id}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}


// Restaurant card actions.
document.getElementById("restaurant-list").addEventListener(
    "click",
    async event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = Number(button.dataset.id);

        const restaurant = restaurants.find(item => item.id === id);

        if (!restaurant) return;

        try {
            // EDIT RESTAURANT
            if (button.dataset.action === "edit-restaurant") {
                document.getElementById("restaurant-id").value = id;
                document.getElementById("restaurant-name").value = restaurant.name;
                document.getElementById("restaurant-category").value = restaurant.category;
                document.getElementById("restaurant-address").value = restaurant.address;

                document.getElementById("restaurant-form-title").textContent =
                    "Edit Restaurant";

                const form = document.getElementById("restaurant-form");

                form.hidden = false;

                form.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;
            }

            // ACTIVATE / DEACTIVATE
            if (button.dataset.action === "toggle-restaurant") {
                const newStatus = !restaurant.is_active;

                await apiRequest(`/restaurants/${id}/availability`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        is_active: newStatus
                    })
                });

                await loadDashboard();
                await loadRestaurantOptions();

                notify(
                    newStatus
                        ? "Restaurant activated successfully."
                        : "Restaurant deactivated successfully."
                );

                return;
            }

            // DELETE / ARCHIVE RESTAURANT
            if (button.dataset.action === "delete-restaurant") {
                const confirmed = confirm(
                    `Are you sure you want to delete "${restaurant.name}"?\n\n` +
                    "WARNING: If this restaurant has existing orders, " +
                    "it will be archived instead of permanently deleted.\n\n" +
                    "Its historical orders and invoices will be preserved.\n\n" +
                    "If it has no order history, it and its food items will be permanently deleted."
                );

                if (!confirmed) return;

                button.disabled = true;
                button.textContent = "Processing...";

                try {
                    const result = await apiRequest(`/restaurants/${id}`, {
                        method: "DELETE"
                    });

                    if (selectedRestaurantId === id) {
                        selectedRestaurantId = null;
                        foods = [];

                        document.getElementById("food-list").innerHTML = "";
                        document.getElementById("food-form").hidden = true;
                    }

                    await loadDashboard();
                    await loadRestaurantOptions();

                    if (result.action === "archived") {
                        notify(result.message, "success");
                    } else {
                        notify(result.message || "Restaurant deleted successfully.");
                    }

                } catch (error) {
                    button.disabled = false;
                    button.textContent = "Delete";
                    throw error;
                }

                return;
            }

        } catch (error) {
            notify(error.message, "error");
        }
    }
);


/* --------------------------------
   FOOD MANAGEMENT
-------------------------------- */

// Restaurant selection.
document.getElementById("food-restaurant-select").addEventListener(
    "change",
    async event => {
        selectedRestaurantId = Number(event.target.value) || null;

        if (selectedRestaurantId) {
            await loadFoods();
        } else {
            foods = [];
            document.getElementById("food-list").innerHTML = "";
        }
    }
);


// Add food button.
document.getElementById("add-food-button").addEventListener(
    "click",
    () => {
        if (!selectedRestaurantId) {
            notify("Select a restaurant first.", "error");
            return;
        }

        const form = document.getElementById("food-form");

        form.reset();

        document.getElementById("food-id").value = "";

        document.getElementById("food-form-title").textContent =
            "Add Food Item";

        form.hidden = false;

        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
);


// Cancel food form.
document.getElementById("cancel-food").addEventListener(
    "click",
    () => {
        const form = document.getElementById("food-form");

        form.hidden = true;
        form.reset();
    }
);


// Load restaurant dropdown.
async function loadRestaurantOptions() {
    try {
        restaurants = await apiRequest(
            "/restaurants/?active_only=false&limit=100"
        );

        const select = document.getElementById("food-restaurant-select");

        select.innerHTML = `
            <option value="">Choose a restaurant</option>

            ${restaurants.map(restaurant => `
                <option value="${restaurant.id}">
                    ${escapeHTML(restaurant.name)}
                    ${restaurant.is_active ? "" : "(Inactive)"}
                </option>
            `).join("")}
        `;

        if (
            selectedRestaurantId &&
            restaurants.some(item => item.id === selectedRestaurantId)
        ) {
            select.value = String(selectedRestaurantId);
            await loadFoods();
        } else {
            selectedRestaurantId = null;
            foods = [];

            document.getElementById("food-list").innerHTML = "";
        }

    } catch (error) {
        notify("Could not load restaurants: " + error.message, "error");
        throw error;
    }
}


// Load food items.
async function loadFoods() {
    if (!selectedRestaurantId) return;

    const container = document.getElementById("food-list");

    container.innerHTML = `
        <div class="loading-state">Loading food items...</div>
    `;

    try {
        foods = await apiRequest(
            `/restaurants/${selectedRestaurantId}/foods?available_only=false&limit=100`
        );

        if (!Array.isArray(foods)) {
            throw new Error("Food API did not return a list.");
        }

        renderFoods();

    } catch (error) {
        foods = [];

        container.innerHTML = `
            <p class="error">${escapeHTML(error.message)}</p>
        `;

        notify("Could not load food items: " + error.message, "error");
    }
}


// Display food items.
function renderFoods() {
    const container = document.getElementById("food-list");

    if (!foods.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No food items yet</h3>
                <p>Add food items to this restaurant using the button above.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = foods.map(food => `
        <article class="food-row">
            <div class="food-row-info">
                <h4>${escapeHTML(food.name)}</h4>
                <p>${escapeHTML(food.description || "No description provided.")}</p>
                <strong>${money(food.price)}</strong>
            </div>

            <span class="food-status ${
                food.is_available ? "available" : "unavailable"
            }">
                ${food.is_available ? "Available" : "Unavailable"}
            </span>

            <div class="food-actions">
                <button
                    class="small-btn edit-btn"
                    data-action="edit-food"
                    data-id="${food.id}">
                    Edit
                </button>

                <button
                    class="small-btn ${
                        food.is_available ? "orange" : "green"
                    }"
                    data-action="toggle-food"
                    data-id="${food.id}">
                    ${food.is_available ? "Disable" : "Enable"}
                </button>

                <button
                    class="small-btn red"
                    data-action="delete-food"
                    data-id="${food.id}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}


// Add or edit food item.
document.getElementById("food-form").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        if (!selectedRestaurantId) {
            notify("Select a restaurant first.", "error");
            return;
        }

        const id = document.getElementById("food-id").value;

        const food = {
            name: document.getElementById("food-name").value.trim(),
            description:
                document.getElementById("food-description").value.trim() || null,
            price: Number(document.getElementById("food-price").value)
        };

        if (!food.name || food.name.length < 2) {
            notify("Food name must contain at least 2 characters.", "error");
            return;
        }

        if (!Number.isFinite(food.price) || food.price <= 0) {
            notify("Enter a valid food price greater than zero.", "error");
            return;
        }

        try {
            await apiRequest(
                id
                    ? `/foods/${id}`
                    : `/restaurants/${selectedRestaurantId}/foods`,
                {
                    method: id ? "PATCH" : "POST",
                    body: JSON.stringify(food)
                }
            );

            event.target.reset();
            event.target.hidden = true;

            await loadFoods();
            await loadDashboard();

            notify(
                id
                    ? "Food item updated successfully."
                    : "Food item added successfully."
            );

        } catch (error) {
            notify(error.message, "error");
        }
    }
);


// Food card actions.
document.getElementById("food-list").addEventListener(
    "click",
    async event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = Number(button.dataset.id);
        const food = foods.find(item => item.id === id);

        if (!food) return;

        try {
            // EDIT FOOD
            if (button.dataset.action === "edit-food") {
                document.getElementById("food-id").value = id;
                document.getElementById("food-name").value = food.name;
                document.getElementById("food-description").value =
                    food.description || "";
                document.getElementById("food-price").value = food.price;

                document.getElementById("food-form-title").textContent =
                    "Edit Food Item";

                const form = document.getElementById("food-form");

                form.hidden = false;

                form.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;
            }

            // ENABLE / DISABLE FOOD
            if (button.dataset.action === "toggle-food") {
                await apiRequest(`/foods/${id}/availability`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        is_available: !food.is_available
                    })
                });

                await loadFoods();

                notify("Food availability updated successfully.");

                return;
            }

            // DELETE FOOD
            if (button.dataset.action === "delete-food") {
                const confirmed = confirm(
                    `Delete "${food.name}"?\n\n` +
                    "Food items belonging to existing orders cannot be deleted."
                );

                if (!confirmed) return;

                await apiRequest(`/foods/${id}`, {
                    method: "DELETE"
                });

                await loadFoods();
                await loadDashboard();

                notify("Food item deleted successfully.");

                return;
            }

        } catch (error) {
            notify(error.message, "error");
        }
    }
);


/* --------------------------------
   ORDER MANAGEMENT
-------------------------------- */

function allowedStatuses(status) {
    const transitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["preparing", "cancelled"],
        preparing: ["out_for_delivery"],
        out_for_delivery: ["delivered"],
        delivered: [],
        cancelled: []
    };

    return transitions[status] || [];
}


// Look up restaurant name using the restaurant ID.
function getRestaurantName(restaurantId) {
    const restaurant = restaurants.find(
        item => Number(item.id) === Number(restaurantId)
    );

    return restaurant
        ? restaurant.name
        : `Restaurant #${restaurantId}`;
}


async function loadOrders() {
    orders = await apiRequest("/orders/admin/all?limit=100");

    renderOrders();

    document.getElementById("total-orders").textContent = orders.length;

    document.getElementById("pending-orders").textContent =
        orders.filter(order => order.status === "pending").length;
}


function renderOrders() {
    const container = document.getElementById("order-list");

    if (!orders.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No orders yet</h3>
                <p>Customer orders will appear here.</p>
            </div>
        `;
        return;
    }

    const sorted = [...orders].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Restaurant</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Update</th>
                    </tr>
                </thead>

                <tbody>
                    ${sorted.map(order => {
                        const options = allowedStatuses(order.status);

                        return `
                            <tr>
                                <td>#${order.id}</td>

                                <td>${escapeHTML(order.customer_id)}</td>

                                <td>
                                    <strong>
                                        ${escapeHTML(
                                            getRestaurantName(order.restaurant_id)
                                        )}
                                    </strong>
                                </td>

                                <td>${money(order.total_amount)}</td>

                                <td>${escapeHTML(order.payment_method)}</td>

                                <td>
                                    <span class="order-status ${escapeHTML(order.status)}">
                                        ${escapeHTML(
                                            order.status.replaceAll("_", " ")
                                        )}
                                    </span>
                                </td>

                                <td>
                                    ${options.length ? `
                                        <div class="order-update-controls">
                                            <select id="status-${order.id}">
                                                <option value="">Choose status</option>

                                                ${options.map(status => `
                                                    <option value="${status}">
                                                        ${status.replaceAll("_", " ")}
                                                    </option>
                                                `).join("")}
                                            </select>

                                            <button
                                                class="small-btn edit-btn"
                                                data-order-id="${order.id}">
                                                Update
                                            </button>
                                        </div>
                                    ` : "Complete"}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}


// Update order status.
document.getElementById("order-list").addEventListener(
    "click",
    async event => {
        const button = event.target.closest("button[data-order-id]");

        if (!button) return;

        const id = Number(button.dataset.orderId);
        const select = document.getElementById(`status-${id}`);
        const status = select?.value;

        if (!status) {
            notify("Choose a status first.", "error");
            return;
        }

        try {
            await apiRequest(`/orders/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });

            await loadOrders();

            notify(`Order #${id} updated successfully.`);

        } catch (error) {
            notify(error.message, "error");
        }
    }
);


// Refresh orders.
document.getElementById("refresh-orders").addEventListener(
    "click",
    async () => {
        try {
            await loadOrders();
            notify("Orders refreshed successfully.");
        } catch (error) {
            notify(error.message, "error");
        }
    }
);


/* --------------------------------
   INITIALIZATION
-------------------------------- */

async function initialize() {
    showLogin();

    if (!token) return;

    try {
        await apiRequest("/orders/admin/all?limit=1");

        showDashboard();

        await loadDashboard();
        await loadRestaurantOptions();

    } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        token = null;

        showLogin();
    }
}

initialize();