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

    alert("Login successful");
});


// SIGNUP submit
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = signupForm.querySelectorAll("input");

    const data = {
        role: signupRole.value,
        name: inputs[0].value,
        email: inputs[inputs.length - 2].value,
        password: inputs[inputs.length - 1].value
    };

    if (signupRole.value === "company") {
        data.companyName = inputs[1].value;
        data.serviceType = inputs[2].value;
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
