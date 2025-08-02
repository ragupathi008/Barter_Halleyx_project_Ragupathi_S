document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;

  // Reset errors
  document.querySelectorAll(".error-icon").forEach(el => el.style.display = "none");

  // Validation
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").style.display = "inline";
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message.includes("User already exists")) {
        document.getElementById("emailError").style.display = "inline";
      }
      alert(data.message);
      return;
    }

    alert("✅ Signup successful!");
localStorage.setItem("user", JSON.stringify({ name, email, role }));

// Redirect based on user role
if (role === "admin") {
  window.location.href = "/client/public/admin/sample.html";
} else if (role === "user") {
  window.location.href = "/client/public/user/dashboard.html";
} else {
  alert("Unknown role. Please contact support.");
}


  } catch (err) {
    console.error("Signup Error:", err);
    alert("Something went wrong. Please try again.");
  }
});
