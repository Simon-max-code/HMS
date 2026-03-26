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
let isListView = false;

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

// Confirm order (open checkout modal)
function confirmOrder() {
    if (orderItems.length === 0) return;
    
    // Open checkout modal
    openCheckout();
}

// Toggle between grid and list view
function toggleLayout() {
    isListView = !isListView;
    const grids = document.querySelectorAll('.product-grid');
    const toggleBtn = document.getElementById('layoutToggle');
    const layoutIcon = toggleBtn.querySelector('.layout-icon');
    
    grids.forEach(grid => {
        if (isListView) {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    });
    
    // Update icon
    if (isListView) {
        toggleBtn.classList.add('list-view');
        // when showing list view we switch icon to a grid symbol
        layoutIcon.textContent = '🔳';
    } else {
        toggleBtn.classList.remove('list-view');
        // default is grid representation
        layoutIcon.textContent = '☰';
    }
}

// Search products
function searchProducts(query) {
    query = query.toLowerCase().trim();
    const allCards = document.querySelectorAll('.product-card');
    
    allCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        
        if (productName.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide category sections based on visible products
    const categorySections = document.querySelectorAll('.category-section');
    categorySections.forEach(section => {
        const visibleCards = section.querySelectorAll('.product-card:not([style*="display: none"])');
        if (visibleCards.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCategoryTabs();
    console.log('QR Menu Template Loaded');
});
// Checkout Modal Functions

// Open checkout modal
function openCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    const checkoutItems = document.getElementById('checkoutItems');
    const ticketItems = document.getElementById('ticketItems');
    const ticketTotal = document.getElementById('ticketTotal');
    const ticketDate = document.getElementById('ticketDate');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutTicket = document.getElementById('checkoutTicket');
    
    // Check if cart is empty
    if (orderItems.length === 0) {
        emptyCartMessage.style.display = 'block';
        checkoutItems.style.display = 'none';
        checkoutTicket.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'none';
        checkoutItems.style.display = 'flex';
        checkoutTicket.style.display = 'block';
        
        // Clear previous items
        checkoutItems.innerHTML = '';
        ticketItems.innerHTML = '';
        
        // Add each item to checkout
        orderItems.forEach((item, index) => {
            // Order item card
            const itemCard = document.createElement('div');
            itemCard.className = 'order-item';
            itemCard.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₦${item.price.toFixed(2)}</div>
                </div>
                <button class="remove-item" onclick="removeFromCheckout(${index})">×</button>
            `;
            checkoutItems.appendChild(itemCard);
            
            // Ticket item
            const ticketRow = document.createElement('div');
            ticketRow.className = 'ticket-row';
            ticketRow.innerHTML = `
                <span>${item.name}</span>
                <span>₦${item.price.toFixed(2)}</span>
            `;
            ticketItems.appendChild(ticketRow);
        });
        
        // Update total
        ticketTotal.textContent = `₦${totalPrice.toFixed(2)}`;
        
        // Set date
        const now = new Date();
        // include time as well; use toLocaleString since date-only formatter ignores time options
        const dateStr = now.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        ticketDate.textContent = dateStr;
    }
    
    // Show overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    const successMessage = document.getElementById('successMessage');
    
    overlay.classList.remove('active');
    successMessage.style.display = 'none';
    document.body.style.overflow = '';
}

// Remove item from checkout
function removeFromCheckout(index) {
    // Remove from order
    const removedItem = orderItems.splice(index, 1)[0];
    totalPrice -= removedItem.price;
    
    // Update order modal
    updateOrderModal();
    
    // Refresh checkout
    openCheckout();
}

// Pay manually
function payManually() {
    if (orderItems.length === 0) return;
    
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    successMessage.textContent = 'Order confirmed! Please pay at the counter. 💵';
    
    setTimeout(() => {
        // Clear order
        orderItems = [];
        totalPrice = 0;
        updateOrderModal();
        closeCheckout();
    }, 2000);
}

// Pay online
function payOnline() {
    if (orderItems.length === 0) return;
    
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    successMessage.textContent = 'Redirecting to payment gateway... 💳';
    
    setTimeout(() => {
        // Simulate payment processing
        successMessage.textContent = 'Payment successful! Order confirmed. 🎉';
        
        setTimeout(() => {
            // Clear order
            orderItems = [];
            totalPrice = 0;
            updateOrderModal();
            closeCheckout();
        }, 2000);
    }, 1500);
}

// Close checkout when clicking outside
document.addEventListener('click', function(event) {
    const overlay = document.getElementById('checkoutOverlay');
    if (overlay && event.target === overlay) {
        closeCheckout();
    }
});