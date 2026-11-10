const token = localStorage.getItem("foodhub_token");

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
        "'": "&#39;"
    })[char]);
}

async function loadReports() {
    const message = document.getElementById("message");
    const days = document.getElementById("period").value;

    if (!token) {
        message.textContent =
            "Please log in through the admin dashboard first.";
        return;
    }

    message.textContent = "Loading reports...";

    try {
        const response = await fetch(
            `/admin/reports/summary?days=${days}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to load reports.");
        }

        document.getElementById("revenue").textContent =
            money(data.total_revenue);

        document.getElementById("orders").textContent =
            data.total_orders;

        document.getElementById("customers").textContent =
            data.total_customers;

        document.getElementById("average").textContent =
            money(data.average_order_value);

        renderDaily(data.daily);
        renderStatuses(data.statuses);
        renderRestaurants(data.top_restaurants);
        renderFoods(data.top_foods);

        message.textContent = "";

    } catch (error) {
        message.textContent = error.message;
    }
}

function renderDaily(data) {
    const container = document.getElementById("daily-chart");

    if (!data.length) {
        container.innerHTML =
            '<p class="empty">No sales recorded during this period.</p>';
        return;
    }

    const maximum = Math.max(
        ...data.map(item => Number(item.revenue)),
        1
    );

    container.innerHTML = data.map(item => {
        const height = Math.max(
            3,
            (Number(item.revenue) / maximum) * 155
        );

        const date = new Date(item.date + "T00:00:00");

        return `
            <div class="chart-column">
                <span class="amount">${Math.round(item.revenue)}</span>
                <div class="bar" style="height:${height}px"></div>
                <small>${date.getDate()}/${date.getMonth() + 1}</small>
            </div>
        `;
    }).join("");
}

function renderStatuses(statuses) {
    const container = document.getElementById("statuses");
    const entries = Object.entries(statuses);

    if (!entries.length) {
        container.innerHTML =
            '<p class="empty">No orders recorded.</p>';
        return;
    }

    container.innerHTML = entries.map(([status, count]) => `
        <div class="report-row">
            <span>${escapeHTML(status.replaceAll("_", " ").toUpperCase())}</span>
            <span>${count}</span>
        </div>
    `).join("");
}

function renderRestaurants(restaurants) {
    const container = document.getElementById("restaurants");

    if (!restaurants.length) {
        container.innerHTML =
            '<p class="empty">No restaurant sales recorded.</p>';
        return;
    }

    container.innerHTML = restaurants.map(item => `
        <div class="report-row">
            <span>${escapeHTML(item.name)} (${item.orders} orders)</span>
            <span>${money(item.revenue)}</span>
        </div>
    `).join("");
}

function renderFoods(foods) {
    const container = document.getElementById("foods");

    if (!foods.length) {
        container.innerHTML = `
            <tr>
                <td colspan="3" class="empty">No food sales recorded.</td>
            </tr>
        `;
        return;
    }

    container.innerHTML = foods.map(item => `
        <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${item.quantity}</td>
            <td>${money(item.revenue)}</td>
        </tr>
    `).join("");
}

document.getElementById("period").addEventListener(
    "change",
    loadReports
);

loadReports();