// admin-layout.js — Shared layout helpers
// connect to backend later

(function () {
  'use strict';

  /* ── Sidebar toggle ── */
  const sidebar = document.getElementById('adminSidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileMenuBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function collapseSidebar() {
    sidebar?.classList.toggle('collapsed');
    const isCollapsed = sidebar?.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
  }

  function toggleMobileSidebar() {
    sidebar?.classList.toggle('mobile-open');
  }

  function closeMobileSidebar() {
    sidebar?.classList.remove('mobile-open');
  }

  // Restore sidebar state
  if (localStorage.getItem('sidebarCollapsed') === '1' && window.innerWidth > 900) {
    sidebar?.classList.add('collapsed');
  }

  sidebarToggleBtn?.addEventListener('click', collapseSidebar);
  mobileToggleBtn?.addEventListener('click', toggleMobileSidebar);
  sidebarOverlay?.addEventListener('click', closeMobileSidebar);

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });

  /* ── Live clock in topbar ── */
  const dateEl = document.getElementById('topbarDate');
  function updateClock() {
    if (!dateEl) return;
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-NG', {
      weekday: 'short', month: 'short', day: 'numeric'
    }) + ' · ' + now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ── Generic Modal helpers (used by all pages) ── */
  window.AdminUI = {
    openModal(id) {
      const el = document.getElementById(id);
      if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
    },
    closeModal(id) {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
    },
    // Close modal on backdrop click
    initModalBackdrops() {
      document.querySelectorAll('.modal-backdrop').forEach(bd => {
        bd.addEventListener('click', e => {
          if (e.target === bd) AdminUI.closeModal(bd.id);
        });
      });
    },
    // Toast notification
    toast(msg, type = 'success') {
      const existing = document.getElementById('adminToast');
      if (existing) existing.remove();

      const t = document.createElement('div');
      t.id = 'adminToast';
      t.style.cssText = `
        position:fixed; bottom:28px; right:28px; z-index:9999;
        padding:12px 20px;
        background:${type === 'success' ? '#0a0a0a' : '#e63022'};
        color:#f5f4f0;
        border:2px solid ${type === 'success' ? '#2dce6a' : '#ff8a80'};
        border-radius:6px;
        font-family:'DM Mono',monospace;
        font-size:12px;
        box-shadow:4px 4px 0 ${type === 'success' ? '#2dce6a' : '#7a1010'};
        animation:toastIn 0.2s ease;
        max-width:320px;
      `;
      t.textContent = msg;

      const style = document.createElement('style');
      style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`;
      document.head.appendChild(style);
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    AdminUI.initModalBackdrops();
  });

})();