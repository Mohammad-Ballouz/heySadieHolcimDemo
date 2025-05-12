document.addEventListener('DOMContentLoaded', function() {
  // Global variables
  let orders = [];
  const toast = new bootstrap.Toast(document.getElementById('toast'));
  
  // Load all orders on page load
  loadOrders();
  
  // Refresh button event listener
  document.getElementById('refreshBtn').addEventListener('click', function() {
    // Add spinning animation to refresh icon
    const refreshIcon = this.querySelector('i');
    refreshIcon.classList.add('fa-spin');
    
    // Load orders and then remove the spinning animation
    loadOrders().finally(() => {
      setTimeout(() => {
        refreshIcon.classList.remove('fa-spin');
      }, 500);
    });
  });
  
  // Form submission event listener
  document.getElementById('editOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateOrder();
  });
  
  // Function to load all orders
  function loadOrders() {
    // Show loading indicator
    document.getElementById('orders-loading').classList.remove('d-none');
    document.getElementById('orders-empty').classList.add('d-none');
    document.getElementById('ordersContainer').innerHTML = '';
    
    return fetch('/api/orders')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        orders = data;
        updateOrdersCards(data);
        updateOrderCodeDropdown(data);
        updateOrderCount(data);
        
        // Hide loading indicator
        document.getElementById('orders-loading').classList.add('d-none');
      })
      .catch(error => {
        showToast('Error', `Failed to load orders: ${error.message}`, 'error');
        // Hide loading indicator
        document.getElementById('orders-loading').classList.add('d-none');
      });
  }
  
  // Function to update the order count
  function updateOrderCount(orders) {
    const activeOrders = orders.filter(order => order.cancel === 0).length;
    const orderCountEl = document.getElementById('orderCount');
    orderCountEl.textContent = `${activeOrders} Order${activeOrders !== 1 ? 's' : ''}`;
  }
  
  // Function to update the orders as cards
  function updateOrdersCards(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
      document.getElementById('orders-empty').classList.remove('d-none');
      return;
    }
    
    orders.forEach(order => {
      // Calculate remaining quantity
      const remainingQty = (order.ordrqy - order.ticketedQty).toFixed(2);
      const remainingPercentage = (order.ticketedQty / order.ordrqy * 100).toFixed(0);
      
      // Create status and delivery status classes for styling
      const statusClass = order.orderStatus.toLowerCase() === 'normal' ? 'status-normal' : 'status-delayed';
      
      let deliveryClass = 'delivery-awaiting';
      if (order.deliverystatus.toLowerCase().includes('transit')) {
        deliveryClass = 'delivery-in-transit';
      } else if (order.deliverystatus.toLowerCase().includes('delivered')) {
        deliveryClass = 'delivery-delivered';
      }
      
      // Create card element
      const cardCol = document.createElement('div');
      cardCol.className = 'col';
      
      // Add canceled class if order is canceled
      const cardClasses = ['order-card', 'h-100'];
      if (order.cancel === 1) {
        cardClasses.push('canceled-card');
      }
      
      // Set card ID for easy updating later
      cardCol.id = `order-${order.orderCode}`;
      
      cardCol.innerHTML = `
        <div class="${cardClasses.join(' ')}">
          <div class="card-header d-flex justify-content-between">
            <h5 class="mb-0 order-code">#${order.orderCode}</h5>
            <span class="${statusClass}">${order.orderStatus}</span>
          </div>
          <div class="card-body">
            <h6 class="customer-name">${order.customerName}</h6>
            <p class="project-name text-muted mb-3">${order.projectName}</p>
            
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="product-label"><i class="fas fa-box me-2"></i>Product:</span>
              <span class="product-value">${order.prddes1}</span>
            </div>
            
            <div class="quantity-info mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span><i class="fas fa-dolly me-2"></i>Ordered:</span>
                <span class="fw-bold">${order.ordrqy.toFixed(2)} m³</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span><i class="fas fa-truck me-2"></i>Delivered:</span>
                <span>${order.ticketedQty.toFixed(2)} m³</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span><i class="fas fa-flask me-2"></i>Remaining:</span>
                <span class="remaining-qty">${remainingQty} m³</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar" role="progressbar" style="width: ${remainingPercentage}%;" 
                  aria-valuenow="${remainingPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="text-end mt-1">
                <small class="text-muted">${remainingPercentage}% complete</small>
              </div>
            </div>
            
            <div class="delivery-info mt-3 pt-3 border-top">
              <div class="d-flex align-items-center">
                <i class="fas fa-shipping-fast me-2"></i>
                <span class="${deliveryClass}">${order.deliverystatus}</span>
              </div>
              <div class="mt-2 small">
                <i class="fas fa-map-marker-alt me-2"></i>${order.delvad}
              </div>
              <div class="mt-1 small">
                <i class="fas fa-building me-2"></i>${order.supplyQuarryList_Name}
              </div>
            </div>
          </div>
        </div>
      `;
      
      ordersContainer.appendChild(cardCol);
    });
  }
  
  // Function to update order codes dropdown
  function updateOrderCodeDropdown(orders) {
    const dropdown = document.getElementById('orderCode');
    
    // Clear existing options except the first one
    while (dropdown.options.length > 1) {
      dropdown.remove(1);
    }
    
    // Add order codes to dropdown
    orders.forEach(order => {
      // Skip canceled orders
      if (order.cancel === 1) return;
      
      const option = document.createElement('option');
      option.value = order.orderCode;
      option.text = `${order.orderCode} - ${order.customerName} (${order.projectName})`;
      dropdown.appendChild(option);
    });
  }
  
  // Function to update an order
  function updateOrder() {
    const form = document.getElementById('editOrderForm');
    const orderCode = parseInt(form.order_code.value);
    const requestType = form.request_type.value;
    const quantity = parseFloat(form.quantity.value);
    
    if (!orderCode || !requestType || !quantity) {
      showToast('Warning', 'Please fill in all fields.', 'warning');
      return;
    }
    
    const data = {
      call_id: `order_update_${Date.now()}`,
      arguments: {
        order_code: orderCode,
        request_type: requestType,
        quantity: quantity
      }
    };
    
    // Show loading state on button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Updating...';
    submitBtn.disabled = true;
    
    fetch('/api/orders/edit-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update order');
        });
      }
      return response.json();
    })
    .then(data => {
      // Extract message and updated order from response
      const message = data.result?.message || 'Order updated successfully';
      const updatedOrder = data.result?.order;
      
      showToast('Success', message, 'success');
      
      // Update local orders array if we have the updated order
      if (updatedOrder) {
        const index = orders.findIndex(order => order.orderCode === orderCode);
        if (index !== -1) {
          orders[index] = updatedOrder;
          
          // Update orders display with the new data
          updateOrdersCards(orders);
          
          // Highlight the updated card
          const card = document.getElementById(`order-${orderCode}`);
          if (card) {
            card.classList.add('highlight');
            setTimeout(() => {
              card.classList.remove('highlight');
            }, 2000);
          }
        }
      } else {
        // If we don't have the updated order, refresh the orders list
        loadOrders();
      }
      
      // Reset form
      form.reset();
    })
    .catch(error => {
      showToast('Error', error.message, 'error');
    })
    .finally(() => {
      // Restore button state
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    });
  }
  
  // Function to show toast notifications
  function showToast(title, message, type = 'info') {
    const toastEl = document.getElementById('toast');
    const toastHeader = document.getElementById('toastHeader');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set toast content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set toast header color based on type
    toastHeader.className = 'toast-header';
    
    // Remove any previous icon
    const previousIcon = toastHeader.querySelector('i');
    if (previousIcon) {
      previousIcon.classList.remove('fa-check-circle', 'fa-exclamation-circle', 'fa-exclamation-triangle', 'fa-info-circle');
    }
    
    // Add icon based on type
    if (type === 'success') {
      toastHeader.classList.add('bg-success', 'text-white');
      previousIcon.classList.add('fa-check-circle');
    } else if (type === 'error') {
      toastHeader.classList.add('bg-danger', 'text-white');
      previousIcon.classList.add('fa-exclamation-circle');
    } else if (type === 'warning') {
      toastHeader.classList.add('bg-warning', 'text-dark');
      previousIcon.classList.add('fa-exclamation-triangle');
    } else {
      toastHeader.classList.add('bg-info', 'text-white');
      previousIcon.classList.add('fa-info-circle');
    }
    
    // Show the toast
    const toastInstance = bootstrap.Toast.getInstance(toastEl);
    if (toastInstance) {
      toastInstance.dispose();
    }
    
    new bootstrap.Toast(toastEl).show();
  }
}); 