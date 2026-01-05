// JavaScript - script.js

// Order state
let orderItems = [];
let totalPrice = 0;

// Switch between menu tabs
function switchTab(tabId, element) {
    // Remove active class from all sections and nav items
    const sections = document.querySelectorAll('.menu-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    sections.forEach(section => section.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to selected section and nav item
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// Add item to order
function addToOrder(button, itemName, price) {
    // Visual feedback
    button.classList.add('added');
    button.textContent = 'Added';
    
    // Reset button after animation
    setTimeout(() => {
        button.classList.remove('added');
        button.textContent = 'Order';
    }, 1000);
    
    // Add to order array
    orderItems.push({
        name: itemName,
        price: price
    });
    
    // Update total price
    totalPrice += price;
    
    // Show and update modal
    updateOrderModal();
}

// Update order modal display
function updateOrderModal() {
    const modal = document.getElementById('orderModal');
    const itemCount = document.querySelector('.item-count');
    const totalPriceEl = document.querySelector('.total-price');
    
    if (orderItems.length > 0) {
        modal.classList.add('show');
        itemCount.textContent = `${orderItems.length} ${orderItems.length === 1 ? 'item' : 'items'}`;
        totalPriceEl.textContent = `${totalPrice.toFixed(2)}`;
    } else {
        modal.classList.remove('show');
    }
}

// Confirm order (mock functionality)
function confirmOrder() {
    if (orderItems.length === 0) return;
    
    // Mock confirmation animation
    const modal = document.getElementById('orderModal');
    const confirmBtn = document.querySelector('.confirm-btn');
    
    confirmBtn.textContent = 'Order Placed!';
    confirmBtn.style.background = '#4CAF50';
    confirmBtn.style.color = '#ffffff';
    
    setTimeout(() => {
        // Reset everything
        orderItems = [];
        totalPrice = 0;
        modal.classList.remove('show');
        
        setTimeout(() => {
            confirmBtn.textContent = 'Confirm Order';
            confirmBtn.style.background = '#ffffff';
            confirmBtn.style.color = '#000000';
        }, 300);
    }, 1500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('QR Menu Template Loaded');
});