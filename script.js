// =======================================
// Multi-User SecureLogin - CYB 203 Demo
// =======================================

// User Database (username + password + role)
const users = [
    { username: "admin", password: "password123", role: "Admin" },
    { username: "john", password: "john2026", role: "Member" },
    { username: "mary", password: "mary2026", role: "Member" },
    { username: "ibrahim", password: "ibra2026", role: "Member" }
];

let failedAttempts = 0;
let maxAttempts = 3;
let lockTime = 30; // seconds
let countdownInterval;
let isLocked = false;

// =======================================
// Security Log Function
// =======================================
function addLog(message) {
    const logBox = document.getElementById("log");
    const time = new Date().toLocaleTimeString();
    const logEntry = document.createElement("p");
    logEntry.innerText = `[${time}] ${message}`;
    logBox.prepend(logEntry);
}

// =======================================
// Admin Dashboard Logger
// =======================================
function addDashboardLog(username, action, status) {
    const tableBody = document.querySelector("#dashboard-table tbody");
    const time = new Date().toLocaleTimeString();
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${time}</td>
        <td>${username}</td>
        <td>${action}</td>
        <td>${status}</td>
    `;
    tableBody.prepend(row);
}

// =======================================
// Password Strength Checker
// =======================================
const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");

passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let strength = 0;
    if (val.length >= 6) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[\W]/.test(val)) strength++;

    switch (strength) {
        case 0:
        case 1:
            strengthBar.style.width = "25%";
            strengthBar.style.background = "#dc3545";
            strengthText.innerText = "Weak";
            break;
        case 2:
            strengthBar.style.width = "50%";
            strengthBar.style.background = "#ffc107";
            strengthText.innerText = "Medium";
            break;
        case 3:
            strengthBar.style.width = "75%";
            strengthBar.style.background = "#17a2b8";
            strengthText.innerText = "Strong";
            break;
        case 4:
            strengthBar.style.width = "100%";
            strengthBar.style.background = "#28a745";
            strengthText.innerText = "Very Strong";
            break;
    }
    if (val === "") {
        strengthBar.style.width = "0%";
        strengthText.innerText = "";
    }
});

// =======================================
// Login Function (Multi-User)
// =======================================
function login() {
    if (isLocked) return;

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Success
        document.getElementById("message").innerText = "Access Granted ✔";
        document.getElementById("status").innerText = "System Secure";
        document.getElementById("status").style.background = "#28a745";

        addLog(`Successful login: ${username}`);
        addDashboardLog(username, "Login Attempt", "Success");

        failedAttempts = 0;
        document.getElementById("attempts").innerText = "";

        // Redirect to dashboard page
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);

    } else {
        // Failed
        failedAttempts++;
        document.getElementById("message").innerText = "Invalid Credentials!";
        document.getElementById("attempts").innerText =
            `Failed Attempts: ${failedAttempts}/${maxAttempts}`;

        addLog(`Failed login attempt: ${username}`);
        addDashboardLog(username, "Login Attempt", "Failed");

        if (failedAttempts >= maxAttempts) {
            lockAccount();
        }
    }
}

// =======================================
// Lock Account Function with Animation
// =======================================
function lockAccount() {
    isLocked = true;
    let remainingTime = lockTime;

    document.getElementById("status").innerText = "Account Locked";
    document.getElementById("status").style.background = "#dc3545";
    document.getElementById("message").innerText =
        "Too many failed attempts!";

    addLog("Account locked due to multiple failed attempts.");
    addDashboardLog("SYSTEM", "Account Lock Triggered", "Locked");

    // Shake animation
    const card = document.querySelector(".card");
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 500);

    countdownInterval = setInterval(() => {
        document.getElementById("timer").innerText =
            `Try again in ${remainingTime} seconds`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(countdownInterval);
            unlockAccount();
        }
    }, 1000);
}

// =======================================
// Unlock Account Function
// =======================================
function unlockAccount() {
    isLocked = false;
    failedAttempts = 0;

    document.getElementById("status").innerText = "System Secure";
    document.getElementById("status").style.background = "#28a745";
    document.getElementById("message").innerText =
        "You may try logging in again.";
    document.getElementById("attempts").innerText = "";
    document.getElementById("timer").innerText = "";

    addLog("Account unlocked. System restored.");
    addDashboardLog("SYSTEM", "Account Unlocked", "Restored");
}

// =======================================
// Realistic Brute Force Simulation
// =======================================
function simulateAttack() {
    if (isLocked) return;

    document.getElementById("message").innerText =
        "Brute Force Attack In Progress...";
    addLog("Brute force attack simulation started.");
    addDashboardLog("SIMULATION", "Brute Force Attack Started", "In Progress");

    const fakeUser = "admin";
    const wrongPasswords = ["123456", "password", "admin123", "letmein"];

    let attemptIndex = 0;

    function typeCredentials(username, password, callback) {
        let userField = document.getElementById("username");
        let passField = document.getElementById("password");

        userField.value = "";
        passField.value = "";

        let i = 0;
        let typingUser = setInterval(() => {
            userField.value += username[i];
            i++;
            if (i >= username.length) {
                clearInterval(typingUser);

                let j = 0;
                let typingPass = setInterval(() => {
                    passField.value += password[j];
                    j++;
                    if (j >= password.length) {
                        clearInterval(typingPass);
                        setTimeout(callback, 500);
                    }
                }, Math.floor(Math.random() * 70 + 80));
            }
        }, Math.floor(Math.random() * 70 + 80));
    }

    function attemptLogin() {
        if (isLocked) return;

        let passwordToTry = wrongPasswords[attemptIndex];
        attemptIndex++;

        typeCredentials(fakeUser, passwordToTry, () => {
            login();
            if (attemptIndex < wrongPasswords.length && !isLocked) {
                setTimeout(attemptLogin, 1000);
            }
        });
    }

    attemptLogin();
}