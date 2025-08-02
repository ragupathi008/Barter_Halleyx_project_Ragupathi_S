document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
    setupEventListeners();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
        document.querySelector("h1").textContent = `Welcome, ${user.name}!`;
    }

    updateCartCount();
});

let allProducts = [];
let currentPage = 1;
const productsPerPage = 8;
let currentSort = "popular";
let currentSearch = "";

async function loadProducts() {
    try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) throw new Error("Network response was not ok");

        allProducts = await response.json();
        updateResultsCount(allProducts.length);
        renderProducts(allProducts);
        setupPagination(allProducts.length);
    } catch (error) {
        console.error("Error loading products:", error);
        document.getElementById("productContainer").innerHTML =
            '<p class="error-message">Failed to load products. Please try again later.</p>';
    }
}

function renderProducts(products) {
    const container = document.getElementById("productContainer");
    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
        return;
    }

    const startIdx = (currentPage - 1) * productsPerPage;
    const paginatedProducts = products.slice(startIdx, startIdx + productsPerPage);

    paginatedProducts.forEach((product) => {
        const productCard = document.createElement("article");
        productCard.className = "product-card";

        const imageUrl = getProductImageUrl(product.imageUrl);

        let badgeHtml = "";
        if (product.isNew) {
            badgeHtml = `<div class="product-badge new-badge"><span>NEW</span></div>`;
        } else if (product.discount) {
            badgeHtml = `<div class="product-badge discount-badge"><span>${product.discount}% OFF</span></div>`;
        } else if (product.isPopular) {
            badgeHtml = `<div class="product-badge hot-badge"><span>HOT</span></div>`;
        }

        const ratingStars =
            "★".repeat(Math.round(product.rating || 0)) +
            "☆".repeat(5 - Math.round(product.rating || 0));

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='http://localhost:5000/uploads/default.png';this.onerror=null;">
                ${badgeHtml}
                <div class="product-actions">
                    <button class="action-button wishlist-btn" 
                            aria-label="Add to wishlist"
                            data-product-id="${product._id}">♥</button>
                    <button class="action-button primary-action cart-btn" 
                            aria-label="Add to cart"
                            data-product-id="${product._id}">Add to Cart</button>
                </div>
            </div>
            <div class="product-content">
                <div class="product-rating">
                    <span class="rating-stars">${ratingStars}</span>
                    <span class="rating-count">(${product.reviewCount || 0})</span>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || ""}</p>
                <div class="product-price">
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ""}
                    <span class="current-price">₹${product.price}</span>
                </div>
            </div>
        `;

        container.appendChild(productCard);
    });
}

// ✅ Image URL handler
function getProductImageUrl(imagePath) {
  if (!imagePath) return 'http://localhost:5000/uploads/default.png';

  // Always include uploads in the final URL
  const cleanedPath = imagePath.replace(/^\/?uploads\//, '');
  return `http://localhost:5000/uploads/${cleanedPath}`;
}


function sortProducts(products, sortMethod) {
    switch (sortMethod) {
        case "price-low":
            return [...products].sort((a, b) => a.price - b.price);
        case "price-high":
            return [...products].sort((a, b) => b.price - a.price);
        case "rating":
            return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case "newest":
            return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case "popular":
        default:
            return [...products].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
}

function filterProducts(products, searchTerm) {
    if (!searchTerm) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(
        (product) =>
            product.name.toLowerCase().includes(term) ||
            (product.description && product.description.toLowerCase().includes(term)) ||
            (product.category && product.category.toLowerCase().includes(term))
    );
}

function updateResultsCount(count) {
    const resultsEl = document.getElementById("resultsCount");
    if (resultsEl) resultsEl.textContent = count;
}

function setupPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const pagesContainer = document.getElementById("paginationPages");
    if (!pagesContainer) return;
    pagesContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `pagination-page ${i === currentPage ? "active" : ""}`;
        pageBtn.textContent = i.toString().padStart(2, "0");
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            updateDisplayedProducts();
        });
        pagesContainer.appendChild(pageBtn);
    }

    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function updateDisplayedProducts() {
    let filteredProducts = filterProducts(allProducts, currentSearch);
    filteredProducts = sortProducts(filteredProducts, currentSort);

    updateResultsCount(filteredProducts.length);
    renderProducts(filteredProducts);
    setupPagination(filteredProducts.length);
}

function setupEventListeners() {
    document.getElementById("searchBtn")?.addEventListener("click", () => {
        currentSearch = document.getElementById("searchInput").value.trim();
        currentPage = 1;
        updateDisplayedProducts();
    });

    document.getElementById("searchInput")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            currentSearch = document.getElementById("searchInput").value.trim();
            currentPage = 1;
            updateDisplayedProducts();
        }
    });

    document.getElementById("sortSelect")?.addEventListener("change", (e) => {
        currentSort = e.target.value;
        updateDisplayedProducts();
    });

    document.getElementById("prevPage")?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateDisplayedProducts();
        }
    });

    document.getElementById("nextPage")?.addEventListener("click", () => {
        const totalPages = Math.ceil(filterProducts(allProducts, currentSearch).length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateDisplayedProducts();
        }
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/client/public/user/login.html";
    });

    document.addEventListener("click", (e) => {
        if (e.target.closest(".cart-btn")) {
            const productId = e.target.closest(".cart-btn").dataset.productId;
            addToCart(productId);
        }

        if (e.target.closest(".wishlist-btn")) {
            const productId = e.target.closest(".wishlist-btn").dataset.productId;
            addToWishlist(productId);
        }
    });
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId,
            quantity: 1,
            addedAt: new Date().toISOString(),
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showNotification("Product added to cart!");
    updateCartCount();
}

function addToWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showNotification("Added to wishlist!");
    } else {
        showNotification("Already in your wishlist");
    }
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById("cartCount");
    if (badge) badge.textContent = count;
}
