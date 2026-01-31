// Constants
const ADMIN_EMAIL = "000000";
const ADMIN_PASS = "000000";
const STORAGE_KEY = "prathana_orders";
const NEXT_ID_KEY = "prathana_next_order_id";
const HIDDEN_ORDERS_KEY = "prathana_hidden_orders";
let currentUser = null;
let orderSearchQuery = "";

// Helper to get orders
function getOrders() {
    const orders = localStorage.getItem(STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Helper to save orders
function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order); // Add new order to the top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function getNextOrderId() {
    const next = parseInt(localStorage.getItem(NEXT_ID_KEY) || "1", 10);
    localStorage.setItem(NEXT_ID_KEY, String(next + 1));
    return next;
}

function getHiddenOrders() {
    const ids = localStorage.getItem(HIDDEN_ORDERS_KEY);
    return ids ? JSON.parse(ids) : [];
}

function hideOrderId(id) {
    const list = getHiddenOrders();
    if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(HIDDEN_ORDERS_KEY, JSON.stringify(list));
    }
}

// Helper to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// Product Data for Modal
const productsData = [
    {
        title: "Premium Hardwood Chips",
        desc: "Our premium hardwood chips are derived from high-quality oak and maple. They are perfect for industrial biomass boilers, providing high heat output and low ash content. Also excellent for playground surfacing.",
        features: ["Low Moisture Content (<20%)", "High Calorific Value", "Uniform Size (G30/G50)", "Sustainably Sourced"],
        price: 4500,
        img: "https://images.unsplash.com/photo-1542601906990-b4d3fb77c35e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        title: "Sustainable Biomass Fuel",
        desc: "A cost-effective renewable energy solution. These mixed wood chips are processed to meet standard specifications for automatic feed boilers. Ideal for large-scale heating systems.",
        features: ["Renewable Energy Source", "Carbon Neutral", "Consistent Quality", "Bulk Delivery Available"],
        price: 3200,
        img: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        title: "Landscape Mulch",
        desc: "Beautify your garden while retaining soil moisture and suppressing weeds. Our landscape mulch breaks down slowly, enriching the soil with organic matter over time.",
        features: ["Weed Suppression", "Moisture Retention", "Natural Aesthetic", "Soil Enrichment"],
        price: 1800,
        img: "https://images.unsplash.com/photo-1616782046808-8124b6e82846?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Fine Sawdust",
        desc: "Clean, dry, and absorbent sawdust suitable for animal bedding (horses, poultry) or for cleaning up spills. Free from chemical treatments.",
        features: ["High Absorbency", "Dust Extracted", "Soft Texture", "Chemical Free"],
        price: 1200,
        img: "https://images.unsplash.com/photo-1595856417769-e763131e5057?q=80&w=2070&auto=format&fit=crop"
    }
];

// Carousel Logic
let slideIndex = 0;
let slideTimer;

// Check if carousel exists before running logic
if (document.getElementsByClassName("carousel-slide").length > 0) {
    showSlides();
}

// Render Products Grid
const productsGrid = document.getElementById('productsGrid');
if (productsGrid) {
    renderProducts();
}

function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    
    productsData.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-image-container">
                <img src="${product.img}" onerror="this.src='https://placehold.co/800x600/2e7d32/FFF?text=${encodeURIComponent(product.title)}'" alt="${product.title}">
            </div>
            <div class="card-content">
                <h3>${product.title}</h3>
                <p>${product.desc.substring(0, 100)}...</p>
                <span class="card-price">${formatCurrency(product.price)} / Ton</span>
                <button class="btn-card" onclick="openProductModal(${index})">View Details & Order</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("carousel-slide");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
        slides[i].classList.remove("active");
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    slides[slideIndex-1].style.display = "block";  
    
    // Add active class after a small delay to trigger CSS transition
    setTimeout(() => {
        slides[slideIndex-1].classList.add("active");
    }, 50);

    slideTimer = setTimeout(showSlides, 5000); // Change image every 5 seconds
}

// Next/previous controls
function plusSlides(n, event) {
    if(event) event.stopPropagation(); // Prevent modal opening when clicking arrows
    clearTimeout(slideTimer); // Stop auto-rotation temporarily
    
    let slides = document.getElementsByClassName("carousel-slide");
    
    // Remove active class from current slide immediately
    if(slideIndex > 0 && slideIndex <= slides.length) {
        slides[slideIndex-1].classList.remove("active");
    }

    slideIndex += n;
    if (slideIndex > slides.length) {slideIndex = 1}
    if (slideIndex < 1) {slideIndex = slides.length}
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
        slides[i].classList.remove("active");
    }
    slides[slideIndex-1].style.display = "block";
    
    // Add active class
    setTimeout(() => {
        slides[slideIndex-1].classList.add("active");
    }, 50);
    
    // Restart auto-rotation
    slideTimer = setTimeout(showSlides, 5000);
}

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Modal Logic
function openProductModal(index) {
    const product = productsData[index];
    const modal = document.getElementById("productModal");
    
    const modalImg = document.getElementById("modalImg");
    modalImg.src = product.img;
    // Fallback for modal image
    modalImg.onerror = function() {
        this.src = `https://placehold.co/800x400/2e7d32/FFF?text=${encodeURIComponent(product.title)}`;
    };

    document.getElementById("modalTitle").innerText = product.title;
    document.getElementById("modalDesc").innerText = product.desc;
    document.getElementById("modalPrice").innerText = formatCurrency(product.price) + " / Ton";
    
    const featuresList = document.getElementById("modalFeatures");
    featuresList.innerHTML = "";
    product.features.forEach(feature => {
        const li = document.createElement("li");
        li.innerText = feature;
        featuresList.appendChild(li);
    });

    modal.style.display = "block";
}

function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById("productModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Order Form Logic (for index.html)
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const quantity = document.getElementById('quantity').value;
        const address = document.getElementById('address').value;

        const order = {
            id: getNextOrderId(),
            date: new Date().toLocaleString(),
            name,
            email,
            phone,
            quantity,
            address,
            status: 'Pending'
        };

        saveOrder(order);

        // Show Success Modal
        const thankYouModal = document.getElementById('thankYouModal');
        if (thankYouModal) {
            thankYouModal.style.display = 'block';
        } else {
            // Fallback
            const successMsg = document.getElementById('orderSuccess');
            if(successMsg) {
                successMsg.style.display = 'block';
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 3000);
            }
        }
        
        orderForm.reset();
    });
}

function closeThankYouModal() {
    document.getElementById("thankYouModal").style.display = "none";
}

// Admin Login Logic (for admin.html)
const loginForm = document.getElementById('loginForm');
const dashboard = document.getElementById('dashboard');
const loginSection = document.getElementById('loginSection');
const ordersTableBody = document.getElementById('ordersTableBody');

if (loginForm) {
    // Check if already logged in
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        showDashboard(loggedInUser);
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const errorMsg = document.getElementById('loginError');

        // Check if Admin
        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            const user = { type: 'admin', email: email };
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            showDashboard(user);
            errorMsg.style.display = 'none';
        } 
        // Else treat as Customer
        else {
            // For simulation, we accept any password for customers
            // In a real app, you would verify the password against a database
            const user = { type: 'customer', email: email };
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            showDashboard(user);
            errorMsg.style.display = 'none';
        }
    });
}

function showDashboard(user) {
    if(loginSection) loginSection.style.display = 'none';
    if(dashboard) dashboard.classList.remove('hidden');
    
    // Switch background for dashboard
    document.body.classList.remove('login-body');
    document.body.style.backgroundColor = '#f4f6f8';
    document.querySelector('header').style.position = 'static';
    document.querySelector('header').style.background = 'rgba(26, 77, 46, 0.95)';

    currentUser = user;

    const dashboardTitle = document.getElementById('dashboardTitle');
    const ordersTitle = document.getElementById('ordersTitle');
    const adminStats = document.getElementById('adminStats');
    
    if (user.type === 'admin') {
        if(dashboardTitle) dashboardTitle.textContent = "Admin Dashboard";
        if(ordersTitle) ordersTitle.textContent = "All Customer Orders";
        if(adminStats) adminStats.classList.remove('hidden');
        updateAdminStats();
    } else {
        if(dashboardTitle) dashboardTitle.textContent = `Welcome, ${user.email.split('@')[0]}`;
        if(ordersTitle) ordersTitle.textContent = "Your Order History";
        if(adminStats) adminStats.classList.add('hidden');
    }

    loadOrdersToTable(user);

    const navDashboard = document.getElementById('navDashboard');
    const navOrders = document.getElementById('navOrders');
    const navNotes = document.getElementById('navNotes');
    const notesSection = document.getElementById('notesSection');
    const ordersTableContainer = document.getElementById('ordersTableContainer');
    const dashboardOrdersList = document.getElementById('dashboardOrdersList');

    if (navDashboard && navOrders && navNotes) {
        navDashboard.onclick = function() {
            if(adminStats) adminStats.classList.remove('hidden');
            if(ordersTableContainer) ordersTableContainer.classList.add('hidden');
            if(dashboardOrdersList) dashboardOrdersList.classList.remove('hidden');
            if(notesSection) notesSection.classList.add('hidden');
            if (currentUser) loadDashboardOrdersList(currentUser);
        };
        navOrders.onclick = function() {
            if(adminStats) adminStats.classList.add('hidden');
            if(ordersTableContainer) ordersTableContainer.classList.remove('hidden');
            if(dashboardOrdersList) dashboardOrdersList.classList.add('hidden');
            if(notesSection) notesSection.classList.add('hidden');
        };
        navNotes.onclick = function() {
            if(adminStats) adminStats.classList.add('hidden');
            if(ordersTableContainer) ordersTableContainer.classList.add('hidden');
            if(dashboardOrdersList) dashboardOrdersList.classList.add('hidden');
            if(notesSection) notesSection.classList.remove('hidden');
        };
        if (user.type !== 'admin' && adminStats) adminStats.classList.add('hidden');
    }

    const orderSearchInput = document.getElementById('orderSearchInput');
    const orderSearchBtn = document.getElementById('orderSearchBtn');
    if (orderSearchInput && orderSearchBtn) {
        orderSearchBtn.onclick = function() {
            orderSearchQuery = orderSearchInput.value.trim().toLowerCase();
            loadOrdersToTable(user);
        };
        orderSearchInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                orderSearchQuery = orderSearchInput.value.trim().toLowerCase();
                loadOrdersToTable(user);
            }
        };
    }

    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const notesTextarea = document.getElementById('notesTextarea');
    const notesStatus = document.getElementById('notesStatus');
    if (saveNotesBtn && notesTextarea) {
        const key = user.type === 'admin' ? 'admin_notes' : `user_notes_${user.email.toLowerCase()}`;
        const existing = localStorage.getItem(key);
        if (existing) notesTextarea.value = existing;
        saveNotesBtn.onclick = function() {
            localStorage.setItem(key, notesTextarea.value);
            if (notesStatus) {
                notesStatus.textContent = "Saved";
                setTimeout(() => { notesStatus.textContent = ""; }, 1500);
            }
        };
    }
}

function updateAdminStats() {
    const orders = getOrders();
    const totalOrders = document.getElementById('totalOrders');
    const totalRevenue = document.getElementById('totalRevenue');
    const totalCustomers = document.getElementById('totalCustomers');
    
    if(totalOrders) totalOrders.textContent = orders.length;
    
    // Calculate Revenue (Mock calculation based on hardcoded prices for simplicity)
    // In a real app, order would store total price. 
    // Here we'll just assume average order value or sum if we had it.
    // Let's just count tons * 4500 (avg price) for demo
    const revenue = orders.reduce((acc, order) => acc + (order.quantity * 4500), 0);
    if(totalRevenue) totalRevenue.textContent = formatCurrency(revenue);

    // Count unique customers
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;
    if(totalCustomers) totalCustomers.textContent = uniqueCustomers;
}

function loadOrdersToTable(user) {
    if (!ordersTableBody) return;
    
    let orders = getOrders();
    ordersTableBody.innerHTML = '';

    // Filter for customer
    if (user.type !== 'admin') {
        orders = orders.filter(order => order.email.toLowerCase() === user.email.toLowerCase());
    }

    // Do not filter hidden orders here; removal affects dashboard view only.

    if (orderSearchQuery) {
        const q = orderSearchQuery;
        orders = orders.filter(o => {
            const idStr = String(o.id).padStart(6, '0');
            return (
                idStr.includes(q) ||
                (o.name && o.name.toLowerCase().includes(q)) ||
                (o.email && o.email.toLowerCase().includes(q)) ||
                (o.address && o.address.toLowerCase().includes(q))
            );
        });
    }

    if (orders.length === 0) {
        const colspan = currentUser && currentUser.type === 'admin' ? 7 : 6;
        ordersTableBody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; padding: 40px; color: #666;">No orders found.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        let statusHtml = '';

        if (user.type === 'admin') {
            statusHtml = `
                <select class="status-select ${order.status.toLowerCase()}" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Shipping" ${order.status === 'Shipping' ? 'selected' : ''}>Shipping</option>
                    <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            `;
        } else {
            let statusClass = 'status-pending';
            if (order.status === 'Completed') statusClass = 'status-completed';
            if (order.status === 'Shipping') statusClass = 'status-shipping';
            statusHtml = `<span class="status-badge ${statusClass}">${order.status}</span>`;
        }
        
        row.innerHTML = `
            <td>#${String(order.id).padStart(6,'0')}</td>
            <td>${order.date}</td>
            <td>
                <strong>${order.name}</strong><br>
                <span style="color:#666; font-size:0.9em">${order.email}</span><br>
                <span style="color:#666; font-size:0.9em">${order.phone}</span>
            </td>
            <td><strong>${order.quantity} Tons</strong></td>
            <td>${order.address}</td>
            <td>${statusHtml}</td>
        `;
        ordersTableBody.appendChild(row);
    });
}

function updateOrderStatus(orderId, newStatus) {
    let orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        
        // Update stats if admin is viewing
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.type === 'admin') {
            updateAdminStats();
            // Refresh table to update select color
            loadOrdersToTable(loggedInUser);
        }
    }
}

function removeOrderFromDashboard(orderId) {
    hideOrderId(orderId);
    if (currentUser) {
        loadDashboardOrdersList(currentUser);
        updateAdminStats();
    }
}

function loadDashboardOrdersList(user) {
    const body = document.getElementById('dashboardOrdersBody');
    if (!body || user.type !== 'admin') return;
    let orders = getOrders();
    const hidden = new Set(getHiddenOrders());
    orders = orders.filter(o => !hidden.has(o.id));
    body.innerHTML = '';
    if (orders.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #666;">No orders in dashboard.</td></tr>';
        return;
    }
    orders.forEach(order => {
        let statusClass = 'status-pending';
        if (order.status === 'Completed') statusClass = 'status-completed';
        if (order.status === 'Shipping') statusClass = 'status-shipping';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${String(order.id).padStart(6,'0')}</td>
            <td><strong>${order.name}</strong><br><span style="color:#666; font-size:0.9em">${order.email}</span></td>
            <td><strong>${order.quantity} Tons</strong></td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td><button class="btn-remove" onclick="removeOrderFromDashboard(${order.id})">Remove</button></td>
        `;
        body.appendChild(tr);
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('loggedInUser');
        // Clear legacy key if it exists
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.reload();
    });
}
