const API_URL = "http://localhost:5000/api/products";
let products = [];

// DOM Elements
const elements = {
  searchInput: document.getElementById("searchInput"),
  addProductBtn: document.getElementById("addProductBtn"),
  closeModal: document.getElementById("closeModal"),
  productForm: document.getElementById("productForm"),
  productTable: document.getElementById("productTable"),
  modalForm: document.getElementById("modalForm"),
  formTitle: document.getElementById("formTitle"),
   closeViewModal: document.getElementById("closeViewModal"),
  viewModal: document.getElementById("viewModal")
};

// Initialize the application
function init() {
  loadProducts();
  setupEventListeners();
  initModals();
}

// Set up all event listeners
function setupEventListeners() {
  elements.searchInput.addEventListener("input", filterProducts);
  elements.addProductBtn.addEventListener("click", openAddForm);
  elements.closeModal.addEventListener("click", closeForm);
  elements.productForm.addEventListener("submit", submitForm);
}

// Filter products based on search input
function filterProducts() {
  const term = elements.searchInput.value.toLowerCase();
  const filtered = products.filter(p => 
    String(p.name).toLowerCase().includes(term) ||
    String(p.category).toLowerCase().includes(term) ||
    String(p.description).toLowerCase().includes(term)
  );
  renderTable(filtered);
}

// Load products from API
async function loadProducts() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
      }
    });
    
    if (!res.ok) throw new Error("Failed to load products");
    
    products = await res.json();
    renderTable(products);
  } catch (err) {
    console.error("Load error:", err);
    alert("Failed to load products");
  }
}

// Render products table
// Update renderTable to include view button
function renderTable(data) {
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";

  data.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>₹${p.price.toFixed(2)}</td>
      <td>${p.category}</td>
      <td>${p.stock}</td>
      <td>${p.description ? p.description.substring(0, 30) + (p.description.length > 30 ? "..." : "") : "-"}</td>
      <td>
        <button class="btn-view" onclick="viewProduct('${p._id}')">View</button>
        <button class="btn-edit" onclick="editProduct('${p._id}')">Edit</button>
        <button class="btn-delete" onclick="deleteProduct('${p._id}')">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Form handling functions
function openAddForm() {
  elements.productForm.reset();
  elements.productForm.removeAttribute("data-id");
  elements.formTitle.textContent = "Add Product";
  elements.modalForm.classList.remove("hidden");
}

function closeForm() {
  elements.productForm.reset();
  elements.productForm.removeAttribute("data-id");
  elements.modalForm.classList.add("hidden");
}

// Global functions for button clicks
window.editProduct = function(id) {
  const product = products.find(p => p._id === id);
  if (!product) return;

  const form = elements.productForm;
  form.elements["name"].value = product.name;
  form.elements["price"].value = product.price;
  form.elements["category"].value = product.category;
  form.elements["stock"].value = product.stock;
  form.elements["description"].value = product.description || "";
  
  form.dataset.id = product._id;
  elements.formTitle.textContent = "Edit Product";
  elements.modalForm.classList.remove("hidden");
};

window.deleteProduct = async function(id) {
  if (!confirm("Are you sure?")) return;
  
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
      }
    });
    
    if (!res.ok) throw new Error("Delete failed");
    
    await loadProducts();
    alert("Product deleted");
  } catch (err) {
    console.error("Delete error:", err);
    alert("Delete failed");
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Handle form submission for both adding and updating products
async function submitForm(e) {
  e.preventDefault();
  
  const form = e.target;
  const isEditMode = form.dataset.id;

  // Create FormData (instead of plain JSON)
  const formData = new FormData(form); // Automatically captures all form fields, including files

  // Manually append other fields if needed (if not automatically included)
  // formData.append("name", form.elements["name"].value.trim());
  // formData.append("price", parseFloat(form.elements["price"].value));
  // formData.append("category", form.elements["category"].value.trim());
  // formData.append("stock", parseInt(form.elements["stock"].value, 10));
  // formData.append("description", form.elements["description"].value.trim());

  // Validate form data (basic check)
  if (!formData.get("name") || isNaN(formData.get("price")) || !formData.get("category") || isNaN(formData.get("stock"))) {
    showMessage("❌ Please fill all required fields correctly.", "error");
    return;
  }

  try {
    const url = isEditMode ? `${API_URL}/${form.dataset.id}` : API_URL;
    const method = isEditMode ? "PUT" : "POST";

    const token = localStorage.getItem("token") || '';
    if (!token && API_URL !== "http://localhost:5000/api/products") {
      showMessage("❌ Authentication required", "error");
      return;
    }

    // Send as FormData (NOT JSON)
    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        // Do NOT set Content-Type manually (let the browser set it with boundary)
      },
      body: formData, // Send FormData instead of JSON
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save product");
    }

    const result = await response.json();
    showMessage(`✅ Product ${isEditMode ? 'updated' : 'added'} successfully!`, "success");
    
    await loadProducts();
    closeForm();
  } catch (error) {
    console.error("Save error:", error);
    showMessage(`❌ ${error.message}`, "error");
  }
}

// Helper function to show status messages
function showMessage(message, type) {
  const messageElement = document.getElementById("message");
  messageElement.textContent = message;
  messageElement.className = type; // 'success' or 'error'
  
  // Auto-hide success messages after 3 seconds
  if (type === "success") {
    setTimeout(() => {
      messageElement.textContent = "";
      messageElement.className = "";
    }, 3000);
  }
}



// Add this CSS for message styling
/*
#message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}
#message.success {
  background-color: #d4edda;
  color: #155724;
}
#message.error {
  background-color: #f8d7da;
  color: #721c24;
}
*/


// View Product Functionality
window.viewProduct = function(id) {
  const product = products.find(p => p._id === id);
  if (!product) {
    showMessage("Product not found", "error");
    return;
  }

  // Populate modal with product data
  document.getElementById("viewProductName").textContent = product.name;
  document.getElementById("viewProductPrice").textContent = `₹${product.price.toFixed(2)}`;
  document.getElementById("viewProductCategory").textContent = product.category;
  document.getElementById("viewProductStock").textContent = product.stock;
  document.getElementById("viewProductDescription").textContent = product.description || "No description available";
  
  // Handle image display - IMPORTANT CHANGE HERE
  const imgElement = document.getElementById("viewProductImage");
  if (product.imageUrl) {
    // Use your API server's URL (port 5000) instead of frontend server
    imgElement.src = `http://localhost:5000${product.imageUrl}`;
    imgElement.onerror = () => {
      imgElement.style.display = "none";
      console.error("Image failed to load:", imgElement.src);
    };
    imgElement.style.display = "block";
  } else {
    imgElement.style.display = "none";
  }

  document.getElementById("viewModal").classList.remove("hidden");
};

// Make closeViewModal globally available
// window.closeViewModal = function() {
//   document.getElementById("viewModal").classList.add("hidden");
// };


// Initialize all modal handlers
function initModals() {
  // Set up view modal close button
  elements.closeViewModal?.addEventListener("click", closeViewModal);
  
  // Optional: Close when clicking outside modal
  elements.viewModal?.addEventListener("click", function(e) {
    if (e.target === this) {
      closeViewModal();
    }
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !elements.viewModal.classList.contains('hidden')) {
    closeViewModal();
  }
});

function closeViewModal() {
  elements.viewModal.classList.add("hidden");
  // Return focus to the view button that opened the modal
  document.activeElement.blur();
}


