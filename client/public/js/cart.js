// client/public/user/cart.js

document.addEventListener("DOMContentLoaded", async () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const tbody = document.getElementById("cartBody");
  const totalEl = document.getElementById("totalPrice");

  if (cart.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>Your cart is empty.</td></tr>";
    return;
  }

  const res = await fetch("http://localhost:5000/api/products");
  const products = await res.json();

  let total = 0;
  tbody.innerHTML = "";

  cart.forEach((item, index) => {
    const product = products.find(p => p._id === item.productId);
    if (!product) return;

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td><img src="http://localhost:5000${product.imageUrl}" width="60" /></td>
      <td>${product.name}</td>
      <td>
        <button onclick="updateQuantity(${index}, -1)">➖</button>
        ${item.quantity}
        <button onclick="updateQuantity(${index}, 1)">➕</button>
      </td>
      <td>₹${itemTotal}</td>
      <td><button onclick="removeFromCart(${index})">remove</button></td>
    `;

    tbody.appendChild(row);
  });

  totalEl.innerText = `₹${total}`;
});

function updateQuantity(index, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart[index]) return;

  cart[index].quantity += delta;

  if (cart[index].quantity < 1) {
    // Optional: remove item if quantity goes below 1
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

function getSelectedPaymentMethod() {
  const radios = document.getElementsByName("payment");
  for (let radio of radios) {
    if (radio.checked) return radio.value;
  }
  return "Cash on Delivery";
}

const socket = io("http://localhost:5000");

async function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return alert("🛒 Your cart is empty!");

  const paymentMethod = getSelectedPaymentMethod(); // e.g., "Cash on Delivery"

  try {
    const res = await fetch("http://localhost:5000/api/products");
    const allProducts = await res.json();

    const orderItems = cart.map(item => {
      const product = allProducts.find(p => p._id === item.productId);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      customerName: "Guest", // ✅ fixed default name, no prompt
      items: orderItems,
      total,
      paymentMethod,
      status: "Pending",
      placedAt: new Date().toISOString()
    };

    // Emit to server (real-time)
    socket.emit("new-order", orderData);

    alert("✅ Order placed successfully!");
    localStorage.removeItem("cart");
    window.location.href = "/client/public/user/dashboard.html";

  } catch (err) {
    console.error("Checkout error:", err);
    alert("❌ Failed to place order.");
  }
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  // Redirect to checkout with cart info in localStorage
  window.location.href = "checkout.html";
});
function getCartItems() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function renderCart() {
  const cartBody = document.getElementById("cartBody");
  const totalPriceElem = document.getElementById("totalPrice");
  const cart = getCartItems();

  let total = 0;
  cartBody.innerHTML = "";

  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
      <td><button onclick="removeFromCart(${index})">❌</button></td>
    `;
    cartBody.appendChild(row);
    total += item.price * item.quantity;
  });

  totalPriceElem.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  const cart = getCartItems();
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function checkout() {
  const cart = getCartItems();
  if (cart.length === 0) {
    alert("🛒 Cart is empty!");
    return;
  }

  // Create form dynamically
  const formHtml = `
    <div id="checkoutForm" class="checkout-form">
      <h3>Enter Your Details</h3>
      <label>Name: <input type="text" id="custName" required></label><br>
      <label>Email: <input type="email" id="custEmail" required></label><br>
      <button onclick="submitOrder()">Confirm Order</button>
      <button onclick="document.getElementById('checkoutForm').remove()">Cancel</button>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", formHtml);
}

async function submitOrder() {
  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
  const cart = getCartItems();

  if (!name || !email || !paymentMethod) {
    alert("❗ Please fill in all fields.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderData = {
    email,
    items: cart,
    total,
    paymentMethod
  };

  try {
    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) throw new Error("Order submission failed");

    alert("✅ Order placed successfully!");
    localStorage.removeItem("cart");
    window.location.href = "/client/public/user/cart.html"; // or success page
  } catch (err) {
    console.error("Error:", err);
    alert("❌ Could not place order.");
  }
}

renderCart(); // Initial render
