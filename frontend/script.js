const API_URL = "/api";

// --- Theme Logic ---
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
}
initTheme();

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}


function getStatusColor(status) {
    if (status === 'confirmed') return 'green';
    if (status === 'completed') return 'blue';
    if (status === 'cancelled' || status === 'rejected') return 'red';
    return 'orange';
}

// --- Profile & Navbar Logic ---
// --- Dynamic Navbar Logic ---
function renderNavbar() {
    const navLinksContainer = document.querySelector(".nav-links");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const currentPage = window.location.pathname.split("/").pop();

    if (!navLinksContainer) return;

    // Clear existing links (except theme toggle if we want to keep it custom, but better to rebuild all)
    navLinksContainer.innerHTML = '';

    let links = [];

    if (!token) {
        // Not logged in? Usually redirects to index.html, but just in case
        links = [];
    } else if (role === 'company') {
        links = [
            { text: "Dashboard", href: "provider-dashboard.html" },
            { text: "My Services", href: "manage-services.html" },
            // Provider sees their bookings on dashboard, but if we want a separate link:
            // { text: "My Bookings", href: "provider-dashboard.html" } 
        ];
    } else {
        // Customer
        links = [
            { text: "Home", href: "dashboard.html" },
            { text: "Browse Services", href: "services.html" },
            { text: "My Bookings", href: "bookings.html" }
        ];
    }

    // Render Links
    links.forEach(link => {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        if (currentPage === link.href) a.classList.add("active");
        navLinksContainer.appendChild(a);
    });

    // Add Theme Toggle
    const themeBtn = document.createElement("button");
    themeBtn.id = "themeToggle";
    themeBtn.className = "theme-toggle";
    themeBtn.textContent = "🌗";
    themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
    navLinksContainer.appendChild(themeBtn);

    // Profile Dropdown (Re-using logic from updateNavbarProfile but integrated)
    updateNavbarProfile(navLinksContainer);
}

// Rewriting updateNavbarProfile to accept container or find it
function updateNavbarProfile(container) {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");

    if (!token) return;

    // Remove existing if any (cleanup)
    const existing = document.getElementById("profile-dropdown-container");
    if (existing) existing.remove();

    // Create Profile Icon Container
    const profileContainer = document.createElement("div");
    profileContainer.id = "profile-dropdown-container";
    profileContainer.style.position = "relative";
    profileContainer.style.marginLeft = "20px";
    profileContainer.style.display = "inline-block";

    // Create Icon
    const icon = document.createElement("div");
    icon.className = "profile-icon";
    icon.innerText = userName ? userName.charAt(0).toUpperCase() : "U";
    icon.style.width = "40px";
    icon.style.height = "40px";
    icon.style.borderRadius = "50%";
    icon.style.background = "var(--primary-color)";
    icon.style.color = "#fff";
    icon.style.display = "flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.fontWeight = "bold";
    icon.style.cursor = "pointer";
    icon.style.border = "2px solid var(--card-bg)";

    // Create Dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "profile-dropdown hidden";
    dropdown.style.position = "absolute";
    dropdown.style.top = "50px";
    dropdown.style.right = "0";
    dropdown.style.background = "var(--card-bg)";
    dropdown.style.border = "1px solid var(--border-color)";
    dropdown.style.borderRadius = "8px";
    dropdown.style.padding = "15px";
    dropdown.style.width = "200px";
    dropdown.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    dropdown.style.zIndex = "1000";

    dropdown.innerHTML = `
        <p style="margin-bottom:5px; font-weight:bold;">${userName}</p>
        <p style="margin-bottom:15px; font-size:0.8rem; color:var(--text-muted);">Account</p>
        <button onclick="window.location.href='edit-profile.html'" style="width:100%; margin-bottom:10px; font-size:0.9rem;">Edit Profile</button>
        <button id="logoutBtnDropdown" style="width:100%; background:var(--danger-color); font-size:0.9rem;">Logout</button>
    `;

    // Toggle Logic
    icon.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });

    // Close on click outside
    document.addEventListener("click", () => {
        dropdown.classList.add("hidden");
    });

    dropdown.addEventListener("click", (e) => e.stopPropagation());

    profileContainer.appendChild(icon);
    profileContainer.appendChild(dropdown);
    container.appendChild(profileContainer);

    // Logout Logic inside dropdown
    document.getElementById("logoutBtnDropdown").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");
        localStorage.removeItem("theme");
        window.location.href = "index.html";
    });
}

// Update User Name Display (Dashboard) - Keep this for dashboard specifically
function updateUserNameDisplay() {
    const userName = localStorage.getItem("userName");
    const nameElement = document.getElementById("userName");
    if (userName && nameElement) {
        const firstName = userName.split(' ')[0];
        const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        nameElement.textContent = formattedName;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Only run if not on login page
    if (!document.getElementById("loginForm")) {
        renderNavbar(); // Determines links and calls updateNavbarProfile
        updateUserNameDisplay();
    }
    // Re-init theme to ensure it applies
    initTheme();
});

// --- Edit Profile Page Logic ---
const editProfileForm = document.getElementById("editProfileForm");
if (editProfileForm) {
    async function loadProfile() {
        try {
            console.log("Fetching profile for token:", token);
            const res = await fetch(`${API_URL}/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const user = await res.json();

            if (!res.ok) {
                console.error("Profile fetch error:", user);
                if (res.status === 401 || res.status === 403) {
                    alert("Session expired or invalid. Please login again.");
                    localStorage.clear();
                    window.location.href = "index.html";
                    return;
                }
                throw new Error(user.message || "Failed to fetch");
            }

            console.log("Profile loaded:", user);
            // Populate fields
            const nameField = document.getElementById("profileName");
            const emailField = document.getElementById("profileEmail");

            if (nameField) nameField.value = user.name || "";
            if (emailField) {
                emailField.value = user.email || "";
                // Ensure it looks read-only
                emailField.setAttribute("readonly", true);
            }

        } catch (err) {
            console.error("Load Profile Exception:", err);
            alert("Failed to load profile details. Check console.");
        }
    }
    loadProfile();

    editProfileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("profileName").value;
        const password = document.getElementById("profilePassword").value;
        const confirmAnd = document.getElementById("profileConfirmPassword").value;

        if (password && password !== confirmAnd) {
            alert("Passwords do not match!");
            return;
        }

        const data = { name };
        if (password) data.password = password;

        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            alert("Profile updated successfully!");
            // Update local storage name
            localStorage.setItem("userName", result.user.name);
            // Refresh
            location.reload();
        } catch (err) {
            alert(err.message);
        }
    });
}

// --- Auth Check ---


// --- Auth Check & RBAC ---
const token = localStorage.getItem("token");
// Paths that don't pass authentication check
const publicPaths = ["/", "/index.html", "/verify-otp.html"];

if (!token && !publicPaths.includes(window.location.pathname)) {
    window.location.href = "index.html";
}

// Role-Based Access Control
function checkAccess() {
    const role = localStorage.getItem("role");
    const path = window.location.pathname;

    // Defined allowed paths for each role
    const customerAllowed = ["dashboard", "services", "bookings", "edit-profile"];
    const providerAllowed = ["provider-dashboard", "manage-services", "edit-profile"];

    if (!role) return; // Should be handled by token check

    const page = path.split("/").pop().replace(".html", "");
    if (!page || page === "index" || page === "verify-otp") return; // Public/Auth pages

    if (role === "user") {
        if (!customerAllowed.includes(page)) {
            // Trying to access provider page?
            if (providerAllowed.includes(page)) {
                alert("Unauthorized Access");
                window.location.href = "dashboard.html";
            }
        }
    } else if (role === "company") {
        if (!providerAllowed.includes(page)) {
            // Trying to access customer page?
            if (customerAllowed.includes(page)) {
                alert("Unauthorized: Providers cannot access this page.");
                window.location.href = "provider-dashboard.html";
            }
        }
    }
}
// Run check
checkAccess();

// --- Logout ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    // Hide default logout btn if we are injecting the profile dropdown which has logout
    // Or we can keep it for fallback.
    // Actually, updateNavbarProfile removes it. 
}
// ----------------

// --- Auth Page Logic ---
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
if (loginForm) {
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");
    const signupRole = document.getElementById("signupRole");
    const companyFields = document.getElementById("companyFields");

    showSignup.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
    });

    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    signupRole.addEventListener("change", () => {
        if (signupRole.value === "company") {
            companyFields.classList.remove("hidden");
        } else {
            companyFields.classList.add("hidden");
        }
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            role: document.getElementById("loginRole").value,
            email: loginForm.querySelector('input[type="email"]').value,
            password: loginForm.querySelector('input[type="password"]').value
        };

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            localStorage.setItem("token", result.token);

            // Decode token to get role (simple implementation)
            const payload = JSON.parse(atob(result.token.split('.')[1]));

            // Store Name (Assume backend sends user object with name)
            if (result.user && result.user.name) {
                localStorage.setItem("userName", result.user.name);
            }

            // Store Role
            localStorage.setItem("role", payload.role);

            if (payload.role === 'company') {
                window.location.href = "provider-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } catch (err) {
            alert(err.message);
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            role: signupRole.value,
            name: signupForm.querySelector('input[placeholder="Enter full name"]').value,
            email: signupForm.querySelector('input[type="email"]').value,
            password: signupForm.querySelector('input[type="password"]').value
        };

        if (signupRole.value === "company") {
            data.companyName = signupForm.querySelector('input[placeholder="Enter company name"]').value;
            data.serviceType = signupForm.querySelector('input[placeholder="e.g. Plumber, Electrician"]').value;
        }

        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            alert("Signup successful! Please check email for OTP.");

            // Redirect to verify-otp page
            window.location.href = `verify-otp.html?email=${encodeURIComponent(data.email)}`;
        } catch (err) {
            alert(err.message);
        }

    });
}
// ----------------

// --- Service Listing Page ---
const serviceList = document.getElementById("service-list");
if (serviceList) {
    const filterBtn = document.getElementById("filterBtn");

    async function fetchServices() {
        const category = document.getElementById("category").value;
        const search = document.getElementById("search").value;
        const minPrice = document.getElementById("minPrice").value;
        const maxPrice = document.getElementById("maxPrice").value;

        let query = "?";
        if (category) query += `category=${category}&`;
        if (search) query += `search=${search}&`;
        if (minPrice) query += `minPrice=${minPrice}&`;
        if (maxPrice) query += `maxPrice=${maxPrice}&`;

        const res = await fetch(`${API_URL}/services${query}`);
        const services = await res.json();

        serviceList.innerHTML = services.map(service => {
            const role = localStorage.getItem("role");
            const showBookBtn = role !== 'company'; // Hide if provider

            return `
            <div class="service-card">
                <h3>${service.title}</h3>
                <p><strong>Category:</strong> ${service.category}</p>
                <p>${service.description}</p>
                <p class="price">$${service.price}</p>
                <p><small>By: ${service.provider?.name || 'Unknown'}</small></p>
                ${showBookBtn ?
                    `<button class="book-btn" onclick="openBookingModal('${service._id}', '${service.title}', ${service.price})">Book Now</button>`
                    : ''}
            </div>
        `}).join("");
    }

    if (filterBtn) {
        filterBtn.addEventListener("click", fetchServices);
    }

    fetchServices(); // Initial load
}

// --- Booking Modal Logic ---
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");

function openBookingModal(id, title, price) {
    document.getElementById("serviceId").value = id;
    document.getElementById("modalTitle").innerText = `Book: ${title}`;
    document.getElementById("modalPrice").innerText = `Price: $${price}`;
    bookingModal.classList.remove("hidden");
}

if (bookingModal) {
    document.querySelector(".close").addEventListener("click", () => {
        bookingModal.classList.add("hidden");
    });

    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const serviceId = document.getElementById("serviceId").value;
        const date = document.getElementById("bookingDate").value;
        const notes = document.getElementById("bookingNotes").value;

        try {
            const res = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ serviceId, date, notes })
            });

            if (!res.ok) throw new Error("Booking failed");

            alert("Booking Confirmed!");
            bookingModal.classList.add("hidden");
        } catch (err) {
            alert(err.message);
        }
    });
}

// --- My Bookings Page ---
const bookingHistoryContainer = document.getElementById("booking-history-container");
if (bookingHistoryContainer) {
    async function fetchBookings() {

        try {
            const res = await fetch(`${API_URL}/bookings/my-bookings`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const bookings = await res.json();

            // Split bookings
            const pendingBookings = bookings.filter(b => b.status === 'pending');
            const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
            const pastBookings = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));

            const renderBooking = (b) => `
                <div class="service-card">
                    <h3>${b.service?.title || 'Service Deleted'}</h3>
                    <p><small>ID: #${b.shortId || b._id.substr(-6).toUpperCase()}</small></p>
                    <p><strong>Date:</strong> ${new Date(b.date).toLocaleDateString()}</p>

                    <p><strong>Status:</strong> <span style="font-weight:bold; color:${getStatusColor(b.status)}">${b.status.toUpperCase()}</span></p>
                    <p><strong>Price:</strong> $${b.totalPrice}</p>
                    ${b.status === 'pending' ? `<button class="book-btn" style="background:#d9534f" onclick="cancelBooking('${b._id}')">Cancel</button>` : ''}
                    ${b.status === 'completed' ? `
                        <button class="book-btn" style="background:${b.review ? '#ab47bc' : '#ff7518'}" 
                                onclick='openReviewModal("${b._id}", ${JSON.stringify(b.review || null)})'>
                            ${b.review ? 'Update Review' : 'Rate & Review'}
                        </button>
                    ` : ''}
                </div>
            `;

            const pendingList = document.getElementById("booking-list-pending");
            const confirmedList = document.getElementById("booking-list-confirmed");
            const pastList = document.getElementById("booking-list-past");

            if (pendingList) pendingList.innerHTML = pendingBookings.length ? pendingBookings.map(renderBooking).join("") : "<p>No pending bookings.</p>";
            if (confirmedList) confirmedList.innerHTML = confirmedBookings.length ? confirmedBookings.map(renderBooking).join("") : "<p>No confirmed bookings.</p>";
            if (pastList) pastList.innerHTML = pastBookings.length ? pastBookings.map(renderBooking).join("") : "<p>No past bookings.</p>";

            // Legacy fallback if elements don't exist (for safety)
            if (activeList && !activeList) {
                // Removed legacy fallback as container ID changed
            }




        } catch (err) {
            console.error(err);
        }
    }

    window.cancelBooking = async (id) => {
        if (!confirm("Are you sure?")) return;

        await fetch(`${API_URL}/bookings/${id}/cancel`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchBookings();
    };

    fetchBookings();
}

// --- Provider Dashboard Logic ---
// We check for one of the new containers since the main wrapper ID was removed/changed
const providerContainer = document.getElementById("provider-bookings-pending");
if (providerContainer) {
    async function fetchProviderBookings() {

        try {
            const res = await fetch(`${API_URL}/bookings/my-bookings`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const bookings = await res.json();

            // Split bookings for provider
            const pendingBookings = bookings.filter(b => b.status === 'pending');
            const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
            const completedBookings = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status));

            const renderProviderBooking = (b) => `
                <div class="service-card">
                    <h3>${b.service?.title || 'Unknown Service'}</h3>
                    <p><small>ID: #${b.shortId || b._id.substr(-6).toUpperCase()}</small></p>
                    <p><strong>Customer:</strong> ${b.customer?.name}</p>

                    <p><strong>Date:</strong> ${new Date(b.date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                        <span style="font-weight:bold; color:${getStatusColor(b.status)}">${b.status.toUpperCase()}</span>
                    </p>
                    <p><strong>Notes:</strong> ${b.notes || 'None'}</p>
                    
                    ${b.status === 'pending' ? `
                        <button onclick="updateBookingStatus('${b._id}', 'confirmed')" style="background:#66bb6a; margin-right:5px; padding:5px 10px; color:white; border:none; border-radius:3px; cursor:pointer;">Accept</button>
                        <button onclick="updateBookingStatus('${b._id}', 'rejected')" style="background:#ef5350; padding:5px 10px; color:white; border:none; border-radius:3px; cursor:pointer;">Reject</button>
                    ` : ''}

                    ${b.status === 'confirmed' ? `
                        <button onclick="updateBookingStatus('${b._id}', 'completed')" style="background:#42a5f5; padding:5px 10px; color:white; border:none; border-radius:3px; cursor:pointer;">Mark Completed</button>
                    ` : ''}
                </div>
            `;

            const pendingList = document.getElementById("provider-bookings-pending");
            const confirmedList = document.getElementById("provider-bookings-confirmed");
            const completedList = document.getElementById("provider-bookings-completed");

            if (pendingList) pendingList.innerHTML = pendingBookings.length ? pendingBookings.map(renderProviderBooking).join("") : "<p>No pending requests.</p>";
            if (confirmedList) confirmedList.innerHTML = confirmedBookings.length ? confirmedBookings.map(renderProviderBooking).join("") : "<p>No confirmed bookings.</p>";
            if (completedList) completedList.innerHTML = completedBookings.length ? completedBookings.map(renderProviderBooking).join("") : "<p>No booking history.</p>";

            // Legacy fallback
            if (pendingList && !pendingList) {
                // Removed legacy fallback
            }


        } catch (err) {
            console.error(err);
        }
    }

    window.updateBookingStatus = async (id, status) => {
        if (!confirm(`Mark booking as ${status}?`)) return;

        await fetch(`${API_URL}/bookings/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        fetchProviderBookings();
    };



    fetchProviderBookings();


    // Fetch and display reviews
    const providerReviewsList = document.getElementById("provider-reviews");
    if (providerReviewsList) {
        async function fetchProviderReviews() {
            try {
                const res = await fetch(`${API_URL}/reviews/my-reviews`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const reviews = await res.json();

                if (reviews.length === 0) {
                    providerReviewsList.innerHTML = "<p>No reviews yet.</p>";
                    return;
                }

                providerReviewsList.innerHTML = reviews.map(r => `
                    <div class="service-card">
                        <h3>${r.booking?.service?.title || 'Service'}</h3>
                        <p><small>Booking ID: #${r.booking?.shortId || r.booking?._id?.substr(-6).toUpperCase() || 'N/A'}</small></p>
                        <p><strong>Rating:</strong> ${'⭐'.repeat(r.rating)}</p>

                        <p><strong>Reviewer:</strong> ${r.reviewer?.name}</p>
                        <p><em>"${r.comment}"</em></p>
                        <p><small>${new Date(r.createdAt).toLocaleDateString()}</small></p>
                    </div>
                `).join("");
            } catch (err) {
                console.error(err);
            }
        }
        fetchProviderReviews();
    }
}


// --- Manage Services Logic ---
const myServicesList = document.getElementById("my-services-list");
const serviceForm = document.getElementById("serviceForm");

// Define fetchMyServices globally so it can be called after add/delete
window.fetchMyServices = async () => {
    if (!myServicesList) return;

    try {
        const res = await fetch(`${API_URL}/services/my-services`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const services = await res.json();

        if (services.length === 0) {
            myServicesList.innerHTML = "<p>No services found. Add one!</p>";
            return;
        }

        myServicesList.innerHTML = services.map(s => `
            <div class="service-card">
                <h3>${s.title}</h3>
                <p><strong>Category:</strong> ${s.category}</p>
                <p><strong>Price:</strong> $${s.price}</p>
                <button onclick="editService('${s._id}')" class="btn-edit">Edit</button>
                <button onclick="deleteService('${s._id}')" class="btn-delete">Delete</button>
            </div>
        `).join("");

        // Store services globally for edit
        window.myServices = services;
    } catch (err) {
        console.error(err);
    }
};

if (myServicesList) {
    window.deleteService = async (id) => {
        if (!confirm("Delete this service?")) return;
        await fetch(`${API_URL}/services/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        window.fetchMyServices();
    };

    window.editService = (id) => {
        const service = window.myServices.find(s => s._id === id);
        if (service) {
            document.getElementById("serviceId").value = service._id;
            document.getElementById("serviceTitle").value = service.title;
            document.getElementById("serviceCategory").value = service.category;
            document.getElementById("serviceDesc").value = service.description;
            document.getElementById("servicePrice").value = service.price;
            document.getElementById("serviceLocation").value = service.location || '';
            document.getElementById("serviceModalTitle").innerText = "Edit Service";
            document.getElementById("serviceModal").classList.remove("hidden");
        }
    };

    window.fetchMyServices();
}

// Modal functions for Services
window.openServiceModal = () => {
    if (document.getElementById("serviceForm")) {
        document.getElementById("serviceForm").reset();
    }
    document.getElementById("serviceId").value = "";
    document.getElementById("serviceModalTitle").innerText = "Add Service";
    document.getElementById("serviceModal").classList.remove("hidden");
};

window.closeServiceModal = () => {
    document.getElementById("serviceModal").classList.add("hidden");
};

if (serviceForm) {
    serviceForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("serviceId").value;
        const data = {
            title: document.getElementById("serviceTitle").value,
            category: document.getElementById("serviceCategory").value,
            description: document.getElementById("serviceDesc").value,
            price: document.getElementById("servicePrice").value,
            location: document.getElementById("serviceLocation").value
        };

        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}/services/${id}` : `${API_URL}/services`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Operation failed");

            closeServiceModal();
            // Call the global function
            if (window.fetchMyServices) {
                window.fetchMyServices();
            }
        } catch (err) {
            alert(err.message);
        }
    });
}

// --- Review Logic ---
// --- Review Logic ---
const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
    window.openReviewModal = (bookingId, existingReview = null) => {
        if (document.getElementById("reviewBookingId")) {
            document.getElementById("reviewBookingId").value = bookingId;

            if (existingReview) {
                document.getElementById("reviewModalTitle").innerText = "Update Review";
                document.getElementById("reviewRating").value = existingReview.rating;
                document.getElementById("reviewComment").value = existingReview.comment;
                reviewForm.dataset.mode = "update";
                reviewForm.dataset.reviewId = existingReview._id;
            } else {
                document.getElementById("reviewModalTitle").innerText = "Rate Service";
                reviewForm.reset();
                document.getElementById("reviewBookingId").value = bookingId;
                reviewForm.dataset.mode = "create";
                delete reviewForm.dataset.reviewId;
            }

            document.getElementById("reviewModal").classList.remove("hidden");
        }
    };

    window.closeReviewModal = () => {
        document.getElementById("reviewModal").classList.add("hidden");
    };

    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // Check if elements exist before accessing value
        const bookingIdInput = document.getElementById("reviewBookingId");
        const ratingInput = document.getElementById("reviewRating");
        const commentInput = document.getElementById("reviewComment");

        if (!bookingIdInput || !ratingInput || !commentInput) return;

        const bookingId = bookingIdInput.value;
        const rating = ratingInput.value;
        const comment = commentInput.value;

        const mode = reviewForm.dataset.mode;
        const reviewId = reviewForm.dataset.reviewId;

        try {
            let res;
            if (mode === "update" && reviewId) {
                res = await fetch(`${API_URL}/reviews/${reviewId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ rating, comment })
                });
            } else {
                res = await fetch(`${API_URL}/reviews`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ bookingId, rating, comment })
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert(mode === "update" ? "Review updated!" : "Review submitted!");
            closeReviewModal();
            if (window.fetchBookings) window.fetchBookings();
        } catch (err) {
            alert(err.message);
        }
    });
}


