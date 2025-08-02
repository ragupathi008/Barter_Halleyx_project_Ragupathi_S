document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize Socket.io connection
    const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Force WebSocket if preferred
  withCredentials: true
});
    
    // Load user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name) {
      document.getElementById('user-display-name').textContent = user.name;
    }

    // Current orders state
    let orders = [];
    
    // Initial load
    await loadOrders();

    // Setup event listeners
    document.getElementById('orderSearch').addEventListener('input', debounce(loadOrders, 300));
    document.getElementById('statusFilter').addEventListener('change', loadOrders);

    // Socket.io event listeners
   // Socket.io event listeners
socket.on("new-order", handleNewOrder);  // ✅ this must match the emit in checkout
socket.on("order-updated", handleOrderUpdated);

   async function loadOrders() {
  try {
    const searchTerm = document.getElementById('orderSearch').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);

    const response = await fetch(`http://localhost:5000/api/orders?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    orders = await response.json();
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    showNotification('Failed to load orders. Please try again.', 'error');
  }
}
   function renderOrders(orders) {
  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = "";

  orders.forEach(order => {
    
    const itemsList = order.items.map(item => 
      `${item.name} (x${item.quantity})`).join("<br>");

   const row = document.createElement('tr');
          row.innerHTML = `
            <td data-label="Order ID">${order._id}</td>
            <td data-label="Customer Email">${order.email}</td>
            <td data-label="Items">${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
            <td data-label="Total">₹${order.total}</td>
            <td data-label="Payment">${order.paymentMethod}</td>
            <td data-label="Status">${order.status}</td>
            <td data-label="Placed At">${new Date(order.placedAt).toLocaleString()}</td>
            <td data-label="Actions">
              <button class="btn-view">View</button>
              <button class="btn-edit">Edit</button>
              <button class="btn-delete">Delete</button>
            </td>
          `;

    tbody.appendChild(row);
  });
}


    function handleNewOrder(newOrder) {
      // Update local orders state
      orders = [newOrder, ...orders];
      
      const tbody = document.getElementById('ordersBody');
      const noOrdersRow = tbody.querySelector('.no-orders');
      
      if (noOrdersRow) {
        tbody.innerHTML = '';
      }
      
      // Re-render with new order
      renderOrders(orders);
      showNotification('New order received!', 'success');
    }

    function handleOrderUpdated(updatedOrder) {
      // Update local orders state
      orders = orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      );
      
      const row = document.querySelector(`tr[data-order-id="${updatedOrder._id}"]`);
      if (row) {
        const statusSelect = row.querySelector('.status-select');
        if (statusSelect) statusSelect.value = updatedOrder.status;
      }
    }

    async function handleStatusChange(event) {
      if (!event.target.classList.contains('status-select')) return;
      
      const select = event.target;
      const orderId = select.closest('tr').dataset.orderId;
      const newStatus = select.value;
      
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update order');
        
        showNotification('Order status updated!', 'success');
      } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Failed to update order status', 'error');
        // Revert the select value
        select.value = orders.find(o => o._id === orderId).status;
      }
    }

    function handleViewButtonClick(event) {
      if (!event.target.classList.contains('btn-view')) return;
      
      const orderId = event.target.closest('tr').dataset.orderId;
      // Implement your view order logic here
      console.log('View order:', orderId);
      // window.location.href = `/orders/${orderId}`;
    }

    // Helper functions
    function formatOrderItems(items) {
      return items.map(i => `${i.name} (${i.quantity})`).join(', ');
    }

    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    }

    function debounce(func, delay) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }

  } catch (error) {
    console.error('Initialization error:', error);
    showNotification('Failed to initialize page', 'error');
  }
});