const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const signupRole = document.getElementById("signupRole");
const companyFields = document.getElementById("companyFields");

// switch to signup
showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
});

// switch to login
showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// show/hide company fields
signupRole.addEventListener("change", () => {
    if (signupRole.value === "company") {
        companyFields.classList.remove("hidden");
    } else {
        companyFields.classList.add("hidden");
    }
});

// LOGIN submit
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        role: document.getElementById("loginRole").value,
        email: loginForm.querySelector('input[type="email"]').value,
        password: loginForm.querySelector('input[type="password"]').value
    };

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        alert(result.message);
        return;
    }

    localStorage.setItem("token", result.token);
    window.location.href = "dashboard.html";
});


// SIGNUP submit
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

    await fetch("/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    alert("Signup data stored");

    signupForm.reset();
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});
