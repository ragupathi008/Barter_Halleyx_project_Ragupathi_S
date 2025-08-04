const API_URL = "http://localhost:5000/users";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user._id) return alert("No user logged in");

  try {
    const res = await fetch(`${API_URL}/${user._id}`);
    const data = await res.json();

    document.getElementById("display-name").value = data.name;
    document.getElementById("email").value = data.email;
    document.getElementById("current-avatar").src = data.profileImage || "C:\auth_project_05\src\assests\default.png";
    document.getElementById("user-avatar").src = data.profileImage || "C:\auth_project_05\src\assests\default.png";
    document.getElementById("user-display-name").textContent = data.name || "User";
  } catch (err) {
    console.error("Error fetching user", err);
  }

  document.getElementById("saveSettingsBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("display-name").value;
    const imageInput = document.getElementById("avatar-upload");

    let profileImage = null;

    if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(imageInput.files[0]);
      reader.onload = async () => {
        profileImage = reader.result;
        await updateUser(user._id, name, profileImage);
      };
    } else {
      await updateUser(user._id, name, null);
    }
  });
});

async function updateUser(id, name, profileImage) {
  try {
    const res = await fetch(`http://localhost:5000/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, profileImage }),
    });
    const updated = await res.json();
    localStorage.setItem("user", JSON.stringify(updated));

    document.getElementById("user-display-name").textContent = updated.name;
    document.getElementById("user-avatar").src = updated.profileImage || "/src/assets/default_avatar.png";
    document.getElementById("current-avatar").src = updated.profileImage || "/src/assets/default_avatar.png";
    alert("✅ Profile updated!");
  } catch (err) {
    console.error("Failed to update", err);
  }
}
