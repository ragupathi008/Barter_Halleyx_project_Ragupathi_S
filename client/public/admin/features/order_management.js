document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize Socket.io connection
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });
    
    // Load user info
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) return;

    try {
      const res = await fetch(`http://localhost:5000/users/${user._id}`);
      const data = await res.json();
      document.getElementById("user-display-name").textContent = data.name || "User";
      const avatar = document.getElementById("user-profile-image");
      avatar.src = data.profileImage && data.profileImage !== ""
        ? data.profileImage
        : "/src/assets/AR_logo.png";
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }

    // Current orders state
    let orders = [];
    
    // Initial load
    await loadOrders();

    // Setup event listeners
    document.getElementById('orderSearch').addEventListener('input', debounce(loadOrders, 300));
    document.getElementById('statusFilter').addEventListener('change', loadOrders);
    
    // Table event delegation
    document.getElementById('ordersBody').addEventListener('click', handleTableActions);

    // Socket.io event listeners
    socket.on("new-order", handleNewOrder);
    socket.on("order-updated", handleOrderUpdated);
    socket.on("order-deleted", handleOrderDeleted);

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

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-orders">No orders found</td></tr>';
        return;
      }

      orders.forEach(order => {
        const row = document.createElement('tr');
        row.dataset.orderId = order._id;

        row.innerHTML = `
          <td data-label="Order ID">${order._id}</td>
          <td data-label="Customer">${order.customerName || order.email || 'N/A'}</td>
          <td data-label="Items">${
            Array.isArray(order.items)
              ? order.items.map(i => typeof i === 'string' ? i : `${i.name} (x${i.quantity})`).join(', ')
              : ''
          }</td>
          <td data-label="Total">₹${order.totalPrice || order.total}</td>
          <td data-label="Payment">${order.paymentMethod || 'N/A'}</td>
          <td data-label="Status">
            <select class="status-select">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td data-label="Placed At">${new Date(order.placedAt || order.createdAt).toLocaleString()}</td>
          <td data-label="Actions">
            <button class="btn-view">View</button>
            <button class="btn-delete">Delete</button>
          </td>
        `;

        tbody.appendChild(row);
      });
    }

    function handleTableActions(event) {
      if (event.target.classList.contains('status-select')) {
        updateOrderStatus(event);
      } else if (event.target.classList.contains('btn-view')) {
        viewOrder(event);
      } else if (event.target.classList.contains('btn-delete')) {
        deleteOrder(event);
      }
    }

    async function updateOrderStatus(event) {
      const select = event.target;
      const orderId = select.closest('tr').dataset.orderId;
      const newStatus = select.value;
      
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token") || ''}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update order status');
        
        const updatedOrder = await response.json();
        orders = orders.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        
        showNotification('Order status updated!', 'success');
        socket.emit('order-updated', updatedOrder);
      } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
        // Revert the select value
        const order = orders.find(o => o._id === orderId);
        if (order) select.value = order.status;
      }
    }

    async function deleteOrder(event) {
      const row = event.target.closest('tr');
      const orderId = row.dataset.orderId;
      
      if (!confirm('Are you sure you want to delete this order?')) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem("token") || ''}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to delete order');
        
        orders = orders.filter(o => o._id !== orderId);
        row.remove();
        
        showNotification('Order deleted successfully!', 'success');
        socket.emit('order-deleted', orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Failed to delete order', 'error');
      }
    }

    function viewOrder(event) {
      const orderId = event.target.closest('tr').dataset.orderId;
      const order = orders.find(o => o._id === orderId);
      
      if (!order) {
        showNotification('Order not found', 'error');
        return;
      }
      
      // Create and show modal with order details
      const modalHtml = `
        <div class="modal-overlay">
          <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Customer:</strong> ${order.customerName || order.email}</p>
              <p><strong>Date:</strong> ${new Date(order.placedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
              
              <h3>Items</h3>
              <ul class="order-items">
                ${order.items.map(item => `
                  <li>
                    ${item.name} - ₹${item.price.toFixed(2)} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      // Add event listener for modal close
      document.querySelector('.modal-overlay .modal-close').addEventListener('click', () => {
        document.querySelector('.modal-overlay').remove();
      });
    }

    function handleNewOrder(newOrder) {
      orders = [newOrder, ...orders];
      renderOrders(orders);
      showNotification('New order received!', 'success');
    }

    function handleOrderUpdated(updatedOrder) {
      orders = orders.map(o => o._id === updatedOrder._id ? updatedOrder : o);
      renderOrders(orders);
    }

    function handleOrderDeleted(deletedOrderId) {
      orders = orders.filter(o => o._id !== deletedOrderId);
      renderOrders(orders);
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