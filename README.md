# StockSense 📦⚡
> **Next-Generation Inventory & Warehouse Management Platform**  
> *Developed for Odoo Hackathon 2026*

StockSense is an intelligent, full-featured warehouse and inventory tracking system built with Python, SQLite, and modern web technologies. Designed around core Odoo Inventory principles, it provides real-time tracking of inward goods receipts, outward customer deliveries, automated stock availability alerts, and a color-coded inventory ledger.

---

## 🌟 Key Features & Requirements Met

### 1. 🔐 User Authentication & Authorization
* **Secure Login & Session Management:** Validates credentials with error alerts for invalid attempts.
* **Smart Sign-Up Verification:**
  * Login ID: Unique alphanumeric string (6–12 characters).
  * Email Validation: Strict uniqueness and format checking.
  * Password Security: Enforces minimum 8 characters with at least one uppercase letter, one lowercase letter, and one special symbol.

### 2. 📊 Dynamic Operations Dashboard
* **Receipts KPI Card:** Real-time counts for *To Receive*, *Late Shipments* (`schedule_date < today`), and *Total Operations*.
* **Delivery KPI Card:** Real-time counts for *To Deliver*, *Late Deliveries*, *Waiting for Stock*, and *Total Operations*.
* **Status Computation:** Instant evaluation of date-driven milestones.

### 3. 📦 Stock & Warehouse Valuation View
* Real-time ledger displaying:
  * **Product Name & SKU**
  * **Per Unit Cost (Rs)**
  * **On Hand Quantity**
  * **Free to Use Quantity**
* **Instant Stock Reconciliation:** Update physical stock directly from the UI with zero page reload.

### 4. 📥 Receipts (Inward Logistics)
* **Standard Auto-Incrementing Reference ID:** Format `<Warehouse>/IN/<ID>` (e.g., `WH/IN/0001`).
* **Multi-View Modes:** Instant toggle between structured **List View** and visual **Kanban View**.
* **3-Stage Lifecycle:** `Draft` ➔ `Ready` ➔ `Done` with action triggers (`TODO`, `VALIDATE`, `PRINT`, `CANCEL`).
* **Auto-Attribution:** Responsible officer automatically captured from the active session.
* **Document Printing:** Instant printable Inward Goods Slip on validation.

### 5. 🚚 Deliveries (Outward Logistics & Stock Alerts)
* **Standard Auto-Incrementing Reference ID:** Format `<Warehouse>/OUT/<ID>` (e.g., `WH/OUT/0001`).
* **4-Stage Lifecycle:** `Draft` ➔ `Waiting` ➔ `Ready` ➔ `Done`.
* 🚨 **Out-of-Stock Highlighting Rule:**
  * If requested stock exceeds available quantities, the system automatically alerts the user.
  * The affected line item is marked in **RED**.
  * The order is held in **Waiting** status until stock replenishes.
* **Automatic Stock Deduction:** On order validation, warehouse stock balances are updated atomically.

### 6. 📜 Move History (Color-Coded Inventory Ledger)
* Full audit trail of all warehouse transfers between *From* and *To* locations.
* **Color Standards:**
  * 🟢 **IN Moves:** Displayed in **Green** (Inward receipts from vendors).
  * 🔴 **OUT Moves:** Displayed in **Red** (Outward dispatches to customers).
* Multi-product dispatches correctly listed on separate lines with matching references.

### 7. ⚙️ Multi-Warehouse & Location Management
* Configure Warehouses with short codes and addresses.
* Establish internal storage rooms, racks, and aisles (`WH/Stock1`, `WH/Stock2`, etc.).

---

## 🛠️ Tech Stack
* **Backend:** Python (Flask, SQLite3)
* **Frontend:** HTML5, Modern Vanilla CSS (Plus Jakarta Sans, JetBrains Mono, FontAwesome 6)
* **Architecture:** Monolithic Full-Stack Single-Page Application (SPA) — 100% single-branch Git compliant.

---

## 🚀 How to Run Locally

### Prerequisites
* Python 3.9+ installed on your computer.

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Launch StockSense
```bash
python app.py
```

### Step 3: Open in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

### Default Demo Credentials
| Role | Login ID | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin_odoo` | `Admin@123` |
| **Warehouse User** | `john_doe` | `User@1234` |
