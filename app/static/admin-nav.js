(() => {
    const currentPage = window.location.pathname;

    const links = [
        {
            name: "Dashboard",
            url: "/admin.html"
        },
        {
            name: "Customers",
            url: "/customers.html"
        },
        {
            name: "Sales Reports",
            url: "/reports.html"
        },
        {
            name: "Customer Website",
            url: "/"
        }
    ];

    const navigation = document.createElement("nav");

    navigation.className = "admin-navigation";

    navigation.innerHTML = `
        <div class="admin-nav-brand">
            Food<span>Hub</span>
            <small>ADMIN</small>
        </div>

        <div class="admin-nav-links">
            ${links.map(link => `
                <a
                    href="${link.url}"
                    class="${currentPage === link.url ? "active" : ""}"
                >
                    ${link.name}
                </a>
            `).join("")}
        </div>
    `;

    const style = document.createElement("style");

    style.textContent = `
        .admin-navigation {
            background: #171717;
            color: white;
            padding: 15px 5%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            font-family: Arial, sans-serif;
        }

        .admin-nav-brand {
            font-size: 23px;
            font-weight: 800;
        }

        .admin-nav-brand span {
            color: #ff7b36;
        }

        .admin-nav-brand small {
            font-size: 10px;
            color: #aaa;
            margin-left: 8px;
            letter-spacing: 2px;
        }

        .admin-nav-links {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .admin-nav-links a {
            color: #ddd;
            text-decoration: none;
            padding: 10px 13px;
            border-radius: 7px;
            font-size: 13px;
            transition: 0.2s;
        }

        .admin-nav-links a:hover,
        .admin-nav-links a.active {
            background: #ff7b36;
            color: white;
        }

        @media(max-width: 600px) {
            .admin-navigation {
                align-items: flex-start;
                flex-direction: column;
            }

            .admin-nav-links {
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.prepend(navigation);
})();