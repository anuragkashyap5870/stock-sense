// ==========================================
// StockSense - Odoo Hackathon Front-end Logic
// ==========================================

let currentUser = null;
let currentProducts = [];
let currentReceiptDetail = null;
let currentDeliveryDetail = null;
let activeReceiptViewMode = 'list';
let activeDeliveryViewMode = 'list';

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupLiveClock();
  setupFormListeners();
});

function setupLiveClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.innerHTML = `<i class="fa-regular fa-clock"></i> <span>${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`;
  };
  update();
  setInterval(update, 1000);
}

// --- Theme Toggle ---
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const icon = document.querySelector("#theme-toggle-btn i");
  if (document.body.classList.contains("dark-theme")) {
    icon.className = "fa-solid fa-sun";
  } else {
    icon.className = "fa-solid fa-moon";
  }
}

// --- Authentication ---
async function checkAuth() {
  try {
    const res = await fetch("/api/me");
    const data = await res.json();
    if (data.authenticated) {
      currentUser = data.user;
      showAppView();
    } else {
      showAuthView();
    }
  } catch (err) {
    showAuthView();
  }
}

function showAuthView() {
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("app-container").classList.add("hidden");
}

function showAppView() {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  
  if (currentUser) {
    document.getElementById("user-display-name").textContent = currentUser.full_name || currentUser.login_id;
    document.getElementById("user-display-email").textContent = currentUser.email || "";
    document.getElementById("user-avatar-initial").textContent = (currentUser.full_name || currentUser.login_id).charAt(0).toUpperCase();
  }

  loadInitialData();
  navigateTo("dashboard");
}

function switchAuthView(view, e) {
  if (e) e.preventDefault();
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  document.getElementById("login-alert").classList.add("hidden");
  document.getElementById("signup-alert").classList.add("hidden");

  if (view === "signup") {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");
  } else {
    signupForm.classList.remove("active");
    loginForm.classList.add("active");
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

function openForgotPasswordModal(e) {
  if (e) e.preventDefault();
  const alertBox = document.getElementById("reset-alert-box");
  if (alertBox) alertBox.classList.add("hidden");
  const form = document.getElementById("form-forgot-password");
  if (form) form.reset();
  openModal("modal-forgot-password");
}

function showForgotPassword(e) {
  openForgotPasswordModal(e);
}

async function submitForgotPassword(e) {
  e.preventDefault();
  const identifier = document.getElementById("reset-user-identifier").value.trim();
  const password = document.getElementById("reset-new-pwd").value.trim();
  const confirmPassword = document.getElementById("reset-confirm-pwd").value.trim();
  const alertBox = document.getElementById("reset-alert-box");
  const alertMsg = document.getElementById("reset-alert-msg");

  if (password !== confirmPassword) {
    alertMsg.textContent = "Passwords do not match.";
    alertBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, confirm_password: confirmPassword })
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modal-forgot-password");
      alert("✅ " + data.message);
      document.getElementById("login-id-input").value = identifier;
    } else {
      alertMsg.textContent = data.message || "Failed to reset password.";
      alertBox.classList.remove("hidden");
    }
  } catch (err) {
    alertMsg.textContent = "Error communicating with server.";
    alertBox.classList.remove("hidden");
  }
}

function setupFormListeners() {
  // Login form
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loginId = document.getElementById("login-id-input").value.trim();
    const password = document.getElementById("login-pwd-input").value.trim();
    const alertBox = document.getElementById("login-alert");
    const errMsg = document.getElementById("login-error-msg");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: loginId, password })
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        showAppView();
      } else {
        errMsg.textContent = data.message || "Invalid Login Id or Password";
        alertBox.classList.remove("hidden");
      }
    } catch (err) {
      errMsg.textContent = "Server communication error. Please retry.";
      alertBox.classList.remove("hidden");
    }
  });

  // Signup form
  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loginId = document.getElementById("signup-id-input").value.trim();
    const email = document.getElementById("signup-email-input").value.trim();
    const password = document.getElementById("signup-pwd-input").value.trim();
    const rePassword = document.getElementById("signup-repwd-input").value.trim();
    const alertBox = document.getElementById("signup-alert");
    const errMsg = document.getElementById("signup-error-msg");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: loginId, email, password, re_password: rePassword })
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        showAppView();
      } else {
        errMsg.textContent = data.message || "Validation failed";
        alertBox.classList.remove("hidden");
      }
    } catch (err) {
      errMsg.textContent = "Error registering user.";
      alertBox.classList.remove("hidden");
    }
  });
}

async function logoutUser() {
  await fetch("/api/logout", { method: "POST" });
  currentUser = null;
  showAuthView();
}

// --- Navigation ---
function navigateTo(viewName, e) {
  if (e) e.preventDefault();
  
  // Hide all view panels
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  
  // Show target panel
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add("active");

  // Update active nav button
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById(`nav-btn-${viewName}`);
  if (activeBtn) activeBtn.classList.add("active");

  // Trigger loads based on view
  if (viewName === "dashboard") loadDashboardStats();
  if (viewName === "stock") loadStockTable();
  if (viewName === "receipts") loadReceipts();
  if (viewName === "deliveries") loadDeliveries();
  if (viewName === "moves") loadMoveHistory();
  if (viewName === "warehouse") loadWarehouses();
  if (viewName === "locations") loadLocations();
}

// --- Load Initial Data ---
async function loadInitialData() {
  await loadProducts();
  loadDashboardStats();
}

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    currentProducts = await res.json();
  } catch (e) {
    console.error("Error loading products", e);
  }
}

// --- 1. Dashboard Stats ---
async function loadDashboardStats() {
  try {
    const res = await fetch("/api/dashboard/stats");
    const data = await res.json();

    // Receipts KPI
    document.getElementById("kpi-receipt-to-receive").textContent = data.receipts.to_receive;
    document.getElementById("kpi-receipt-late").textContent = data.receipts.late;
    document.getElementById("kpi-receipt-ops").textContent = data.receipts.total_operations;

    // Delivery KPI
    document.getElementById("kpi-delivery-to-deliver").textContent = data.deliveries.to_deliver;
    document.getElementById("kpi-delivery-late").textContent = data.deliveries.late;
    document.getElementById("kpi-delivery-waiting").textContent = data.deliveries.waiting;
    document.getElementById("kpi-delivery-ops").textContent = data.deliveries.total_operations;
  } catch (err) {
    console.error("Failed to load dashboard stats", err);
  }
}

// --- 2. Stock Management ---
async function loadStockTable() {
  await loadProducts();
  filterStockTable();
}

function filterStockTable() {
  const query = (document.getElementById("stock-search-input")?.value || "").toLowerCase().trim();
  const tbody = document.getElementById("stock-table-body");
  if (!tbody) return;

  const filtered = currentProducts.filter(p => 
    p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <strong>${p.name}</strong>
        <br><small class="text-muted font-mono">[${p.code}]</small>
      </td>
      <td><strong>${p.unit_cost.toLocaleString()} Rs</strong></td>
      <td><span class="font-mono font-bold">${p.on_hand}</span></td>
      <td>
        <span class="font-mono ${p.free_to_use <= 0 ? 'text-danger font-bold' : ''}">${p.free_to_use}</span>
      </td>
      <td class="text-right">
        <button class="btn btn-outline btn-sm" onclick="openUpdateStockModal(${p.id}, '${p.name}', ${p.on_hand}, ${p.free_to_use})">
          <i class="fa-solid fa-pen-to-square"></i> Update Stock
        </button>
      </td>
    </tr>
  `).join("");
}

function openUpdateStockModal(id, name, onHand, freeToUse) {
  document.getElementById("update-stock-pid").value = id;
  document.getElementById("update-stock-pname").value = name;
  document.getElementById("update-stock-onhand").value = onHand;
  document.getElementById("update-stock-freetouse").value = freeToUse;
  openModal("modal-update-stock");
}

async function submitUpdateStock(e) {
  e.preventDefault();
  const id = document.getElementById("update-stock-pid").value;
  const onHand = parseInt(document.getElementById("update-stock-onhand").value);
  const freeToUse = parseInt(document.getElementById("update-stock-freetouse").value);

  try {
    const res = await fetch(`/api/products/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on_hand: onHand, free_to_use: freeToUse })
    });
    if (res.ok) {
      closeModal("modal-update-stock");
      await loadStockTable();
      loadDashboardStats();
    }
  } catch (err) {
    alert("Error updating stock");
  }
}

function openAddProductModal() {
  document.getElementById("form-add-product").reset();
  openModal("modal-add-product");
}

async function submitAddProduct(e) {
  e.preventDefault();
  const code = document.getElementById("new-prod-code").value.trim();
  const name = document.getElementById("new-prod-name").value.trim();
  const cost = parseFloat(document.getElementById("new-prod-cost").value);
  const qty = parseInt(document.getElementById("new-prod-qty").value);

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, unit_cost: cost, on_hand: qty })
    });
    if (res.ok) {
      closeModal("modal-add-product");
      await loadStockTable();
    }
  } catch (err) {
    alert("Error adding product");
  }
}

// --- 3. Receipts Operations ---
function toggleReceiptViewMode(mode) {
  activeReceiptViewMode = mode;
  document.getElementById("receipt-list-btn").classList.toggle("active", mode === "list");
  document.getElementById("receipt-kanban-btn").classList.toggle("active", mode === "kanban");
  document.getElementById("receipts-list-container").classList.toggle("hidden", mode !== "list");
  document.getElementById("receipts-kanban-container").classList.toggle("hidden", mode !== "kanban");
  loadReceipts();
}

async function loadReceipts() {
  const search = (document.getElementById("receipts-search-input")?.value || "").trim();
  try {
    const res = await fetch(`/api/receipts?search=${encodeURIComponent(search)}`);
    const receipts = await res.json();

    // Populate List Table
    const tbody = document.getElementById("receipts-table-body");
    tbody.innerHTML = receipts.map(r => `
      <tr class="clickable" onclick="viewReceiptDetailById(${r.id})">
        <td><strong class="font-mono text-purple">${r.reference}</strong></td>
        <td>${r.from_location}</td>
        <td>${r.to_location}</td>
        <td><strong>${r.contact}</strong></td>
        <td>${r.schedule_date}</td>
        <td><span class="status-pill status-${r.status.toLowerCase()}">${r.status}</span></td>
        <td class="text-right">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewReceiptDetailById(${r.id})">
            View
          </button>
        </td>
      </tr>
    `).join("");

    // Populate Kanban Columns
    const drafts = receipts.filter(r => r.status === "Draft");
    const readys = receipts.filter(r => r.status === "Ready");
    const dones = receipts.filter(r => r.status === "Done");

    document.getElementById("count-rcpt-draft").textContent = drafts.length;
    document.getElementById("count-rcpt-ready").textContent = readys.length;
    document.getElementById("count-rcpt-done").textContent = dones.length;

    renderKanbanCards("cards-rcpt-draft", drafts, "receipt");
    renderKanbanCards("cards-rcpt-ready", readys, "receipt");
    renderKanbanCards("cards-rcpt-done", dones, "receipt");

  } catch (err) {
    console.error("Failed to load receipts", err);
  }
}

function renderKanbanCards(containerId, list, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<div class="text-muted p-2" style="font-size:0.8rem; text-align:center;">No records</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="kanban-card" onclick="${type === 'receipt' ? `viewReceiptDetailById(${item.id})` : `viewDeliveryDetailById(${item.id})`}">
      <div class="card-ref">${item.reference}</div>
      <div class="card-partner">${item.contact}</div>
      <div class="card-meta">
        <span><i class="fa-regular fa-calendar"></i> ${item.schedule_date}</span>
        <span class="status-pill status-${item.status.toLowerCase()}">${item.status}</span>
      </div>
    </div>
  `).join("");
}

async function viewReceiptDetailById(id) {
  try {
    const res = await fetch("/api/receipts");
    const all = await res.json();
    const r = all.find(x => x.id === id);
    if (!r) return;
    openReceiptDetail(r);
  } catch (err) {
    console.error(err);
  }
}

function openReceiptDetail(r) {
  currentReceiptDetail = r;
  document.getElementById("receipt-modal-ref").textContent = r.reference;
  document.getElementById("receipt-modal-from").textContent = r.from_location;
  document.getElementById("receipt-modal-to").textContent = r.to_location;
  document.getElementById("receipt-modal-contact").textContent = r.contact;
  document.getElementById("receipt-modal-date").textContent = r.schedule_date;
  document.getElementById("receipt-modal-resp").textContent = r.responsible || (currentUser?.full_name || "Odoo Administrator");

  // Status Pipeline update
  updatePipelineUI("pipe-rcpt", ["Draft", "Ready", "Done"], r.status);

  // Buttons toggle based on status
  const btnTodo = document.getElementById("btn-rcpt-todo");
  const btnValidate = document.getElementById("btn-rcpt-validate");
  const btnPrint = document.getElementById("btn-rcpt-print");
  const btnCancel = document.getElementById("btn-rcpt-cancel");

  btnTodo.classList.add("hidden");
  btnValidate.classList.add("hidden");
  btnPrint.classList.add("hidden");
  btnCancel.classList.add("hidden");

  if (r.status === "Draft") {
    btnTodo.classList.remove("hidden");
    btnCancel.classList.remove("hidden");
  } else if (r.status === "Ready") {
    btnValidate.classList.remove("hidden");
    btnCancel.classList.remove("hidden");
  } else if (r.status === "Done") {
    btnPrint.classList.remove("hidden");
  }

  // Populate Items Table
  const tbody = document.getElementById("receipt-modal-items-tbody");
  tbody.innerHTML = (r.items || []).map(item => `
    <tr>
      <td><strong>${item.product_name}</strong></td>
      <td class="text-right font-mono font-bold">${item.quantity}</td>
    </tr>
  `).join("");

  openModal("modal-receipt-detail");
}

async function advanceReceiptStatus(status) {
  if (!currentReceiptDetail) return;
  try {
    const res = await fetch(`/api/receipts/${currentReceiptDetail.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      closeModal("modal-receipt-detail");
      loadReceipts();
      loadStockTable();
      loadDashboardStats();
    }
  } catch (err) {
    alert("Error changing status");
  }
}

// Create New Receipt
function openNewReceiptModal() {
  document.getElementById("form-new-receipt").reset();
  document.getElementById("new-rcpt-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("new-rcpt-items-list").innerHTML = "";
  addReceiptItemLine();
  openModal("modal-new-receipt");
}

function addReceiptItemLine() {
  const container = document.getElementById("new-rcpt-items-list");
  const rowId = "item-row-" + Date.now();
  const div = document.createElement("div");
  div.className = "item-line-row";
  div.id = rowId;

  const productOptions = currentProducts.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name} [${p.code}]</option>`).join("");

  div.innerHTML = `
    <select class="item-prod-select" required>
      ${productOptions}
    </select>
    <input type="number" class="item-qty-input" value="1" min="1" required placeholder="Qty">
    <button type="button" class="btn btn-outline btn-sm text-danger" onclick="document.getElementById('${rowId}').remove()">&times;</button>
  `;
  container.appendChild(div);
}

async function submitNewReceipt(e) {
  e.preventDefault();
  const from = document.getElementById("new-rcpt-from").value;
  const to = document.getElementById("new-rcpt-to").value;
  const contact = document.getElementById("new-rcpt-contact").value;
  const date = document.getElementById("new-rcpt-date").value;

  const itemRows = document.querySelectorAll("#new-rcpt-items-list .item-line-row");
  const items = [];
  itemRows.forEach(row => {
    const sel = row.querySelector(".item-prod-select");
    const qty = parseInt(row.querySelector(".item-qty-input").value);
    const prodId = parseInt(sel.value);
    const prodName = sel.options[sel.selectedIndex].getAttribute("data-name");
    items.push({ product_id: prodId, product_name: prodName, quantity: qty });
  });

  if (items.length === 0) {
    alert("Please add at least one product line.");
    return;
  }

  try {
    const res = await fetch("/api/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_location: from, to_location: to, contact, schedule_date: date, items })
    });
    if (res.ok) {
      closeModal("modal-new-receipt");
      loadReceipts();
      loadDashboardStats();
    }
  } catch (err) {
    alert("Error creating receipt");
  }
}

// --- 4. Delivery Operations ---
function toggleDeliveryViewMode(mode) {
  activeDeliveryViewMode = mode;
  document.getElementById("delivery-list-btn").classList.toggle("active", mode === "list");
  document.getElementById("delivery-kanban-btn").classList.toggle("active", mode === "kanban");
  document.getElementById("deliveries-list-container").classList.toggle("hidden", mode !== "list");
  document.getElementById("deliveries-kanban-container").classList.toggle("hidden", mode !== "kanban");
  loadDeliveries();
}

async function loadDeliveries() {
  const search = (document.getElementById("deliveries-search-input")?.value || "").trim();
  try {
    const res = await fetch(`/api/deliveries?search=${encodeURIComponent(search)}`);
    const deliveries = await res.json();

    const tbody = document.getElementById("deliveries-table-body");
    tbody.innerHTML = deliveries.map(d => `
      <tr class="clickable ${d.has_out_of_stock && d.status === 'Waiting' ? 'out-of-stock-row' : ''}" onclick="viewDeliveryDetailById(${d.id})">
        <td><strong class="font-mono text-purple">${d.reference}</strong></td>
        <td>${d.from_location}</td>
        <td>${d.to_location}</td>
        <td><strong>${d.contact}</strong></td>
        <td>${d.schedule_date}</td>
        <td><span class="status-pill status-${d.status.toLowerCase()}">${d.status}</span></td>
        <td class="text-right">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewDeliveryDetailById(${d.id})">
            View
          </button>
        </td>
      </tr>
    `).join("");

    const drafts = deliveries.filter(d => d.status === "Draft");
    const waitings = deliveries.filter(d => d.status === "Waiting");
    const readys = deliveries.filter(d => d.status === "Ready");
    const dones = deliveries.filter(d => d.status === "Done");

    document.getElementById("count-deliv-draft").textContent = drafts.length;
    document.getElementById("count-deliv-waiting").textContent = waitings.length;
    document.getElementById("count-deliv-ready").textContent = readys.length;
    document.getElementById("count-deliv-done").textContent = dones.length;

    renderKanbanCards("cards-deliv-draft", drafts, "delivery");
    renderKanbanCards("cards-deliv-waiting", waitings, "delivery");
    renderKanbanCards("cards-deliv-ready", readys, "delivery");
    renderKanbanCards("cards-deliv-done", dones, "delivery");

  } catch (err) {
    console.error("Failed to load deliveries", err);
  }
}

async function viewDeliveryDetailById(id) {
  try {
    const res = await fetch("/api/deliveries");
    const all = await res.json();
    const d = all.find(x => x.id === id);
    if (!d) return;
    openDeliveryDetail(d);
  } catch (err) {
    console.error(err);
  }
}

function openDeliveryDetail(d) {
  currentDeliveryDetail = d;
  document.getElementById("delivery-modal-ref").textContent = d.reference;
  document.getElementById("delivery-modal-addr").textContent = d.address;
  document.getElementById("delivery-modal-from").textContent = d.from_location;
  document.getElementById("delivery-modal-contact").textContent = d.contact;
  document.getElementById("delivery-modal-date").textContent = d.schedule_date;
  document.getElementById("delivery-modal-optype").textContent = d.operation_type;
  document.getElementById("delivery-modal-resp").textContent = d.responsible || (currentUser?.full_name || "Odoo Administrator");

  // Status Pipeline: Draft -> Waiting -> Ready -> Done
  updatePipelineUI("pipe-deliv", ["Draft", "Waiting", "Ready", "Done"], d.status);

  // Check out of stock alert banner
  const alertBanner = document.getElementById("delivery-stock-alert-banner");
  if (d.has_out_of_stock && d.status !== "Done") {
    alertBanner.classList.remove("hidden");
  } else {
    alertBanner.classList.add("hidden");
  }

  // Action Buttons
  const btnCheck = document.getElementById("btn-deliv-check");
  const btnValidate = document.getElementById("btn-deliv-validate");
  const btnPrint = document.getElementById("btn-deliv-print");
  const btnCancel = document.getElementById("btn-deliv-cancel");

  btnCheck.classList.add("hidden");
  btnValidate.classList.add("hidden");
  btnPrint.classList.add("hidden");
  btnCancel.classList.add("hidden");

  if (d.status === "Draft" || d.status === "Waiting") {
    btnCheck.classList.remove("hidden");
    btnCancel.classList.remove("hidden");
  } else if (d.status === "Ready") {
    btnValidate.classList.remove("hidden");
    btnCancel.classList.remove("hidden");
  } else if (d.status === "Done") {
    btnPrint.classList.remove("hidden");
  }

  // Populate Items Table & Mark Red Line Rule if Out of Stock
  const tbody = document.getElementById("delivery-modal-items-tbody");
  tbody.innerHTML = (d.items || []).map(item => `
    <tr class="${item.is_out_of_stock ? 'out-of-stock-row' : ''}">
      <td>
        <strong>${item.product_name}</strong>
        ${item.is_out_of_stock ? '<span class="text-danger ml-2"><i class="fa-solid fa-triangle-exclamation"></i> Out of Stock</span>' : ''}
      </td>
      <td class="text-right font-mono font-bold">${item.quantity}</td>
      <td>
        ${item.is_out_of_stock 
          ? '<span class="status-pill status-cancel">Not In Stock</span>' 
          : '<span class="status-pill status-ready">Available</span>'}
      </td>
    </tr>
  `).join("");

  openModal("modal-delivery-detail");
}

async function checkDeliveryAvailability() {
  if (!currentDeliveryDetail) return;
  try {
    const res = await fetch(`/api/deliveries/${currentDeliveryDetail.id}/check_stock`, { method: "POST" });
    const data = await res.json();
    viewDeliveryDetailById(currentDeliveryDetail.id);
    loadDeliveries();
    loadDashboardStats();
    if (data.all_available) {
      alert("✅ All products are in stock! Status changed to 'Ready' to ship.");
    } else {
      alert("⚠️ Some items are still out of stock. Order remains in 'Waiting' status.");
    }
  } catch (err) {
    alert("Error checking stock");
  }
}

async function advanceDeliveryStatus(status) {
  if (!currentDeliveryDetail) return;
  try {
    const res = await fetch(`/api/deliveries/${currentDeliveryDetail.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      closeModal("modal-delivery-detail");
      loadDeliveries();
      loadStockTable();
      loadDashboardStats();
    }
  } catch (err) {
    alert("Error changing status");
  }
}

// Create New Delivery
function openNewDeliveryModal() {
  document.getElementById("form-new-delivery").reset();
  document.getElementById("new-deliv-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("new-deliv-items-list").innerHTML = "";
  addDeliveryItemLine();
  openModal("modal-new-delivery");
}

function addDeliveryItemLine() {
  const container = document.getElementById("new-deliv-items-list");
  const rowId = "deliv-item-row-" + Date.now();
  const div = document.createElement("div");
  div.className = "item-line-row";
  div.id = rowId;

  const productOptions = currentProducts.map(p => `
    <option value="${p.id}" data-name="${p.name}">
      ${p.name} [Available: ${p.free_to_use}]
    </option>
  `).join("");

  div.innerHTML = `
    <select class="item-prod-select" required>
      ${productOptions}
    </select>
    <input type="number" class="item-qty-input" value="1" min="1" required placeholder="Qty">
    <button type="button" class="btn btn-outline btn-sm text-danger" onclick="document.getElementById('${rowId}').remove()">&times;</button>
  `;
  container.appendChild(div);
}

async function submitNewDelivery(e) {
  e.preventDefault();
  const contact = document.getElementById("new-deliv-contact").value;
  const addr = document.getElementById("new-deliv-addr").value;
  const from = document.getElementById("new-deliv-from").value;
  const date = document.getElementById("new-deliv-date").value;

  const itemRows = document.querySelectorAll("#new-deliv-items-list .item-line-row");
  const items = [];
  itemRows.forEach(row => {
    const sel = row.querySelector(".item-prod-select");
    const qty = parseInt(row.querySelector(".item-qty-input").value);
    const prodId = parseInt(sel.value);
    const prodName = sel.options[sel.selectedIndex].getAttribute("data-name");
    items.push({ product_id: prodId, product_name: prodName, quantity: qty });
  });

  if (items.length === 0) {
    alert("Please add at least one product line.");
    return;
  }

  try {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, address: addr, from_location: from, schedule_date: date, items })
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modal-new-delivery");
      loadDeliveries();
      loadDashboardStats();
      if (data.has_out_of_stock) {
        alert("⚠️ Notice: One or more requested items exceed current warehouse stock! The order has been created in 'Waiting' status with the line highlighted in red.");
      }
    }
  } catch (err) {
    alert("Error creating delivery order");
  }
}

// --- 5. Move History (Color Coded Ledger) ---
async function loadMoveHistory() {
  try {
    const res = await fetch("/api/moves");
    const moves = await res.json();
    const tbody = document.getElementById("moves-table-body");

    tbody.innerHTML = moves.map(m => {
      const isIN = m.op_type === "IN";
      return `
        <tr class="${isIN ? 'move-in-row' : 'move-out-row'}">
          <td><span class="ref-badge"><i class="fa-solid ${isIN ? 'fa-arrow-down-left-and-arrow-up-right-to-center' : 'fa-truck-fast'}"></i> ${m.reference}</span></td>
          <td>${m.date}</td>
          <td><strong>${m.from_loc}</strong></td>
          <td><strong>${m.to_loc}</strong></td>
          <td>${m.product_name}</td>
          <td><strong class="font-mono">${isIN ? '+' : '-'}${m.quantity}</strong></td>
          <td><span class="status-pill status-${m.status.toLowerCase()}">${m.status}</span></td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to load moves", err);
  }
}

// --- 6. Settings: Warehouses & Locations ---
async function loadWarehouses() {
  try {
    const res = await fetch("/api/warehouses");
    const list = await res.json();
    const tbody = document.getElementById("warehouse-table-body");
    tbody.innerHTML = list.map(w => `
      <tr>
        <td><strong>${w.name}</strong></td>
        <td><code>${w.short_code}</code></td>
        <td>${w.address || '-'}</td>
      </tr>
    `).join("");
  } catch (e) {
    console.error(e);
  }
}

function openNewWarehouseModal() {
  document.getElementById("form-add-warehouse").reset();
  openModal("modal-add-warehouse");
}

async function submitAddWarehouse(e) {
  e.preventDefault();
  const name = document.getElementById("new-wh-name").value.trim();
  const code = document.getElementById("new-wh-code").value.trim();
  const addr = document.getElementById("new-wh-addr").value.trim();

  try {
    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, short_code: code, address: addr })
    });
    if (res.ok) {
      closeModal("modal-add-warehouse");
      loadWarehouses();
    }
  } catch (e) {
    alert("Error adding warehouse");
  }
}

async function loadLocations() {
  try {
    const res = await fetch("/api/locations");
    const list = await res.json();
    const tbody = document.getElementById("location-table-body");
    tbody.innerHTML = list.map(l => `
      <tr>
        <td><strong>${l.name}</strong></td>
        <td><code>${l.short_code}</code></td>
        <td><span class="badge badge-purple">${l.warehouse_code}</span></td>
      </tr>
    `).join("");
  } catch (e) {
    console.error(e);
  }
}

function openNewLocationModal() {
  document.getElementById("form-add-location").reset();
  openModal("modal-add-location");
}

async function submitAddLocation(e) {
  e.preventDefault();
  const name = document.getElementById("new-loc-name").value.trim();
  const code = document.getElementById("new-loc-code").value.trim();
  const wh = document.getElementById("new-loc-wh").value.trim();

  try {
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, short_code: code, warehouse_code: wh })
    });
    if (res.ok) {
      closeModal("modal-add-location");
      loadLocations();
    }
  } catch (e) {
    alert("Error adding location");
  }
}

// --- Printing ---
function printReceiptDoc() {
  if (!currentReceiptDetail) return;
  document.getElementById("print-slip-type").textContent = "INWARD GOODS RECEIPT SLIP";
  document.getElementById("print-ref").textContent = currentReceiptDetail.reference;
  document.getElementById("print-date").textContent = currentReceiptDetail.schedule_date;
  document.getElementById("print-status").textContent = currentReceiptDetail.status;
  document.getElementById("print-resp").textContent = currentReceiptDetail.responsible;
  document.getElementById("print-from").textContent = currentReceiptDetail.from_location;
  document.getElementById("print-to").textContent = currentReceiptDetail.to_location;

  const tbody = document.getElementById("print-items-tbody");
  tbody.innerHTML = (currentReceiptDetail.items || []).map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${item.product_name}</strong></td>
      <td class="text-right">${item.quantity}</td>
    </tr>
  `).join("");

  window.print();
}

function printDeliveryDoc() {
  if (!currentDeliveryDetail) return;
  document.getElementById("print-slip-type").textContent = "OUTWARD DELIVERY DISPATCH SLIP";
  document.getElementById("print-ref").textContent = currentDeliveryDetail.reference;
  document.getElementById("print-date").textContent = currentDeliveryDetail.schedule_date;
  document.getElementById("print-status").textContent = currentDeliveryDetail.status;
  document.getElementById("print-resp").textContent = currentDeliveryDetail.responsible;
  document.getElementById("print-from").textContent = currentDeliveryDetail.from_location;
  document.getElementById("print-to").textContent = currentDeliveryDetail.address;

  const tbody = document.getElementById("print-items-tbody");
  tbody.innerHTML = (currentDeliveryDetail.items || []).map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${item.product_name}</strong></td>
      <td class="text-right">${item.quantity}</td>
    </tr>
  `).join("");

  window.print();
}

// --- Helper Functions ---
function updatePipelineUI(prefix, steps, activeStep) {
  let reachedActive = false;
  steps.forEach(step => {
    const el = document.getElementById(`${prefix}-${step.toLowerCase()}`);
    if (!el) return;
    el.classList.remove("active", "done");

    if (step === activeStep) {
      el.classList.add("active");
      reachedActive = true;
    } else if (!reachedActive) {
      el.classList.add("done");
    }
  });
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add("hidden");
}

// Close modal when clicking on dark backdrop
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden");
  }
});
