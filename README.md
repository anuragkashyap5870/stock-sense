# StockSense — Modular Inventory Management System

StockSense is a full-featured, real-time Warehouse Management System (WMS) built with Flask, SQLite, and vanilla modern frontend components. Designed around core Odoo ERP inventory flows, it handles the complete product lifecycle from vendor receipts and internal rack transfers to physical count reconciliation, barcode scanning, and customer deliveries.

---

## 📌 Project Overview

Managing warehouse operations requires strict traceability, zero phantom stock, and clear audit logging. StockSense breaks down inventory workflows into distinct, interconnected modules:

- **Inward Receipts (WH/IN):** Track goods received from suppliers with draft-to-done validation and instant stock updates.
- **Outward Deliveries (WH/OUT):** Manage customer shipments with live stock availability verification and automated backorder/waiting queue holds.
- **Physical Inventory Adjustment:** Reconcile system quantities with ground physical counts through stepped adjustments and variance calculation.
- **Move History (Audit Trail Ledger):** Comprehensive, immutable inventory ledger logging every IN, OUT, INTERNAL, and SCRAP movement.
- **Barcode Scanner:** Real-time SKU/barcode scanner simulator with audio-visual feedback and rapid action routing.
- **Warehouse & Location Hierarchy:** Multi-warehouse configuration with rack-level shelf visualization (`WH/Stock1`, `WH/Stock2`, `Virtual/Scrap`).

---

## 🛠️ Tech Stack

- **Backend:** Python (Flask), SQLite3
- **Frontend:** HTML5, Modern CSS3 (Odoo-inspired theme palette), Vanilla JavaScript (ES6+)
- **Charting & Icons:** Chart.js, Font Awesome 6
- **Typography:** Plus Jakarta Sans, Inter, JetBrains Mono

---

## ⚡ Key Modules & Features

### 1. Operations & Logistics Flow
- **Receipts Pipeline:** Lifecycle states (`Draft` ➔ `Ready` ➔ `Done`) with batch reception and automatic move ledger recording.
- **Delivery Availability Engine:** Validates free-to-use stock before allowing delivery dispatch. Out-of-stock items automatically trigger a waiting state to prevent negative inventory.
- **Document Printing:** Clean print-ready templates for delivery notes and vendor receiving slips.

### 2. Physical Inventory Count & Adjustment
- Live variance calculation comparing system stock against actual shelf counts.
- Single-row and batch adjustment actions with automatic ledger sync.
- Visual status badges highlighting positive overages, negative shortages, and verified counts.

### 3. Move History Ledger (Audit Trail)
- Color-coded transaction log (`#10B981` Green for Inward, `#EF4444` Red for Outward, Blue for Internal Transfers, Orange for Scrap).
- Multi-row display for split product references.
- Real-time search, category filtering, and one-click CSV export for reporting.

### 4. Interactive Dashboard & Barcode Scanner
- Live KPI counter cards for pending, late, and completed operations.
- Weekly movement trend comparison chart (Receipts vs Deliveries).
- Interactive barcode scanner modal with keyboard shortcut (`B`), simulated viewfinder, audio beep confirmation, and fast SKU actions.

### 5. Multi-Warehouse & Rack Management
- Warehouse cards with utilization progress bars and location capacities.
- Visual rack tags for tracking specific storage shelves and virtual locations.

---

## 📁 Repository Structure

```text
stocksense/
├── app.py                      # Flask backend application & REST API routes
├── database.py                 # SQLite database helper & schema initialization
├── requirements.txt            # Python dependencies
├── templates/
│   ├── index.html              # Main application shell & navigation
│   └── components/
│       ├── auth_settings.html        # Authentication & settings modal
│       ├── barcode_scanner.html      # Barcode camera & SKU lookup modal
│       ├── dashboard.html            # Analytics dashboard & trend charts
│       ├── deliveries.html           # Outward delivery orders
│       ├── inventory_adjustment.html # Physical inventory adjustment
│       ├── move_history.html         # Audit trail ledger & export
│       ├── receipts.html             # Inward vendor receipts
│       ├── stock.html                # Product inventory & internal transfers
│       └── warehouse_locations.html  # Warehouses and rack locations
└── static/                     # CSS stylesheets, JS scripts, and assets
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- Python 3.8 or newer
- pip (Python package manager)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anuragkashyap5870/stock-sense.git
   cd stock-sense
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   # or manually:
   pip install flask
   ```

3. **Start the application:**
   ```bash
   python app.py
   ```


   ``

### Default Credentials
- **Username:** `admin_odoo`
- **Password:** `Admin@123`

*(You can also use the built-in Sign Up option to create a custom user account.)*

---

## 👥 Team & Development Roles

- **Anurag Kashyap** — Backend Architecture, SQLite Schema, API Endpoints, System Integration
- **Akash Sahani** — Frontend Operations, Inventory Adjustment, Stock Tracking & Warehouse Cards
- **Ankit Kumar** — Dashboard Analytics, Movement Ledger, Barcode Scanner & UI Components
- **Aditya kumar gupta** — UI designer ,video drafter and repo manager.

---

