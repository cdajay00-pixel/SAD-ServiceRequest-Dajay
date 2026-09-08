// Check if a user is currently logged in
async function checkUser() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        // No logged-in user
        if (!window.location.pathname.endsWith("login.html")) {
            window.location.href = "login.html";
        }

        return null;
    }

    return data.user;
}


// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const loginMessage = document.getElementById("loginMessage");

        loginMessage.textContent = "Logging in...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            loginMessage.textContent = error.message;
            return;
        }

        loginMessage.textContent = "Login successful!";

        window.location.href = "index.html";
    });
}


// Logout function
async function logout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Logout failed: " + error.message);
        return;
    }

    window.location.href = "login.html";
}
Compose
Write to Kim Quicos
