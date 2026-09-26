import os
import sqlite3
from datetime import datetime, date
from flask import Flask, request, jsonify, render_template, session

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "stocksense-super-secret-key-odoo-hackathon"
DB_PATH = os.path.join(os.path.dirname(__file__), "stocksense.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Warehouses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS warehouses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        short_code TEXT UNIQUE NOT NULL,
        address TEXT
    )
    """)
    
    # 3. Locations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        short_code TEXT NOT NULL,
        warehouse_code TEXT NOT NULL
    )
    """)
    
    # 4. Products
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        unit_cost REAL NOT NULL,
        on_hand INTEGER DEFAULT 0,
        free_to_use INTEGER DEFAULT 0
    )
    """)
    
    # 5. Receipts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        from_location TEXT NOT NULL,
        to_location TEXT NOT NULL,
        contact TEXT NOT NULL,
        schedule_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        responsible TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 6. Receipt Items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS receipt_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
    )
    """)
    
    # 7. Deliveries
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        from_location TEXT NOT NULL,
        to_location TEXT NOT NULL,
        contact TEXT NOT NULL,
        address TEXT NOT NULL,
        schedule_date DATE NOT NULL,
        operation_type TEXT NOT NULL DEFAULT 'Delivery Order',
        status TEXT NOT NULL DEFAULT 'Draft',
        responsible TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 8. Delivery Items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS delivery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        is_out_of_stock INTEGER DEFAULT 0,
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
    )
    """)
    
    # 9. Move History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS move_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL,
        op_type TEXT NOT NULL,
        date TEXT NOT NULL,
        from_loc TEXT NOT NULL,
        to_loc TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Done'
    )
    """)
    
    conn.commit()
    
    # Seed Initial Data matching Excalidraw Wireframe if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO users (login_id, email, password, full_name) VALUES ('admin_odoo', 'admin@stocksense.com', 'Admin@123', 'Odoo Administrator')")
        cursor.execute("INSERT INTO users (login_id, email, password, full_name) VALUES ('john_doe', 'john@stocksense.com', 'User@1234', 'John Doe')")
        
        cursor.execute("INSERT INTO warehouses (name, short_code, address) VALUES ('Main Warehouse', 'WH', 'Plot 42, Central Logistics Park, Industrial Zone')")
        cursor.execute("INSERT INTO locations (name, short_code, warehouse_code) VALUES ('Stock Shelf 1', 'WH/Stock1', 'WH')")
        cursor.execute("INSERT INTO locations (name, short_code, warehouse_code) VALUES ('Stock Shelf 2', 'WH/Stock2', 'WH')")
        cursor.execute("INSERT INTO locations (name, short_code, warehouse_code) VALUES ('Vendor Inward Dock', 'Vendor', 'WH')")
        cursor.execute("INSERT INTO locations (name, short_code, warehouse_code) VALUES ('Customer Dispatch Dock', 'Customer', 'WH')")
        
        # Products from wireframe
        cursor.execute("INSERT INTO products (code, name, unit_cost, on_hand, free_to_use) VALUES ('DESK001', 'Desk', 3000, 50, 45)")
        cursor.execute("INSERT INTO products (code, name, unit_cost, on_hand, free_to_use) VALUES ('TBL002', 'Table', 3000, 50, 50)")
        cursor.execute("INSERT INTO products (code, name, unit_cost, on_hand, free_to_use) VALUES ('CHR003', 'Ergonomic Chair', 1500, 25, 20)")
        cursor.execute("INSERT INTO products (code, name, unit_cost, on_hand, free_to_use) VALUES ('LMP004', 'LED Desk Lamp', 800, 0, 0)")
        
        today_str = date.today().isoformat()
        yesterday_str = "2026-09-25"
        tomorrow_str = "2026-09-27"
        
        # Seed Receipts (Matching Card: 4 to receive, 1 Late, 6 operations)
        cursor.execute("INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible) VALUES ('WH/IN/0001', 'Vendor', 'WH/Stock1', 'Azure Interior', ?, 'Ready', 'Odoo Administrator')", (today_str,))
        r1 = cursor.lastrowid
        cursor.execute("INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity) VALUES (?, 1, 'Desk', 6)", (r1,))
        
        cursor.execute("INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible) VALUES ('WH/IN/0002', 'Vendor', 'WH/Stock1', 'Azure Interior', ?, 'Ready', 'Odoo Administrator')", (yesterday_str,))
        r2 = cursor.lastrowid
        cursor.execute("INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity) VALUES (?, 2, 'Table', 10)", (r2,))
        
        cursor.execute("INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible) VALUES ('WH/IN/0003', 'Vendor', 'WH/Stock2', 'Wood Works Ltd', ?, 'Draft', 'Odoo Administrator')", (tomorrow_str,))
        r3 = cursor.lastrowid
        cursor.execute("INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity) VALUES (?, 1, 'Desk', 15)", (r3,))

        cursor.execute("INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible) VALUES ('WH/IN/0004', 'Vendor', 'WH/Stock1', 'Deco Addict', ?, 'Draft', 'Odoo Administrator')", (tomorrow_str,))
        r4 = cursor.lastrowid
        cursor.execute("INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity) VALUES (?, 3, 'Ergonomic Chair', 8)", (r4,))

        cursor.execute("INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible) VALUES ('WH/IN/0005', 'Vendor', 'WH/Stock1', 'Lumino Corp', ?, 'Done', 'Odoo Administrator')", (yesterday_str,))
        r5 = cursor.lastrowid
        cursor.execute("INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity) VALUES (?, 4, 'LED Desk Lamp', 20)", (r5,))

        cursor.execute("INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible) VALUES ('WH/IN/0006', 'Vendor', 'WH/Stock2', 'Azure Interior', ?, 'Done', 'Odoo Administrator')", (yesterday_str,))
        r6 = cursor.lastrowid
        cursor.execute("INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity) VALUES (?, 2, 'Table', 5)", (r6,))

        # Seed Deliveries (Matching Card: 4 to deliver, 1 Late, 2 waiting, 6 operations)
        cursor.execute("INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible) VALUES ('WH/OUT/0001', 'WH/Stock1', 'Customer', 'Azure Interior', '24 Wall Street, NY', ?, 'Delivery Order', 'Ready', 'Odoo Administrator')", (today_str,))
        d1 = cursor.lastrowid
        cursor.execute("INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock) VALUES (?, 1, 'Desk', 5, 0)", (d1,))

        cursor.execute("INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible) VALUES ('WH/OUT/0002', 'WH/Stock1', 'Customer', 'Azure Interior', '24 Wall Street, NY', ?, 'Delivery Order', 'Ready', 'Odoo Administrator')", (yesterday_str,))
        d2 = cursor.lastrowid
        cursor.execute("INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock) VALUES (?, 1, 'Desk', 2, 0)", (d2,))

        cursor.execute("INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible) VALUES ('WH/OUT/0003', 'WH/Stock1', 'Customer', 'Deco Addict', '77 Sunset Blvd, LA', ?, 'Delivery Order', 'Waiting', 'Odoo Administrator')", (tomorrow_str,))
        d3 = cursor.lastrowid
        cursor.execute("INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock) VALUES (?, 4, 'LED Desk Lamp', 10, 1)", (d3,))

        cursor.execute("INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible) VALUES ('WH/OUT/0004', 'WH/Stock2', 'Customer', 'Gemini Corp', '100 Silicon Way, CA', ?, 'Delivery Order', 'Waiting', 'Odoo Administrator')", (tomorrow_str,))
        d4 = cursor.lastrowid
        cursor.execute("INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock) VALUES (?, 4, 'LED Desk Lamp', 4, 1)", (d4,))

        cursor.execute("INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible) VALUES ('WH/OUT/0005', 'WH/Stock1', 'Customer', 'Modular Tech', '12 Innovation Dr', ?, 'Delivery Order', 'Done', 'Odoo Administrator')", (yesterday_str,))
        d5 = cursor.lastrowid
        cursor.execute("INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock) VALUES (?, 2, 'Table', 3, 0)", (d5,))

        cursor.execute("INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible) VALUES ('WH/OUT/0006', 'WH/Stock1', 'Customer', 'Azure Interior', '24 Wall Street, NY', ?, 'Delivery Order', 'Done', 'Odoo Administrator')", (yesterday_str,))
        d6 = cursor.lastrowid
        cursor.execute("INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock) VALUES (?, 3, 'Ergonomic Chair', 2, 0)", (d6,))

        # Seed Move History from Excalidraw wireframe
        # "If a single reference has multiple products, display it in multiple rows."
        # "IN moves in GREEN, OUT moves in RED"
        cursor.execute("INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status) VALUES ('WH/IN/0001', 'IN', '2026-09-20', 'vendor', 'WH/Stock1', 'Desk', 20, 'Ready')")
        cursor.execute("INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status) VALUES ('WH/OUT/0002', 'OUT', '2026-09-22', 'vendor', 'WH/Stock1', 'Desk', 5, 'Ready')")
        cursor.execute("INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status) VALUES ('WH/OUT/0002', 'OUT', '2026-09-22', 'WH/Stock2', 'vendor', 'Table', 5, 'Ready')")
        cursor.execute("INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status) VALUES ('WH/IN/0005', 'IN', '2026-09-24', 'vendor', 'WH/Stock1', 'LED Desk Lamp', 20, 'Done')")
        cursor.execute("INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status) VALUES ('WH/OUT/0006', 'OUT', '2026-09-25', 'WH/Stock1', 'Customer', 'Ergonomic Chair', 2, 'Done')")

        conn.commit()
    conn.close()

init_db()

# --- Helper Routes & Auto Ref Generator ---
def generate_reference(op_type="IN", warehouse="WH"):
    conn = get_db()
    cursor = conn.cursor()
    table = "receipts" if op_type == "IN" else "deliveries"
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0] + 1
    conn.close()
    return f"{warehouse}/{op_type}/{count:04d}"

# --- Pages ---
@app.route("/")
def index():
    return render_template("index.html")

# --- Authentication APIs ---
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    login_id = data.get("login_id", "").strip()
    password = data.get("password", "").strip()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE login_id = ? AND password = ?", (login_id, password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        session["user_id"] = user["id"]
        session["login_id"] = user["login_id"]
        session["full_name"] = user["full_name"] or user["login_id"]
        session["email"] = user["email"]
        return jsonify({
            "success": True,
            "user": {
                "id": user["id"],
                "login_id": user["login_id"],
                "full_name": user["full_name"] or user["login_id"],
                "email": user["email"]
            }
        })
    return jsonify({"success": False, "message": "Invalid Login Id or Password"}), 401

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json or {}
    login_id = data.get("login_id", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    re_password = data.get("re_password", "").strip()
    
    # Excalidraw Validations
    if len(login_id) < 6 or len(login_id) > 12:
        return jsonify({"success": False, "message": "Login ID must be between 6 and 12 characters in length."}), 400
    
    if "@" not in email or "." not in email:
        return jsonify({"success": False, "message": "Please enter a valid email address."}), 400
        
    if password != re_password:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400
        
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_special = any(not c.isalnum() for c in password)
    if len(password) < 8 or not (has_upper and has_lower and has_special):
        return jsonify({"success": False, "message": "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character."}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE login_id = ?", (login_id,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Login ID already taken. Please choose another."}), 400
        
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Email already registered in system."}), 400
        
    cursor.execute("INSERT INTO users (login_id, email, password, full_name) VALUES (?, ?, ?, ?)",
                   (login_id, email, password, login_id.capitalize()))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    session["user_id"] = user_id
    session["login_id"] = login_id
    session["full_name"] = login_id.capitalize()
    session["email"] = email
    
    return jsonify({
        "success": True,
        "message": "User registered successfully!",
        "user": {"id": user_id, "login_id": login_id, "full_name": login_id.capitalize(), "email": email}
    })

@app.route("/api/me")
def me():
    if "user_id" in session:
        return jsonify({
            "authenticated": True,
            "user": {
                "id": session["user_id"],
                "login_id": session["login_id"],
                "full_name": session["full_name"],
                "email": session["email"]
            }
        })
    return jsonify({"authenticated": False})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

# --- Dashboard KPIs API ---
@app.route("/api/dashboard/stats")
def dashboard_stats():
    today = date.today().isoformat()
    conn = get_db()
    cursor = conn.cursor()
    
    # Receipts stats
    cursor.execute("SELECT COUNT(*) FROM receipts")
    total_receipt_ops = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM receipts WHERE status IN ('Draft', 'Ready')")
    to_receive = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM receipts WHERE schedule_date < ? AND status != 'Done'", (today,))
    receipt_late = cursor.fetchone()[0]
    
    # Delivery stats
    cursor.execute("SELECT COUNT(*) FROM deliveries")
    total_delivery_ops = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM deliveries WHERE status IN ('Draft', 'Waiting', 'Ready')")
    to_deliver = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM deliveries WHERE schedule_date < ? AND status != 'Done'", (today,))
    delivery_late = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM deliveries WHERE status = 'Waiting'")
    delivery_waiting = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        "receipts": {
            "to_receive": to_receive,
            "late": receipt_late,
            "total_operations": total_receipt_ops
        },
        "deliveries": {
            "to_deliver": to_deliver,
            "late": delivery_late,
            "waiting": delivery_waiting,
            "total_operations": total_delivery_ops
        }
    })

# --- Products & Stock APIs ---
@app.route("/api/products", methods=["GET", "POST"])
def get_products():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json
        cursor.execute("INSERT INTO products (code, name, unit_cost, on_hand, free_to_use) VALUES (?, ?, ?, ?, ?)",
                       (data["code"], data["name"], data["unit_cost"], data["on_hand"], data["on_hand"]))
        conn.commit()
        pid = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "id": pid})
        
    cursor.execute("SELECT * FROM products ORDER BY name ASC")
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(products)

@app.route("/api/products/<int:pid>/stock", methods=["PUT"])
def update_stock(pid):
    data = request.json or {}
    new_on_hand = int(data.get("on_hand", 0))
    new_free_to_use = int(data.get("free_to_use", new_on_hand))
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE products SET on_hand = ?, free_to_use = ? WHERE id = ?",
                   (new_on_hand, new_free_to_use, pid))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --- Settings: Warehouses & Locations APIs ---
@app.route("/api/warehouses", methods=["GET", "POST"])
def manage_warehouses():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json
        cursor.execute("INSERT INTO warehouses (name, short_code, address) VALUES (?, ?, ?)",
                       (data["name"], data["short_code"], data.get("address", "")))
        conn.commit()
        wid = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "id": wid})
        
    cursor.execute("SELECT * FROM warehouses ORDER BY name ASC")
    warehouses = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(warehouses)

@app.route("/api/locations", methods=["GET", "POST"])
def manage_locations():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json
        cursor.execute("INSERT INTO locations (name, short_code, warehouse_code) VALUES (?, ?, ?)",
                       (data["name"], data["short_code"], data.get("warehouse_code", "WH")))
        conn.commit()
        lid = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "id": lid})
        
    cursor.execute("SELECT * FROM locations ORDER BY name ASC")
    locations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(locations)

# --- Receipts Operations APIs ---
@app.route("/api/receipts", methods=["GET", "POST"])
def list_create_receipts():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        ref = generate_reference(op_type="IN", warehouse="WH")
        responsible = session.get("full_name") or "Odoo Administrator"
        
        cursor.execute("""
            INSERT INTO receipts (reference, from_location, to_location, contact, schedule_date, status, responsible)
            VALUES (?, ?, ?, ?, ?, 'Draft', ?)
        """, (ref, data.get("from_location", "Vendor"), data.get("to_location", "WH/Stock1"),
              data.get("contact", ""), data.get("schedule_date", date.today().isoformat()), responsible))
        receipt_id = cursor.lastrowid
        
        # Insert items
        items = data.get("items", [])
        for item in items:
            cursor.execute("""
                INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity)
                VALUES (?, ?, ?, ?)
            """, (receipt_id, item["product_id"], item["product_name"], item["quantity"]))
            
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": receipt_id, "reference": ref})
        
    # GET list
    search = request.args.get("search", "").strip().lower()
    cursor.execute("SELECT * FROM receipts ORDER BY id DESC")
    all_receipts = [dict(row) for row in cursor.fetchall()]
    
    # Filter if search
    if search:
        all_receipts = [r for r in all_receipts if search in r["reference"].lower() or search in r["contact"].lower()]
        
    # Attach items
    for r in all_receipts:
        cursor.execute("SELECT * FROM receipt_items WHERE receipt_id = ?", (r["id"],))
        r["items"] = [dict(i) for i in cursor.fetchall()]
        
    conn.close()
    return jsonify(all_receipts)

@app.route("/api/receipts/<int:rid>/status", methods=["PUT"])
def update_receipt_status(rid):
    data = request.json or {}
    new_status = data.get("status") # 'Ready', 'Done', 'Cancel'
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM receipts WHERE id = ?", (rid,))
    receipt = cursor.fetchone()
    if not receipt:
        conn.close()
        return jsonify({"error": "Receipt not found"}), 404
        
    old_status = receipt["status"]
    cursor.execute("UPDATE receipts SET status = ? WHERE id = ?", (new_status, rid))
    
    # If validating to DONE, increment on-hand and free-to-use stock and log to move_history
    if new_status == "Done" and old_status != "Done":
        cursor.execute("SELECT * FROM receipt_items WHERE receipt_id = ?", (rid,))
        items = cursor.fetchall()
        for item in items:
            cursor.execute("UPDATE products SET on_hand = on_hand + ?, free_to_use = free_to_use + ? WHERE id = ?",
                           (item["quantity"], item["quantity"], item["product_id"]))
            # Log in Move History (IN moves)
            cursor.execute("""
                INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status)
                VALUES (?, 'IN', ?, ?, ?, ?, ?, 'Done')
            """, (receipt["reference"], date.today().isoformat(), receipt["from_location"], receipt["to_location"],
                  item["product_name"], item["quantity"]))
                  
    conn.commit()
    conn.close()
    return jsonify({"success": True, "status": new_status})

# --- Delivery Operations APIs ---
@app.route("/api/deliveries", methods=["GET", "POST"])
def list_create_deliveries():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        ref = generate_reference(op_type="OUT", warehouse="WH")
        responsible = session.get("full_name") or "Odoo Administrator"
        
        items = data.get("items", [])
        has_out_of_stock = False
        
        # Check stock availability
        for item in items:
            cursor.execute("SELECT free_to_use FROM products WHERE id = ?", (item["product_id"],))
            prod = cursor.fetchone()
            if prod and prod["free_to_use"] < item["quantity"]:
                item["is_out_of_stock"] = 1
                has_out_of_stock = True
            else:
                item["is_out_of_stock"] = 0
                
        initial_status = "Waiting" if has_out_of_stock else "Draft"
        
        cursor.execute("""
            INSERT INTO deliveries (reference, from_location, to_location, contact, address, schedule_date, operation_type, status, responsible)
            VALUES (?, ?, ?, ?, ?, ?, 'Delivery Order', ?, ?)
        """, (ref, data.get("from_location", "WH/Stock1"), data.get("to_location", "Customer"),
              data.get("contact", ""), data.get("address", ""), data.get("schedule_date", date.today().isoformat()),
              initial_status, responsible))
        delivery_id = cursor.lastrowid
        
        for item in items:
            cursor.execute("""
                INSERT INTO delivery_items (delivery_id, product_id, product_name, quantity, is_out_of_stock)
                VALUES (?, ?, ?, ?, ?)
            """, (delivery_id, item["product_id"], item["product_name"], item["quantity"], item["is_out_of_stock"]))
            
        conn.commit()
        conn.close()
        return jsonify({
            "success": True,
            "id": delivery_id,
            "reference": ref,
            "status": initial_status,
            "has_out_of_stock": has_out_of_stock
        })
        
    search = request.args.get("search", "").strip().lower()
    cursor.execute("SELECT * FROM deliveries ORDER BY id DESC")
    all_deliveries = [dict(row) for row in cursor.fetchall()]
    
    if search:
        all_deliveries = [d for d in all_deliveries if search in d["reference"].lower() or search in d["contact"].lower()]
        
    for d in all_deliveries:
        cursor.execute("SELECT * FROM delivery_items WHERE delivery_id = ?", (d["id"],))
        items = [dict(i) for i in cursor.fetchall()]
        d["items"] = items
        d["has_out_of_stock"] = any(i["is_out_of_stock"] == 1 for i in items)
        
    conn.close()
    return jsonify(all_deliveries)

@app.route("/api/deliveries/<int:did>/check_stock", methods=["POST"])
def check_delivery_stock(did):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM delivery_items WHERE delivery_id = ?", (did,))
    items = cursor.fetchall()
    
    all_available = True
    for item in items:
        cursor.execute("SELECT free_to_use FROM products WHERE id = ?", (item["product_id"],))
        prod = cursor.fetchone()
        out_of_stock = 1 if (prod and prod["free_to_use"] < item["quantity"]) else 0
        cursor.execute("UPDATE delivery_items SET is_out_of_stock = ? WHERE id = ?", (out_of_stock, item["id"]))
        if out_of_stock:
            all_available = False
            
    new_status = "Ready" if all_available else "Waiting"
    cursor.execute("UPDATE deliveries SET status = ? WHERE id = ?", (new_status, did))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "status": new_status, "all_available": all_available})

@app.route("/api/deliveries/<int:did>/status", methods=["PUT"])
def update_delivery_status(did):
    data = request.json or {}
    new_status = data.get("status")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM deliveries WHERE id = ?", (did,))
    delivery = cursor.fetchone()
    if not delivery:
        conn.close()
        return jsonify({"error": "Delivery not found"}), 404
        
    old_status = delivery["status"]
    cursor.execute("UPDATE deliveries SET status = ? WHERE id = ?", (new_status, did))
    
    # If validating to DONE, deduct stock & log move_history (OUT in RED)
    if new_status == "Done" and old_status != "Done":
        cursor.execute("SELECT * FROM delivery_items WHERE delivery_id = ?", (did,))
        items = cursor.fetchall()
        for item in items:
            cursor.execute("UPDATE products SET on_hand = on_hand - ?, free_to_use = free_to_use - ? WHERE id = ?",
                           (item["quantity"], item["quantity"], item["product_id"]))
            cursor.execute("""
                INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status)
                VALUES (?, 'OUT', ?, ?, ?, ?, ?, 'Done')
            """, (delivery["reference"], date.today().isoformat(), delivery["from_location"], delivery["to_location"],
                  item["product_name"], item["quantity"]))
                  
    conn.commit()
    conn.close()
    return jsonify({"success": True, "status": new_status})

# --- Move History API ---
@app.route("/api/moves")
def get_move_history():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM move_history ORDER BY id DESC")
    moves = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(moves)

if __name__ == "__main__":
    print("[INFO] StockSense Odoo Inventory Server running on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
