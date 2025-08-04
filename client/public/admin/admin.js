document.getElementById("refreshBtn").addEventListener("click", loadUsers);
document.getElementById("addUserBtn").addEventListener("click", openAddUserModal);

// LOAD USERS
async function loadUsers() {
  try {
    const res = await fetch("http://localhost:5000/users");
    const users = await res.json();
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    users.forEach((user, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button onclick="editUser('${user._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user._id) return;

  try {
    // ✅ FIXED: Added "/" before user._id in the URL
    const res = await fetch(`http://localhost:5000/users/${user._id}`);
    const data = await res.json();

    // ✅ Set user name
    document.getElementById("user-display-name").textContent = data.name || "User";

    // ✅ Set profile image with fallback
    const avatar = document.getElementById("user-profile-image");
    avatar.src = data.profileImage && data.profileImage !== ""
      ? data.profileImage
      : "/src/assets/AR_logo.png";

  } catch (err) {
    console.error("Failed to fetch user info:", err);
  }
});



// OPEN ADD USER MODAL
function openAddUserModal() {
  document.getElementById("addForm").reset();
  document.getElementById("addModal").style.display = "flex";
}

// CLOSE ADD USER MODAL
function closeAddModal() {
  document.getElementById("addModal").style.display = "none";
}

// SUBMIT ADD USER FORM
document.getElementById("addForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const newUser = {
    name: document.getElementById("addName").value,
    email: document.getElementById("addEmail").value,
    role: document.getElementById("addRole").value,
  };

  const res = await fetch("http://localhost:5000/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  if (res.ok) {
    closeAddModal();
    loadUsers();
  } else {
    alert("❌ Failed to add user");
  }
});

// EDIT USER
async function editUser(id) {
  try {
    const res = await fetch(`http://localhost:5000/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    
    const user = await res.json();
    
    // Populate form
    document.getElementById("editId").value = user._id;
    document.getElementById("editName").value = user.name;
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editRole").value = user.role;
    
    // Show modal
    document.getElementById("editModal").classList.add('show');
  } catch (err) {
    console.error("Error fetching user:", err);
    alert("Failed to load user data");
  }
}

// CLOSE EDIT MODAL - Updated Version
function closeEditModal() {
  document.getElementById("editModal").classList.remove('show');
}


// function closeEditModal() {
//   document.getElementById("editModal").style.display = "none";
// }

// SUBMIT EDIT FORM
// SUBMIT EDIT FORM - Updated Version
document.getElementById("editForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const updatedUser = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    role: document.getElementById("editRole").value,
  };

  try {
    const res = await fetch(`http://localhost:5000/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!res.ok) throw new Error('Update failed');
    
    closeEditModal();
    loadUsers();
    showMessage("User updated successfully!", "success");
  } catch (err) {
    console.error("Update error:", err);
    showMessage("Failed to update user", "error");
  }
});
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// DELETE USER
async function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }
}

// Load users on page load
loadUsers();





// //for product management
// document.getElementById("productForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const form = e.target;
//   const formData = {
//     name: form.name.value,
//     price: parseFloat(form.price.value),
//     description: form.description.value,
//     category: form.category.value,
//     stock: parseInt(form.stock.value),
//   };

//   try {
//     const res = await fetch("/api/products", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       document.getElementById("message").textContent = "Product added successfully!";
//       form.reset();
//     } else {
//       document.getElementById("message").textContent = data.error || "Failed to add product.";
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     document.getElementById("message").textContent = "Something went wrong.";
//   }
// });

// // Fetch and display products
// async function fetchProducts() {
//   try {
//     const res = await fetch("/api/products");
//     const products = await res.json();

//     const tbody = document.querySelector("#productTable tbody");
//     tbody.innerHTML = ""; // clear old data

//     products.forEach((product) => {
//       const row = document.createElement("tr");
//       row.innerHTML = `
//         <td>${product.name}</td>
//         <td>₹${product.price}</td>
//         <td>${product.category}</td>
//         <td>${product.stock}</td>
//         <td>
//           <button onclick="editProduct('${product._id}')">Edit</button>
//           <button onclick="deleteProduct('${product._id}')">Delete</button>
//         </td>
//       `;
//       tbody.appendChild(row);
//     });
//   } catch (error) {
//     console.error("Failed to fetch products", error);
//   }
// }

// fetchProducts();


// function editProduct(id) {
//   console.log("Edit Product", id);
//   // Will implement update logic here
// }

// async function deleteProduct(id) {
//   if (confirm("Are you sure you want to delete this product?")) {
//     try {
//       const res = await fetch(`/api/products/${id}`, {
//         method: "DELETE",
//       });
//       const result = await res.json();
//       alert(result.message || "Product deleted");
//       fetchProducts(); // refresh list
//     } catch (error) {
//       console.error("Delete failed", error);
//     }
//   }
// }
