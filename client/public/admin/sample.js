(() => {
    const state = {
        currentPage: 'products',
        metrics: {
            totalProducts: 1247,
            totalCustomers: 8942,
            orders: {
                pending: 24,
                processing: 18,
                shipped: 156
            }
        },
        user: {
            name: '${user.name}',
            role: 'Administrator'
        }
    };

    let context = null;
    let nodesToDestroy = [];
    let pendingUpdate = false;

    function destroyAnyNodes() {
        // destroy current view template refs before rendering again
        nodesToDestroy.forEach((el) => el.remove());
        nodesToDestroy = [];
    }

    // Function to update data bindings and loops
    // call update() when you mutate state and need the updates to reflect
    // in the dom
    function update() {
        if (pendingUpdate === true) {
            return;
        }
        pendingUpdate = true;

        // Update navigation active states
        updateNavigationState();

        // Update metrics display
        updateMetricsDisplay();

        destroyAnyNodes();
        pendingUpdate = false;
    }

    function updateNavigationState() {
        const navItems = document.querySelectorAll('.nav-item');
        const currentPage = window.location.pathname.split('/').pop() || 'admin-dashboard.html';

        navItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');

            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            }
        });
    }

    function updateMetricsDisplay() {
        // Update total products
        const productsValue = document.querySelector('.products-card .metric-value');
        if (productsValue) {
            productsValue.textContent = state.metrics.totalProducts.toLocaleString();
        }

        // Update total customers
        const customersValue = document.querySelector('.customers-card .metric-value');
        if (customersValue) {
            customersValue.textContent = state.metrics.totalCustomers.toLocaleString();
        }

        // Update orders breakdown
        const pendingValue = document.querySelector('.pending-value');
        const processingValue = document.querySelector('.processing-value');
        const shippedValue = document.querySelector('.shipped-value');

        if (pendingValue) pendingValue.textContent = state.metrics.orders.pending;
        if (processingValue) processingValue.textContent = state.metrics.orders.processing;
        if (shippedValue) shippedValue.textContent = state.metrics.orders.shipped;
    }

    function handleNavigation(event) {
        const href = event.currentTarget.getAttribute('href');

        if (href === 'login.html') {
            event.preventDefault();
            handleLogout();
            return;
        }

        // For metric card navigation, prevent default and handle internally
        if (event.currentTarget.classList.contains('metric-card')) {
            event.preventDefault();
            const cardType = event.currentTarget.classList.contains('products-card') ? 'admin-dashboard.html' :
                            event.currentTarget.classList.contains('customers-card') ? 'customers.html' : 'orders.html';

            window.location.href = cardType;
            return;
        }

        // Let normal navigation proceed for HTML pages
        // No preventDefault() - allow normal page navigation
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Redirect to login page
            window.location.href = 'login.html';
        }
    }

    function announcePageChange(page) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigated to ${page} section`;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    function handleMetricCardClick(event) {
        const card = event.currentTarget;
        const cardType = card.classList.contains('products-card') ? 'admin-dashboard.html' :
                        card.classList.contains('customers-card') ? 'customers.html' : 'orders.html';

        // Add visual feedback
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
            // Navigate to the corresponding page
            window.location.href = cardType;
        }, 150);

        console.log(`Navigating to ${cardType} from metric card`);
    }

    function addKeyboardSupport() {
        // Add keyboard navigation for metric cards
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleMetricCardClick(event);
                }
            });
        });

        // Add keyboard navigation for nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleNavigation(event);
                }
            });
        });
    }

    function simulateDataUpdates() {
        // Simulate real-time data updates
        setInterval(() => {
            // Randomly update metrics to simulate live data
            const shouldUpdate = Math.random() > 0.7; // 30% chance of update

            if (shouldUpdate) {
                const changeType = Math.random();

                if (changeType < 0.33) {
                    // Update products
                    state.metrics.totalProducts += Math.floor(Math.random() * 10) - 5;
                    state.metrics.totalProducts = Math.max(0, state.metrics.totalProducts);
                } else if (changeType < 0.66) {
                    // Update customers
                    state.metrics.totalCustomers += Math.floor(Math.random() * 20) - 10;
                    state.metrics.totalCustomers = Math.max(0, state.metrics.totalCustomers);
                } else {
                    // Update orders
                    const orderTypes = ['pending', 'processing', 'shipped'];
                    const randomType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
                    state.metrics.orders[randomType] += Math.floor(Math.random() * 5) - 2;
                    state.metrics.orders[randomType] = Math.max(0, state.metrics.orders[randomType]);
                }

                update();
            }
        }, 10000); // Update every 10 seconds
    }

    function initializeEventListeners() {
        // Navigation event listeners - only for logout
        const logoutLink = document.querySelector('.logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', handleNavigation);
        }

        // Metric card event listeners
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            card.addEventListener('click', handleMetricCardClick);
        });

        // Add hover effects for better UX
        metricCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    function addScreenReaderSupport() {
        // Add screen reader announcements for metric values
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            const title = card.querySelector('.metric-title').textContent;
            const value = card.querySelector('.metric-value')?.textContent || '';
            const change = card.querySelector('.change-positive')?.textContent || '';
            const period = card.querySelector('.change-period')?.textContent || '';

            let ariaLabel = `${title}: ${value}`;
            if (change && period) {
                ariaLabel += `, ${change} ${period}`;
            }

            card.setAttribute('aria-label', ariaLabel);
        });

        // Add aria-label for orders breakdown
        const ordersCard = document.querySelector('.orders-card');
        if (ordersCard) {
            const pending = document.querySelector('.pending-value').textContent;
            const processing = document.querySelector('.processing-value').textContent;
            const shipped = document.querySelector('.shipped-value').textContent;

            ordersCard.setAttribute('aria-label',
                `Orders: ${pending} pending, ${processing} processing, ${shipped} shipped`);
        }
    }

    // Initialize the application
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all functionality
        initializeEventListeners();
        addKeyboardSupport();
        addScreenReaderSupport();

        // Update with initial state
        update();

        // Start simulating data updates (optional - remove in production)
        // simulateDataUpdates();

        console.log('Admin Dashboard initialized successfully');
    }

    // Public API for external interaction
    window.AdminDashboard = {
        updateMetrics: (newMetrics) => {
            Object.assign(state.metrics, newMetrics);
            update();
        },

        navigateTo: (page) => {
            state.currentPage = page;
            update();
        },

        getCurrentPage: () => state.currentPage,

        getState: () => ({ ...state })
    };

    // Initialize the dashboard
    init();
})();

window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user._id) return;

  try {
    const res = await fetch(`http://localhost:5000/users/${user._id}`);
    const data = await res.json();

    // Update the state object
    if (window.AdminDashboard) {
      const state = window.AdminDashboard.getState();
      state.user.name = data.name || "User";
      state.user.role = data.role || "User";
    }

    // Update DOM
    const nameEl = document.getElementById("user-display-name");
    if (nameEl) nameEl.textContent = data.name || "User";

    const roleEl = document.getElementById("user-role");
    if (roleEl) roleEl.textContent = data.role || "User";

    const avatarEl = document.getElementById("user-avatar");
    if (avatarEl) {
      avatarEl.src = data.profileImage || "/src/assets/AR_logo.png";
    }

  } catch (err) {
    console.error("❌ Failed to fetch user info:", err);
  }
});

