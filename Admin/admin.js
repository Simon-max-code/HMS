/* ═══════════════════════════════════════════════════════
   HMS ADMIN — Shared JavaScript
   Handles: sidebar toggle, active nav, clock, dropdown,
            notifications, page-meta, shared utilities
   ═══════════════════════════════════════════════════════ */

// ── PAGE META MAP ──────────────────────────────────────
// Maps data-page → { title, breadcrumb }
// connect to backend later for dynamic page titles
const PAGE_META = {
    dashboard:    { title: 'Dashboard',        breadcrumb: 'Overview & analytics' },
    products:     { title: 'Products',         breadcrumb: 'Manage menu items' },
    orders:       { title: 'Orders',           breadcrumb: 'Track incoming orders' },
    transactions: { title: 'Transactions',     breadcrumb: 'Payment records' },
    staff:        { title: 'Staff',            breadcrumb: 'Manage your team' },
    attendance:   { title: 'Attendance',       breadcrumb: 'Check-in / Check-out logs' },
    tables:       { title: 'Tables & QR Codes',breadcrumb: 'Venue table management' },
    reviews:      { title: 'Reviews',          breadcrumb: 'Customer feedback' },
    profile:      { title: 'Profile',          breadcrumb: 'Your account' },
    settings:     { title: 'Settings',         breadcrumb: 'System preferences' },
};

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initActiveNav();
    initSidebarToggle();
    initProfileDropdown();
    initClock();
    initPageMeta();
    initNotifPanel();
});

// ── ACTIVE NAV ─────────────────────────────────────────
// Reads `data-page` on <body> and highlights the matching sidebar link
function initActiveNav() {
    const currentPage = document.body.getAttribute('data-page') || 'dashboard';

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ── PAGE META (title + breadcrumb) ────────────────────
function initPageMeta() {
    const currentPage = document.body.getAttribute('data-page') || 'dashboard';
    const meta = PAGE_META[currentPage];
    if (!meta) return;

    const titleEl      = document.getElementById('pageTitle');
    const breadcrumbEl = document.getElementById('pageBreadcrumb');

    if (titleEl)      titleEl.textContent      = meta.title;
    if (breadcrumbEl) breadcrumbEl.textContent  = meta.breadcrumb;

    // Also update browser tab
    document.title = `HMS Admin — ${meta.title}`;
}

// ── SIDEBAR TOGGLE (mobile & desktop collapse) ────────
function initSidebarToggle() {
    // Support both old (#sidebar) and new (#adminSidebar) IDs
    const sidebar = document.getElementById('sidebar') || document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    // Support both old (#menuToggle) and new (#mobileMenuBtn) IDs
    const menuToggle = document.getElementById('menuToggle') || document.getElementById('mobileMenuBtn');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');

    // Desktop Collapse Logic
    function toggleCollapse() {
        sidebar?.classList.toggle('collapsed');
        const isCollapsed = sidebar?.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
    }

    // Mobile Drawer Logic
    function openSidebar() {
        sidebar?.classList.add('open');
        sidebar?.classList.add('mobile-open'); // Support both class names
        overlay?.classList.add('visible');
        menuToggle?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar?.classList.remove('open');
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('visible');
        menuToggle?.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Restore collapse state on load
    if (localStorage.getItem('sidebarCollapsed') === '1' && window.innerWidth > 900) {
        sidebar?.classList.add('collapsed');
    }

    menuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sidebar?.classList.contains('open') || sidebar?.classList.contains('mobile-open');
        isOpen ? closeSidebar() : openSidebar();
    });

    sidebarToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCollapse();
    });

    sidebarClose?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    // Close sidebar on nav link click (mobile UX)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) closeSidebar();
        });
    });
}

// ── PROFILE DROPDOWN ──────────────────────────────────
function initProfileDropdown() {
    const toggle   = document.getElementById('profileDropdownToggle');
    const dropdown = document.getElementById('profileDropdown');

    toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        dropdown?.classList.remove('open');
    });
}

// ── LIVE CLOCK ────────────────────────────────────────
function initClock() {
    const el = document.getElementById('topbarClock');
    if (!el) return;

    function tick() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
    }

    tick();
    setInterval(tick, 1000);
}

// ── NOTIFICATIONS ─────────────────────────────────────
function initNotifPanel() {
    // Update notification dot visibility based on unread count
    const unreadItems = document.querySelectorAll('.notif-item.unread');
    const notifDot    = document.querySelector('.notif-dot');
    if (notifDot) {
        notifDot.style.display = unreadItems.length > 0 ? 'block' : 'none';
    }
}

function clearNotifications() {
    // Mark all as read
    document.querySelectorAll('.notif-item.unread').forEach(item => {
        item.classList.remove('unread');
    });

    // Hide the dot
    const notifDot = document.querySelector('.notif-dot');
    if (notifDot) notifDot.style.display = 'none';

    // connect to backend later — mark notifications read via API
}

// ── LOGOUT ────────────────────────────────────────────
function handleLogout() {
    // connect to backend later — clear session/token
    if (confirm('Are you sure you want to logout?')) {
        // Simulate logout
        window.location.href = 'index.html';
    }
}

// ═══════════════════════════════════════════════════════
//  SHARED UTILITIES (available to all page scripts)
// ═══════════════════════════════════════════════════════

// Format Naira currency
function formatNaira(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Format date
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', {
        day:   '2-digit',
        month: 'short',
        year:  'numeric'
    });
}

// Format time
function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-NG', {
        hour:   '2-digit',
        minute: '2-digit'
    });
}

// Time ago string
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
}

// Open a modal by ID
function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close a modal by ID
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('open');
    document.body.style.overflow = '';
}

// Close modals when clicking the overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Show a toast notification
function showToast(message, type = 'default') {
    // Remove existing
    document.querySelectorAll('.admin-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.textContent = message;

    // Inline styles for self-contained toast
    Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '24px',
        right:        '24px',
        background:   type === 'success' ? '#0a0a0a' : type === 'error' ? '#c0392b' : '#0a0a0a',
        color:        '#ffffff',
        padding:      '12px 18px',
        borderRadius: '8px',
        fontSize:     '13px',
        fontFamily:   'Syne, sans-serif',
        fontWeight:   '600',
        boxShadow:    '0 4px 20px rgba(0,0,0,0.2)',
        zIndex:       '9999',
        transform:    'translateY(10px)',
        opacity:      '0',
        transition:   'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        maxWidth:     '300px',
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity   = '1';
    });

    // Animate out
    setTimeout(() => {
        toast.style.transform = 'translateY(10px)';
        toast.style.opacity   = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Debounce utility
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ── MOCK DATA (shared reference) ──────────────────────
// connect to backend later — replace with API calls

const MOCK_STAFF = [
    { id: 'S001', name: 'Chidi Okonkwo',  role: 'Waiter',    status: 'active' },
    { id: 'S002', name: 'Amaka Eze',      role: 'Bartender', status: 'active' },
    { id: 'S003', name: 'Emeka Nwosu',    role: 'Chef',      status: 'active' },
    { id: 'S004', name: 'Ngozi Adaobi',   role: 'Cashier',   status: 'inactive' },
    { id: 'S005', name: 'Uche Obi',       role: 'Manager',   status: 'active' },
    { id: 'S006', name: 'Ifunanya Mba',   role: 'Waiter',    status: 'active' },
];

const MOCK_ORDERS = [
    { id: '#ORD-0248', table: 'Table 4', items: 'Jollof Rice, Coke × 2',        total: 2597, status: 'pending',  time: '2 min ago' },
    { id: '#ORD-0247', table: 'Table 7', items: 'Grilled Fish, Craft Beer',      total: 2999, status: 'pending',  time: '5 min ago' },
    { id: '#ORD-0246', table: 'Table 2', items: 'Pepper Soup, Mojito',           total: 2499, status: 'served',   time: '18 min ago' },
    { id: '#ORD-0245', table: 'Table 9', items: 'Nkwobi, Goat Meat × 2',        total: 598,  status: 'served',   time: '32 min ago' },
    { id: '#ORD-0244', table: 'Table 1', items: 'Pasta Carbonara, Espresso',     total: 1698, status: 'served',   time: '45 min ago' },
    { id: '#ORD-0243', table: 'Table 6', items: 'Cheese Platter, Beverages',     total: 3498, status: 'pending',  time: '1 hr ago' },
];

const MOCK_TABLES = [
    { number: 1,  capacity: 2, status: 'available' },
    { number: 2,  capacity: 4, status: 'occupied'  },
    { number: 3,  capacity: 4, status: 'available' },
    { number: 4,  capacity: 6, status: 'occupied'  },
    { number: 5,  capacity: 2, status: 'available' },
    { number: 6,  capacity: 8, status: 'occupied'  },
    { number: 7,  capacity: 4, status: 'occupied'  },
    { number: 8,  capacity: 4, status: 'available' },
    { number: 9,  capacity: 6, status: 'occupied'  },
    { number: 10, capacity: 2, status: 'available' },
    { number: 11, capacity: 4, status: 'occupied'  },
    { number: 12, capacity: 8, status: 'available' },
];