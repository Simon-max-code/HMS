
// JavaScript - script.js

// Order state
let orderItems = [];
let totalPrice = 0;

// Category tabs configuration for each main section
const categoryTabs = {
    dishes: [
        { id: 'cat-main-courses', label: 'Main', icon: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' },
        { id: 'cat-soups', label: 'Soups', icon: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100' },
        { id: 'cat-local', label: 'Local', icon: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100' },
        { id: 'cat-salads', label: 'Salads', icon: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=100' }
    ],
    drinks: [
        { id: 'cat-cocktails', label: 'Cocktails', icon: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100' },
        { id: 'cat-coffee-tea', label: 'Coffee', icon: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100' },
        { id: 'cat-soft-drinks', label: 'Soft', icon: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=100' },
        { id: 'cat-beer', label: 'Beer', icon: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100' },
        { id: 'cat-whiskey', label: 'whiskey', icon: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100' },
        { id: 'cat-juices', label: 'Juices', icon: 'https://images.unsplash.com/photo-1597318167272-600e9a20b637?w=100' }
    ],
    assortments: [
        { id: 'cat-platters', label: 'Platters', icon: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100' },
        { id: 'cat-tapas', label: 'Tapas', icon: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=100' },
        { id: 'cat-fish', label: 'Fish', icon: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=100' },
        { id: 'cat-meat', label: 'Meat', icon: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=100' }
    ],
    sidedishes: [
        { id: 'cat-fries', label: 'Fries', icon: 'https://images.unsplash.com/photo-1573053986275-840ffc7cc685?w=100' },
        { id: 'cat-wraps', label: 'Wraps', icon: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=100' },
        { id: 'cat-rice', label: 'Rice', icon: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=100' },
        { id: 'cat-bread', label: 'Bread', icon: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=100' },
        { id: 'cat-pepper-soup', label: 'pepper Soups', icon: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100' },
        { id: 'cat-vegetables', label: 'Veggies', icon: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100' }
    ]
};

// Current active main tab
let currentMainTab = 'dishes';

// Initialize category tabs
function initializeCategoryTabs() {
    updateCategoryTabs(currentMainTab);
}

// Update category tabs based on active main section
function updateCategoryTabs(mainTab) {
    const tabsContainer = document.getElementById('categoryTabs');
    const tabs = categoryTabs[mainTab] || [];
    
    // Clear existing tabs
    tabsContainer.innerHTML = '';
    
    // Create new tabs with icons
    tabs.forEach((tab, index) => {
        const button = document.createElement('button');
        button.className = 'category-tab' + (index === 0 ? ' active' : '');
        
        // Create icon image
        const icon = document.createElement('img');
        icon.className = 'category-tab-icon';
        icon.src = tab.icon;
        icon.alt = tab.label;
        
        // Create label
        const label = document.createElement('span');
        label.className = 'category-tab-label';
        label.textContent = tab.label;
        
        button.appendChild(icon);
        button.appendChild(label);
        button.onclick = () => scrollToCategory(tab.id, button);
        tabsContainer.appendChild(button);
    });
}

// Scroll to specific category
function scrollToCategory(categoryId, buttonElement) {
    const categorySection = document.getElementById(categoryId);
    if (categorySection) {
        categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update active state
        document.querySelectorAll('.category-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');
    }
}

// Switch between main menu tabs
function switchTab(tabId, element) {
    // Remove active class from all sections and nav items
    const sections = document.querySelectorAll('.menu-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    sections.forEach(section => section.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to selected section and nav item
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
    
    // Update category tabs
    currentMainTab = tabId;
    updateCategoryTabs(tabId);
    
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        totalPriceEl.textContent = `₦${totalPrice.toFixed(2)}`;
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