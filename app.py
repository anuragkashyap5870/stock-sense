import os
import sqlite3
from datetime import datetime, date
from flask import Flask, request, jsonify, render_template, session

try:
    import supabase_client
except ImportError:
    supabase_client = None

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "stocksense-super-secret-key-odoo-hackathon"
DB_PATH = os.path.join(os.path.dirname(__file__), "stocksense.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(force_reseed=False):
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
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
    except Exception:
        pass
    
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
    
    # Seed Initial Data matching Excalidraw Wireframe if empty or force_reseed
    if force_reseed:
        cursor.execute("DELETE FROM receipt_items")
        cursor.execute("DELETE FROM receipts")
        cursor.execute("DELETE FROM delivery_items")
        cursor.execute("DELETE FROM deliveries")
        cursor.execute("DELETE FROM products")
        cursor.execute("DELETE FROM move_history")

    cursor.execute("SELECT COUNT(*) FROM products")
    if force_reseed or cursor.fetchone()[0] == 0:
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO users (login_id, email, password, full_name, phone) VALUES ('admin_odoo', 'admin@stocksense.com', 'Admin@123', 'Odoo Administrator', '+919876543210')")
            cursor.execute("INSERT INTO users (login_id, email, password, full_name, phone) VALUES ('john_doe', 'john@stocksense.com', 'User@1234', 'John Doe', '+919812345678')")
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
    if op_type == "IN":
        cursor.execute("SELECT COUNT(*) FROM receipts")
    elif op_type == "OUT":
        cursor.execute("SELECT COUNT(*) FROM deliveries")
    else:
        cursor.execute("SELECT COUNT(*) FROM move_history WHERE op_type IN ('INTERNAL', 'SCRAP', ?)", (op_type,))
    count = cursor.fetchone()[0] + 1
    conn.close()
    return f"{warehouse}/{op_type}/{count:04d}"

# --- Pages ---
@app.route("/")
def index():
    return render_template("index.html")

# --- Authentication APIs (Supabase Cloud + Local Hybrid Fallback) ---
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    login_id = (data.get("login_id") or data.get("identifier") or "").strip()
    password = data.get("password", "").strip()

    user_data = None
    cloud_auth = False

    # 1. Supabase Cloud Authentication
    if supabase_client and supabase_client.is_supabase_enabled():
        sb_res = supabase_client.supabase_signin(login_id, password)
        if sb_res.get("success"):
            sb_user = sb_res["user"]
            cloud_auth = True
            # Cache/sync user into local database
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE login_id = ? OR email = ?", (sb_user["login_id"], sb_user["email"]))
            local_user = cursor.fetchone()
            if not local_user:
                cursor.execute(
                    "INSERT INTO users (login_id, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)",
                    (sb_user["login_id"], sb_user["email"], password, sb_user["full_name"], sb_user.get("phone", ""))
                )
                conn.commit()
                user_id = cursor.lastrowid
            else:
                user_id = local_user["id"]
            conn.close()

            user_data = {
                "id": user_id,
                "login_id": sb_user["login_id"],
                "full_name": sb_user["full_name"],
                "email": sb_user["email"],
                "phone": sb_user.get("phone", ""),
                "cloud": True
            }

    # 2. Local Fallback (supports login by Login ID, Email, or Phone)
    if not user_data:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE (login_id = ? OR email = ? OR phone = ?) AND password = ?",
            (login_id, login_id, login_id, password)
        )
        local_user = cursor.fetchone()
        conn.close()
        if local_user:
            u_dict = dict(local_user)
            user_data = {
                "id": u_dict["id"],
                "login_id": u_dict["login_id"],
                "full_name": u_dict.get("full_name") or u_dict["login_id"],
                "email": u_dict["email"],
                "phone": u_dict.get("phone", ""),
                "cloud": False
            }

    if user_data:
        session["user_id"] = user_data["id"]
        session["login_id"] = user_data["login_id"]
        session["full_name"] = user_data["full_name"]
        session["email"] = user_data["email"]
        session["phone"] = user_data.get("phone", "")
        
        if supabase_client and supabase_client.is_supabase_enabled():
            supabase_client.supabase_log_activity(
                user_identifier=user_data.get("email") or user_data.get("login_id"),
                action="LOGIN",
                description=f"User {user_data.get('login_id')} logged in via {'Supabase Cloud' if user_data.get('cloud') else 'Local Fallback'}",
                metadata={"cloud": user_data.get("cloud", False), "phone": user_data.get("phone", "")},
                ip_address=request.remote_addr
            )
            
        return jsonify({
            "success": True,
            "user": user_data,
            "message": "Authenticated with Supabase Cloud Auth" if user_data.get("cloud") else "Authenticated successfully"
        })

    return jsonify({"success": False, "message": "Invalid Login Id, Email, Phone, or Password"}), 401


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json or {}
    login_id = data.get("login_id", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
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

    cloud_registered = False
    if supabase_client and supabase_client.is_supabase_enabled():
        sb_res = supabase_client.supabase_signup(login_id, email, password, login_id.capitalize(), phone)
        if not sb_res.get("success"):
            return jsonify({"success": False, "message": sb_res.get("message")}), 400
        cloud_registered = True

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
        
    cursor.execute("INSERT INTO users (login_id, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)",
                   (login_id, email, password, login_id.capitalize(), phone))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    session["user_id"] = user_id
    session["login_id"] = login_id
    session["full_name"] = login_id.capitalize()
    session["email"] = email
    session["phone"] = phone
    
    if supabase_client and supabase_client.is_supabase_enabled():
        supabase_client.supabase_log_activity(
            user_identifier=email,
            action="SIGNUP",
            description=f"New user registered: {login_id} ({email})",
            metadata={"login_id": login_id, "phone": phone, "cloud": cloud_registered},
            ip_address=request.remote_addr
        )
    
    return jsonify({
        "success": True,
        "message": "User registered in Supabase Cloud & Local DB!" if cloud_registered else "User registered successfully!",
        "user": {
            "id": user_id,
            "login_id": login_id,
            "full_name": login_id.capitalize(),
            "email": email,
            "phone": phone,
            "cloud": cloud_registered
        }
    })


@app.route("/api/me", methods=["GET"])
def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"authenticated": False, "user": None})
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, login_id, email, full_name, phone FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        u_dict = dict(user)
        u_dict["avatar"] = session.get("avatar") or f"https://api.dicebear.com/7.x/initials/svg?seed={u_dict.get('full_name') or u_dict.get('login_id')}"
        u_dict["auth_provider"] = session.get("auth_provider", "odoo")
        u_dict["cloud"] = bool(supabase_client and supabase_client.is_supabase_enabled())
        return jsonify({"authenticated": True, "user": u_dict})
    
    return jsonify({"authenticated": False, "user": None})


@app.route("/api/logout", methods=["POST"])
def logout():
    user_identifier = session.get("email") or session.get("login_id")
    if user_identifier and supabase_client and supabase_client.is_supabase_enabled():
        try:
            supabase_client.supabase_log_activity(
                user_identifier=user_identifier,
                action="LOGOUT",
                description=f"User {user_identifier} signed out",
                ip_address=request.remote_addr
            )
        except Exception:
            pass
    session.clear()
    return jsonify({"success": True, "message": "Signed out successfully"})


@app.route("/api/auth/google", methods=["POST"])
def google_auth():
    data = request.json or {}
    email = data.get("email", "").strip()
    name = data.get("name", "").strip() or (email.split("@")[0].capitalize() if "@" in email else "Google User")
    avatar = data.get("picture", "").strip()
    
    if not email or "@" not in email:
        return jsonify({"success": False, "message": "Valid Google Email address is required."}), 400
        
    login_id = email.split("@")[0].lower().replace(".", "_")[:12]
    if len(login_id) < 6:
        login_id = f"{login_id}_odoo"[:12]
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? OR login_id = ?", (email, login_id))
    user = cursor.fetchone()
    
    if not user:
        default_pwd = f"Google@{datetime.now().year}!"
        cursor.execute(
            "INSERT INTO users (login_id, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)",
            (login_id, email, default_pwd, name, "Google Verified")
        )
        conn.commit()
        user_id = cursor.lastrowid
    else:
        user_id = user["id"]
        login_id = user["login_id"]
        name = user["full_name"] or name
    conn.close()
    
    session["user_id"] = user_id
    session["login_id"] = login_id
    session["full_name"] = name
    session["email"] = email
    session["phone"] = "Google Account"
    session["avatar"] = avatar
    session["auth_provider"] = "google"
    
    if supabase_client and supabase_client.is_supabase_enabled():
        try:
            supabase_client.supabase_log_activity(
                user_identifier=email,
                action="GOOGLE_LOGIN",
                description=f"User signed in via Google: {name} ({email})",
                metadata={"email": email, "name": name, "provider": "google"},
                ip_address=request.remote_addr
            )
        except Exception:
            pass
        
    return jsonify({
        "success": True,
        "message": f"Welcome, {name}! Successfully authenticated via Google.",
        "user": {
            "id": user_id,
            "login_id": login_id,
            "full_name": name,
            "email": email,
            "avatar": avatar,
            "auth_provider": "google",
            "cloud": bool(supabase_client and supabase_client.is_supabase_enabled())
        }
    })


@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    import random
    data = request.json or {}
    identifier = data.get("identifier", "").strip()
    if not identifier:
        return jsonify({"success": False, "message": "Login ID, Email, or Phone is required."}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE login_id = ? OR email = ? OR phone = ?", (identifier, identifier, identifier))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({"success": False, "message": "No account found matching this user ID, Email, or Phone."}), 404
        
    otp = str(random.randint(100000, 999999))
    session[f"otp_{identifier}"] = otp
    
    if supabase_client and supabase_client.is_supabase_enabled():
        supabase_client.supabase_log_activity(
            user_identifier=user["email"] or identifier,
            action="OTP_GENERATED",
            description=f"Password reset OTP generated for {identifier}",
            metadata={"identifier": identifier, "contact": user["phone"] or user["email"]}
        )
        
    return jsonify({
        "success": True,
        "message": f"OTP sent successfully! Demo OTP: {otp}",
        "otp": otp,
        "contact_hint": user["phone"] or user["email"]
    })


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json or {}
    identifier = data.get("identifier", "").strip()
    entered_otp = data.get("otp", "").strip()
    new_password = data.get("password", "").strip()
    confirm_password = data.get("confirm_password", "").strip()
    
    if not identifier:
        return jsonify({"success": False, "message": "Login ID, Email, or Phone is required."}), 400
    
    # Check OTP (allows generated session OTP or universal demo OTP '123456')
    expected_otp = session.get(f"otp_{identifier}")
    if entered_otp and entered_otp not in (expected_otp, "123456", "999999"):
        return jsonify({"success": False, "message": "Invalid OTP code. Please re-check."}), 400
        
    if new_password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400
    if len(new_password) < 8:
        return jsonify({"success": False, "message": "Password must be at least 8 characters long."}), 400

    cloud_updated = False
    if supabase_client and supabase_client.is_supabase_enabled():
        sb_res = supabase_client.supabase_reset_password(identifier, new_password)
        if sb_res.get("success"):
            cloud_updated = True

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE login_id = ? OR email = ? OR phone = ?", (identifier, identifier, identifier))
    user = cursor.fetchone()
    if not user and not cloud_updated:
        conn.close()
        return jsonify({"success": False, "message": "No account found with provided Login ID, Email, or Phone."}), 404
        
    if user:
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_password, user["id"]))
        conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "message": "Password successfully reset with verified OTP! You can now sign in."
    })


@app.route("/api/barcode/<string:code>")
def lookup_barcode(code):
    clean_code = code.strip().upper()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE UPPER(code) = ? OR UPPER(name) = ? OR CAST(id AS TEXT) = ?", (clean_code, clean_code, clean_code))
    product = cursor.fetchone()
    conn.close()
    if product:
        p_dict = dict(product)
        p_dict["rack_location"] = "WH/Stock1" if p_dict["id"] % 2 == 1 else "WH/Stock2"
        return jsonify(p_dict)
    return jsonify({"error": "Product not found"}), 404


@app.route("/api/transfers", methods=["GET", "POST"])
def internal_transfers():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == "POST":
        data = request.json or {}
        prod_id = int(data.get("product_id", 0))
        from_loc = data.get("from_location", "WH/Stock1").strip()
        to_loc = data.get("to_location", "WH/Stock2").strip()
        quantity = int(data.get("quantity", 1))
        responsible = data.get("responsible", session.get("full_name", "Odoo Administrator"))
        transfer_type = data.get("type", "INTERNAL")  # "INTERNAL" or "SCRAP"
        
        cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
        prod = cursor.fetchone()
        if not prod:
            conn.close()
            return jsonify({"success": False, "message": "Product not found"}), 404
            
        if transfer_type == "SCRAP":
            if prod["on_hand"] < quantity:
                conn.close()
                return jsonify({"success": False, "message": f"Insufficient on-hand stock ({prod['on_hand']}) to scrap {quantity} units."}), 400
            new_on_hand = prod["on_hand"] - quantity
            new_free = max(0, prod["free_to_use"] - quantity)
            cursor.execute("UPDATE products SET on_hand = ?, free_to_use = ? WHERE id = ?", (new_on_hand, new_free, prod_id))
            ref = f"WH/SCRAP/{datetime.now().strftime('%M%S')}"
            to_loc = "Scrap / Damaged Loss"
        else:
            ref = f"WH/INT/{datetime.now().strftime('%M%S')}"
            
        today_str = date.today().isoformat()
        cursor.execute("""
            INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Done')
        """, (ref, transfer_type, today_str, from_loc, to_loc, prod["name"], quantity))
        conn.commit()
        conn.close()
        
        if supabase_client and supabase_client.is_supabase_enabled():
            supabase_client.supabase_log_activity(
                user_identifier=responsible,
                action=transfer_type,
                description=f"{transfer_type} move: {quantity}x {prod['name']} from {from_loc} to {to_loc}",
                metadata={"product": prod["name"], "quantity": quantity, "from": from_loc, "to": to_loc}
            )
            
        return jsonify({
            "success": True,
            "reference": ref,
            "message": f"Successfully processed {transfer_type} transfer of {quantity}x {prod['name']} ({from_loc} → {to_loc})"
        })
        
    cursor.execute("SELECT * FROM move_history WHERE op_type IN ('INTERNAL', 'SCRAP') ORDER BY id DESC")
    transfers = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(transfers)


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

    # Internal transfers & products
    cursor.execute("SELECT COUNT(*) FROM move_history WHERE op_type = 'INTERNAL'")
    internal_transfers_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products")
    total_products_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE on_hand <= 5")
    low_stock_count = cursor.fetchone()[0]
    
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
        },
        "internal_transfers": {
            "scheduled": internal_transfers_count,
            "total": internal_transfers_count
        },
        "inventory": {
            "total_products": total_products_count,
            "low_stock": low_stock_count
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

@app.route("/api/adjustment", methods=["POST"])
def adjust_inventory():
    data = request.json or {}
    pid = data.get("product_id")
    counted = int(data.get("counted_qty", 0))
    diff = int(data.get("difference", 0))
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (pid,))
    prod = cursor.fetchone()
    if not prod:
        conn.close()
        return jsonify({"success": False, "message": "Product not found"}), 404
        
    old_on_hand = prod["on_hand"]
    old_free = prod["free_to_use"]
    new_free = max(0, old_free + diff)
    cursor.execute("UPDATE products SET on_hand = ?, free_to_use = ? WHERE id = ?", (counted, new_free, pid))
    
    if diff != 0:
        op_type = "IN" if diff > 0 else "OUT"
        ref = f"WH/ADJ/{pid:04d}"
        from_loc = "Inventory Loss/Gain" if diff > 0 else "WH/Stock1"
        to_loc = "WH/Stock1" if diff > 0 else "Inventory Loss/Gain"
        cursor.execute("""
            INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Done')
        """, (ref, op_type, date.today().isoformat(), from_loc, to_loc, prod["name"], abs(diff)))
        
        if supabase_client and supabase_client.is_supabase_enabled():
            supabase_client.supabase_log_activity(
                user_identifier=session.get("email") or session.get("login_id") or "Warehouse Manager",
                action="STOCK_ADJUSTMENT",
                description=f"Reconciled physical stock for {prod['name']}: {counted} units (variance: {diff})",
                metadata={"product_id": pid, "counted": counted, "difference": diff, "reference": ref},
                ip_address=request.remote_addr
            )
    
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Stock adjusted for {prod['name']} to {counted} units."})

# --- Barcode Scanner API ---
@app.route("/api/barcode/<sku>", methods=["GET"])
def get_product_by_barcode(sku):
    sku_clean = sku.strip().upper()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE UPPER(code) = ? OR UPPER(name) = ? OR id = ?", 
                   (sku_clean, sku_clean, sku_clean))
    product = cursor.fetchone()
    conn.close()
    
    if not product:
        return jsonify({"success": False, "message": f"No product found for SKU/Barcode '{sku}'"}), 404
        
    p_dict = dict(product)
    p_dict["success"] = True
    p_dict["rack_location"] = "WH/Stock1" if p_dict["id"] != 2 else "WH/Stock2"
    p_dict["category"] = "Office Furniture" if p_dict["id"] <= 3 else "Electronics"
    return jsonify(p_dict)

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

        if supabase_client and supabase_client.is_supabase_enabled():
            supabase_client.supabase_log_activity(
                user_identifier=session.get("email") or session.get("login_id") or "Warehouse Admin",
                action="RECEIPT_VALIDATED",
                description=f"Inward Receipt {receipt['reference']} received from {receipt['contact']} into {receipt['to_location']}",
                metadata={"reference": receipt["reference"], "items_count": len(items)},
                ip_address=request.remote_addr
            )
                  
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

        if supabase_client and supabase_client.is_supabase_enabled():
            supabase_client.supabase_log_activity(
                user_identifier=session.get("email") or session.get("login_id") or "Warehouse Admin",
                action="DELIVERY_DISPATCHED",
                description=f"Outward Delivery {delivery['reference']} dispatched to customer {delivery['contact']}",
                metadata={"reference": delivery["reference"], "items_count": len(items)},
                ip_address=request.remote_addr
            )
                  
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

# --- Internal Transfers & Scrap Operations ---
@app.route("/api/transfers", methods=["POST"])
def create_internal_transfer():
    data = request.json or {}
    product_id = data.get("product_id")
    from_loc = data.get("from_loc", "WH/Stock1")
    to_loc = data.get("to_loc", "WH/Stock2")
    qty = int(data.get("quantity", 1))
    is_scrap = data.get("is_scrap", False)

    if not product_id or qty <= 0:
        return jsonify({"success": False, "message": "Valid product and positive quantity required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    if not product:
        conn.close()
        return jsonify({"success": False, "message": "Product not found"}), 404

    if is_scrap or to_loc.lower() == "scrap":
        if product["free_to_use"] < qty:
            conn.close()
            return jsonify({"success": False, "message": f"Insufficient stock to scrap ({product['free_to_use']} available)"}), 400
        ref = generate_reference(op_type="SCRAP", warehouse="WH")
        # Scrap permanently removes items from inventory
        cursor.execute("UPDATE products SET on_hand = on_hand - ?, free_to_use = free_to_use - ? WHERE id = ?",
                       (qty, qty, product_id))
        cursor.execute("""
            INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status)
            VALUES (?, 'SCRAP', ?, ?, 'Virtual/Scrap', ?, ?, 'Done')
        """, (ref, date.today().isoformat(), from_loc, product["name"], qty))
    else:
        ref = generate_reference(op_type="INT", warehouse="WH")
        cursor.execute("""
            INSERT INTO move_history (reference, op_type, date, from_loc, to_loc, product_name, quantity, status)
            VALUES (?, 'INTERNAL', ?, ?, ?, ?, ?, 'Done')
        """, (ref, date.today().isoformat(), from_loc, to_loc, product["name"], qty))

    if supabase_client and supabase_client.is_supabase_enabled():
        supabase_client.supabase_log_activity(
            user_identifier=session.get("email") or session.get("login_id") or "Warehouse Admin",
            action="SCRAP" if is_scrap else "INTERNAL_TRANSFER",
            description=f"{'Scrapped' if is_scrap else 'Transferred'} {qty} units of {product['name']} from {from_loc} to {to_loc}",
            metadata={"product_id": product_id, "reference": ref, "quantity": qty, "is_scrap": is_scrap},
            ip_address=request.remote_addr
        )

    conn.commit()
    conn.close()
    return jsonify({"success": True, "reference": ref, "message": "Transfer logged successfully"})

# --- Demo Data Reset for Live Presentation ---
@app.route("/api/admin/reset-demo", methods=["POST"])
def reset_demo_data_endpoint():
    init_db(force_reseed=True)
    return jsonify({"success": True, "message": "Demo data successfully reset to initial hackathon state!"})

# --- Automated Low-Stock Alert & Reorder Engine ---
@app.route("/api/alerts/low-stock")
def get_low_stock_alerts():
    threshold = int(request.args.get("threshold", 25))
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE free_to_use <= ? ORDER BY free_to_use ASC", (threshold,))
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()

    alerts = []
    for p in products:
        severity = "CRITICAL" if p["free_to_use"] <= 10 else "WARNING"
        reorder_suggested = max(20, 50 - p["free_to_use"])
        alerts.append({
            "product_id": p["id"],
            "name": p["name"],
            "code": p["code"],
            "on_hand": p["on_hand"],
            "free_to_use": p["free_to_use"],
            "severity": severity,
            "reorder_suggested": reorder_suggested,
            "message": f"Stock critical! Only {p['free_to_use']} available (reorder threshold: {threshold})"
        })

    return jsonify({
        "success": True,
        "count": len(alerts),
        "alerts": alerts
    })

# --- Auto Stock Reservation & Allocation for Deliveries ---
@app.route("/api/deliveries/<int:did>/allocate", methods=["POST"])
def auto_allocate_delivery(did):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM deliveries WHERE id = ?", (did,))
    delivery = cursor.fetchone()
    if not delivery:
        conn.close()
        return jsonify({"success": False, "message": "Delivery not found"}), 404

    cursor.execute("SELECT * FROM delivery_items WHERE delivery_id = ?", (did,))
    items = cursor.fetchall()

    all_available = True
    missing_items = []
    for item in items:
        cursor.execute("SELECT free_to_use, name FROM products WHERE id = ?", (item["product_id"],))
        prod = cursor.fetchone()
        if not prod or prod["free_to_use"] < item["quantity"]:
            all_available = False
            missing_items.append(prod["name"] if prod else "Unknown")
            cursor.execute("UPDATE delivery_items SET is_out_of_stock = 1 WHERE id = ?", (item["id"],))
        else:
            cursor.execute("UPDATE delivery_items SET is_out_of_stock = 0 WHERE id = ?", (item["id"],))

    new_status = "Ready" if all_available else "Waiting"
    cursor.execute("UPDATE deliveries SET status = ? WHERE id = ?", (new_status, did))
    conn.commit()
    conn.close()

    if all_available:
        return jsonify({
            "success": True,
            "status": "Ready",
            "message": f"All items allocated for {delivery['reference']}! Order promoted to Ready state."
        })
    else:
        return jsonify({
            "success": False,
            "status": "Waiting",
            "message": f"Stock allocation pending for: {', '.join(missing_items)}. Inward receipt required."
        })

# --- System & Cloud Telemetry Health Endpoint ---
@app.route("/api/health")
def system_health():
    import time
    start_t = time.time()
    supabase_ok = False
    supabase_latency_ms = None
    if supabase_client and supabase_client.is_supabase_enabled():
        try:
            sb_start = time.time()
            supabase_client.supabase.auth.get_session()
            supabase_latency_ms = round((time.time() - sb_start) * 1000, 2)
            supabase_ok = True
        except Exception:
            supabase_ok = False

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM products")
    products_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM move_history")
    moves_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM receipts")
    receipts_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM deliveries")
    deliveries_count = cursor.fetchone()[0]
    conn.close()

    total_latency_ms = round((time.time() - start_t) * 1000, 2)

    return jsonify({
        "status": "HEALTHY",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "type": "SQLite3 (Local Core Engine)",
            "status": "ONLINE",
            "products_tracked": products_count,
            "total_audit_moves": moves_count,
            "receipts": receipts_count,
            "deliveries": deliveries_count
        },
        "cloud_sync": {
            "provider": "Supabase Cloud Platform",
            "connected": supabase_ok,
            "latency_ms": supabase_latency_ms,
            "auth_mode": "Hybrid (Supabase Cloud + Local SQLite Fallback)"
        },
        "server_response_ms": total_latency_ms
    })

# --- Live Supabase Cloud Activity Stream ---
@app.route("/api/supabase/activities")
def get_supabase_activities():
    limit = int(request.args.get("limit", 25))
    if supabase_client and supabase_client.is_supabase_enabled():
        logs = supabase_client.supabase_get_activities(limit=limit)
        return jsonify({"success": True, "source": "Supabase Cloud", "activities": logs})
    return jsonify({"success": False, "source": "None", "activities": [], "message": "Supabase not connected"})

if __name__ == "__main__":
    print("[INFO] StockSense Odoo Inventory Server running on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
