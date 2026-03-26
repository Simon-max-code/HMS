/* ═══════════════════════════════════════════════════════════
   HMS — QR Table Session Handler
   File: qr-session.js
   
   HOW TO USE:
     Add this ONE line to the bottom of order.html, before </body>:
     <script src="qr-session.js"></script>
   
   WHAT IT DOES:
     1. Reads ?table=N from the URL on page load
     2. Stores the table ID + session metadata in sessionStorage
     3. Blocks the order page if no valid table session exists
     4. Expires the session after 3 minutes of user inactivity
     5. Refreshes inactivity timer on every user interaction
   
   DOES NOT TOUCH:
     - Existing cart / order logic (addToOrder, confirmOrder, etc.)
     - HTML layout or CSS
     - customer.js behaviour
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────
  const CONFIG = {
    SESSION_KEY:      'hms_table_session',   // sessionStorage key
    INACTIVITY_MS:    3 * 60 * 1000,         // 3 minutes in ms
    SCAN_PAGE:        'scan.html',           // redirect if no QR (set null to just alert)
    VALID_TABLE_RANGE: { min: 1, max: 50 },  // connect to backend later — fetch real table count
  };

  // ── HELPERS ──────────────────────────────────────────────

  /** Read a query-string param from the current URL */
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /** Save session data to sessionStorage */
  function saveSession(tableId) {
    const session = {
      tableId:   tableId,
      startedAt: Date.now(),
      lastActive: Date.now(),
      // connect to backend later — also send POST /api/sessions/start { tableId }
      // store the returned sessionToken here for order submission
    };
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
    return session;
  }

  /** Load and parse session from sessionStorage */
  function loadSession() {
    try {
      const raw = sessionStorage.getItem(CONFIG.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Update lastActive timestamp (called on user activity) */
  function touchSession() {
    const session = loadSession();
    if (!session) return;
    session.lastActive = Date.now();
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
  }

  /** Clear the table session completely */
  function clearSession() {
    sessionStorage.removeItem(CONFIG.SESSION_KEY);
    // connect to backend later — POST /api/sessions/end { tableId, sessionToken }
  }

  /** Check whether a loaded session is still within the inactivity window */
  function isSessionExpired(session) {
    return (Date.now() - session.lastActive) > CONFIG.INACTIVITY_MS;
  }

  /** Validate that a table ID is a sane integer within range */
  function isValidTableId(raw) {
    const n = parseInt(raw, 10);
    return (
      !isNaN(n) &&
      String(n) === String(raw).trim() &&
      n >= CONFIG.VALID_TABLE_RANGE.min &&
      n <= CONFIG.VALID_TABLE_RANGE.max
    );
    // connect to backend later — also verify table exists via GET /api/tables/:id
  }

  // ── BLOCK OVERLAY ────────────────────────────────────────
  // Shown when the user arrives without a valid QR / session

  function showBlockOverlay(message) {
    // Don't double-inject
    if (document.getElementById('hms-qr-block')) return;

    const overlay = document.createElement('div');
    overlay.id = 'hms-qr-block';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:rgba(10,10,10,0.97)',
      'display:flex', 'flex-direction:column',
      'align-items:center', 'justify-content:center',
      'font-family:system-ui,sans-serif',
      'color:#fff', 'text-align:center', 'padding:32px',
    ].join(';');

    overlay.innerHTML = `
      <div style="font-size:56px;margin-bottom:16px">📷</div>
      <h2 style="font-size:22px;font-weight:700;margin-bottom:10px">Scan Your Table QR Code</h2>
      <p style="font-size:14px;color:rgba(255,255,255,0.55);max-width:280px;line-height:1.6">
        ${message}
      </p>
      <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.25)">
        Ask your waiter for assistance
      </p>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function removeBlockOverlay() {
    const el = document.getElementById('hms-qr-block');
    if (el) el.remove();
    document.body.style.overflow = '';
  }

  // ── EXPIRY TOAST ─────────────────────────────────────────
  // Non-blocking warning shown 30 seconds before session expires

  let expiryWarnShown = false;

  function showExpiryWarning() {
    if (expiryWarnShown) return;
    expiryWarnShown = true;

    const toast = document.createElement('div');
    toast.id = 'hms-expiry-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:100px', 'left:50%',
      'transform:translateX(-50%)',
      'background:#1a1a1a', 'color:#fff',
      'padding:12px 20px', 'border-radius:8px',
      'font-family:system-ui,sans-serif', 'font-size:13px',
      'font-weight:600', 'z-index:9999',
      'box-shadow:0 4px 20px rgba(0,0,0,0.3)',
      'max-width:90vw', 'text-align:center',
    ].join(';');

    toast.textContent = '⏱ Session expiring soon due to inactivity…';
    document.body.appendChild(toast);

    // Auto-remove after 8 seconds
    setTimeout(() => toast.remove(), 8000);
  }

  // ── SESSION EXPIRY WATCHER ────────────────────────────────

  let expiryInterval = null;

  function startExpiryWatcher() {
    if (expiryInterval) return;

    expiryInterval = setInterval(() => {
      const session = loadSession();
      if (!session) {
        handleExpiredSession();
        return;
      }

      const remaining = CONFIG.INACTIVITY_MS - (Date.now() - session.lastActive);

      // Warn at 30 seconds remaining
      if (remaining <= 30_000 && remaining > 0) {
        showExpiryWarning();
      }

      // Session expired
      if (remaining <= 0) {
        handleExpiredSession();
      }
    }, 5000); // check every 5 seconds
  }

  function stopExpiryWatcher() {
    clearInterval(expiryInterval);
    expiryInterval = null;
  }

  function handleExpiredSession() {
    stopExpiryWatcher();
    clearSession();

    // Block the page
    showBlockOverlay('Your session has expired due to inactivity. Please scan the QR code on your table to continue.');

    // connect to backend later — notify server that session ended
    // POST /api/sessions/expire { tableId }

    console.warn('[HMS] Table session expired due to inactivity.');
  }

  // ── ACTIVITY LISTENERS ────────────────────────────────────
  // Any real user interaction resets the inactivity clock

  const ACTIVITY_EVENTS = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'];

  const handleActivity = debounce(() => {
    touchSession();
    expiryWarnShown = false; // reset warning flag on activity
    const toast = document.getElementById('hms-expiry-toast');
    if (toast) toast.remove();
  }, 400);

  function attachActivityListeners() {
    ACTIVITY_EVENTS.forEach(ev =>
      document.addEventListener(ev, handleActivity, { passive: true })
    );
  }

  function detachActivityListeners() {
    ACTIVITY_EVENTS.forEach(ev =>
      document.removeEventListener(ev, handleActivity)
    );
  }

  // ── INJECT TABLE ID INTO PAGE ─────────────────────────────
  // Exposes the table ID to the rest of the page (e.g. for order submission)

  function applyTableIdToPage(tableId) {
    // 1. Set a readable global for other scripts to use
    window.HMS_TABLE_ID = tableId;

    // 2. Update any element with [data-table-id]
    document.querySelectorAll('[data-table-id]').forEach(el => {
      el.textContent = `Table ${tableId}`;
    });

    // 3. Update the <title>
    document.title = `Table ${tableId} — HMS Menu`;

    // 4. Update the header if present (non-breaking — only if element exists)
    const header = document.querySelector('.header h1');
    if (header && header.textContent.includes('LOGO')) {
      // Keep existing branding but append table number
      // Uncomment if you want the table shown in the header:
      // header.textContent += `  |  Table ${tableId}`;
    }

    // connect to backend later — you can also fetch table details here:
    // const tableInfo = await fetch(`/api/tables/${tableId}`).then(r => r.json());
    // use tableInfo.name, tableInfo.capacity, etc.
  }

  // ── MAIN INIT ─────────────────────────────────────────────

  function init() {
    const urlTableId = getQueryParam('table');

    // ── CASE 1: Fresh QR scan — ?table=N in URL ──────────
    if (urlTableId !== null) {
      if (!isValidTableId(urlTableId)) {
        showBlockOverlay(`The QR code is invalid (table "${urlTableId}" not recognised). Please ask your waiter for a valid QR code.`);
        console.error('[HMS] Invalid table ID in URL:', urlTableId);
        return;
      }

      const tableId = parseInt(urlTableId, 10);
      saveSession(tableId);

      // Clean the table param from the URL bar (cosmetic — no reload)
      const cleanUrl = window.location.pathname;
      history.replaceState(null, '', cleanUrl);

      console.info(`[HMS] QR session started — Table ${tableId}`);
      applyTableIdToPage(tableId);
      attachActivityListeners();
      startExpiryWatcher();
      removeBlockOverlay();
      return;
    }

    // ── CASE 2: No URL param — check for existing session ─
    const session = loadSession();

    if (session && !isSessionExpired(session)) {
      // Valid session still alive — resume normally
      console.info(`[HMS] Resuming session — Table ${session.tableId}`);
      applyTableIdToPage(session.tableId);
      attachActivityListeners();
      startExpiryWatcher();
      removeBlockOverlay();

      // connect to backend later — optionally re-validate session token:
      // fetch(`/api/sessions/verify`, { headers: { Authorization: `Bearer ${session.sessionToken}` } })
      return;
    }

    // ── CASE 3: No URL param, no valid session — block ────
    if (session && isSessionExpired(session)) {
      clearSession();
      console.warn('[HMS] Stale session cleared on load.');
    }

    // Block the page
    showBlockOverlay('To place an order, please scan the QR code on your table.');

    // Optional redirect instead of block:
    if (CONFIG.SCAN_PAGE) {
      // Uncomment to redirect to a "Please scan" page instead:
      // setTimeout(() => { window.location.href = CONFIG.SCAN_PAGE; }, 2000);
    }
  }

  // ── SIMPLE DEBOUNCE ───────────────────────────────────────
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ── PUBLIC API ────────────────────────────────────────────
  // Expose minimal surface for other scripts if needed
  window.HMS_QR = {
    getTableId: () => loadSession()?.tableId ?? null,
    clearSession,
    // connect to backend later — add getSessionToken(), refreshSession(), etc.
  };

  // ── BOOT ──────────────────────────────────────────────────
  // Run after DOM is ready so overlay injection works safely
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();