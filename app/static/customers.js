const token = localStorage.getItem("foodhub_token");

/* ------------------------------
   HELPERS
------------------------------ */

const money = value =>
    "Rs. " + Number(value || 0).toLocaleString("en-PK", {
        maximumFractionDigits: 2
    });

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString();
}

function getElement(id) {
    return document.getElementById(id);
}

/* ------------------------------
   API REQUEST
------------------------------ */

async function apiRequest(url) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Admin access denied. Please log in again.");
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Something went wrong.");
    }

    return response.json();
}

/* ------------------------------
   LOAD CUSTOMERS
------------------------------ */

async function loadCustomers() {
    const message = getElement("message");
    const search = getElement("customer-search").value.trim();
    const table = getElement("customer-list");

    if (!token) {
        message.textContent =
            "Please log in through the admin dashboard first.";

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Admin login required.
                </td>
            </tr>
        `;

        return;
    }

    message.textContent = "Loading customers...";

    try {
        const url =
            `/admin/customers/?limit=200&offset=0&search=${encodeURIComponent(search)}`;

        const data = await apiRequest(url);

        const customers = data.customers || [];

        getElement("customer-count").textContent =
            Number(data.total || 0).toLocaleString();

        getElement("results-count").textContent =
            `${customers.length} result${customers.length === 1 ? "" : "s"}`;

        renderCustomers(customers);

        message.textContent = "";

    } catch (error) {
        message.textContent = error.message;

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Unable to load customers.
                </td>
            </tr>
        `;
    }
}

/* ------------------------------
   RENDER CUSTOMER TABLE
------------------------------ */

function renderCustomers(customers) {
    const table = getElement("customer-list");

    if (!customers.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = customers.map(customer => `
        <tr>
            <td class="customer-name">
                ${escapeHTML(customer.name)}
            </td>

            <td>
                ${escapeHTML(customer.email)}
            </td>

            <td>
                ${escapeHTML(customer.phone || "Not provided")}
            </td>

            <td>
                ${Number(customer.order_count || 0)}
            </td>

            <td>
                ${money(customer.total_spent)}
            </td>

            <td>
                <button
                    type="button"
                    class="view-button"
                    data-customer-id="${Number(customer.id)}"
                >
                    View
                </button>
            </td>
        </tr>
    `).join("");
}

/* ------------------------------
   VIEW CUSTOMER DETAILS
------------------------------ */

async function viewCustomer(customerId) {
    const panel = getElement("customer-details");
    const profile = getElement("customer-profile");
    const history = getElement("customer-orders");

    panel.hidden = false;

    profile.innerHTML = `
        <p>Loading customer details...</p>
    `;

    history.innerHTML = `
        <p>Loading order history...</p>
    `;

    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const data = await apiRequest(
            `/admin/customers/${encodeURIComponent(customerId)}/orders`
        );

        const customer = data.customer;

        if (!customer) {
            throw new Error("Customer details could not be loaded.");
        }

        renderCustomerProfile(customer, data.total_orders);

        renderOrderHistory(data.orders || []);

    } catch (error) {
        profile.innerHTML = `
            <p class="empty">
                ${escapeHTML(error.message)}
            </p>
        `;

        history.innerHTML = "";
    }
}

/* ------------------------------
   CUSTOMER PROFILE
------------------------------ */

function renderCustomerProfile(customer, totalOrders) {
    const profile = getElement("customer-profile");

    profile.innerHTML = `
        <div class="profile-details">

            <div>
                <strong>Name</strong>
                <p>${escapeHTML(customer.name)}</p>
            </div>

            <div>
                <strong>Email</strong>
                <p>${escapeHTML(customer.email)}</p>
            </div>

            <div>
                <strong>Phone</strong>
                <p>${escapeHTML(customer.phone || "Not provided")}</p>
            </div>

            <div>
                <strong>Address</strong>
                <p>${escapeHTML(customer.address || "Not provided")}</p>
            </div>

            <div>
                <strong>Total Orders</strong>
                <p>${Number(totalOrders || 0)}</p>
            </div>

            <div>
                <strong>Customer ID</strong>
                <p>#${Number(customer.id)}</p>
            </div>

        </div>
    `;
}

/* ------------------------------
   ORDER HISTORY
------------------------------ */

function renderOrderHistory(orders) {
    const history = getElement("customer-orders");

    if (!orders.length) {
        history.innerHTML = `
            <p class="empty">
                This customer has not placed any orders yet.
            </p>
        `;

        return;
    }

    history.innerHTML = orders.map(order => {
        const items = (order.items || []).map(item => `
            <div class="order-item">
                <span>
                    ${escapeHTML(item.name)}
                    × ${Number(item.quantity || 0)}
                </span>

                <strong>
                    ${money(item.subtotal)}
                </strong>
            </div>
        `).join("");

        const status = String(order.status || "unknown")
            .replaceAll("_", " ")
            .toUpperCase();

        return `
            <article class="order-card">

                <div class="order-top">

                    <div>
                        <h3>Order #${Number(order.id)}</h3>

                        <p class="order-meta">
                            ${escapeHTML(order.restaurant)}
                            ·
                            ${escapeHTML(formatDate(order.created_at))}
                        </p>
                    </div>

                    <span class="status">
                        ${escapeHTML(status)}
                    </span>

                </div>

                <div class="order-items">
                    ${
                        items ||
                        '<p class="empty">No item details available.</p>'
                    }
                </div>

                <div class="order-bottom">

                    <span>
                        Payment:
                        ${escapeHTML(order.payment_method || "Not specified")}
                    </span>

                    <strong>
                        ${money(order.total_amount)}
                    </strong>

                </div>

                <p class="order-meta" style="margin-top:12px">
                    Delivery address:
                    ${escapeHTML(order.delivery_address || "Not provided")}
                </p>

            </article>
        `;
    }).join("");
}

/* ------------------------------
   SEARCH AND RESET
------------------------------ */

getElement("customer-search").addEventListener(
    "input",
    loadCustomers
);

getElement("search-button").addEventListener(
    "click",
    loadCustomers
);

getElement("reset-button").addEventListener(
    "click",
    () => {
        getElement("customer-search").value = "";
        loadCustomers();
    }
);

/* ------------------------------
   CUSTOMER TABLE BUTTONS
------------------------------ */

getElement("customer-list").addEventListener(
    "click",
    event => {
        const button = event.target.closest("[data-customer-id]");

        if (button) {
            viewCustomer(button.dataset.customerId);
        }
    }
);

/* ------------------------------
   CLOSE CUSTOMER DETAILS
------------------------------ */

getElement("close-details").addEventListener(
    "click",
    () => {
        getElement("customer-details").hidden = true;
    }
);

/* ------------------------------
   INITIAL LOAD
------------------------------ */

loadCustomers();