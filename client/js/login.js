document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // Reset error icons
  emailError.style.display = "none";
  passwordError.style.display = "none";

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message.includes("email")) {
        emailError.style.display = "inline";
      } else if (data.message.includes("password")) {
        passwordError.style.display = "inline";
      }
      alert(data.message);
      return;
    }

    // ✅ Login success
    alert("✅ Login successful!");
    localStorage.setItem("user", JSON.stringify(data.user));

    // 🔄 Redirect based on role
    if (data.user.role === "admin") {
      window.location.href = "/client/public/admin/sample.html";
    } else {
      window.location.href = "/client/public/user/dashboard.html";
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong. Please try again.");
  }
});


console.log("Response status:", res.status);
console.log("Returned user:", data.user);
