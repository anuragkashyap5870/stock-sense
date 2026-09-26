import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[INFO] Successfully connected to Supabase Cloud: {SUPABASE_URL}")
    except Exception as e:
        print(f"[WARN] Failed to initialize Supabase client: {e}")
        supabase = None


def is_supabase_enabled() -> bool:
    return supabase is not None


def supabase_signup(login_id: str, email: str, password: str, full_name: str, phone: str = None):
    """
    Registers a new user directly in Supabase Cloud Authentication.
    Uses admin.create_user with email_confirm=True for instant access without waiting for email link.
    """
    if not supabase:
        return {"success": False, "message": "Supabase client not initialized"}

    try:
        metadata = {
            "login_id": login_id,
            "full_name": full_name or login_id.capitalize(),
        }
        if phone:
            metadata["phone"] = phone

        user_payload = {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": metadata
        }

        res = supabase.auth.admin.create_user(user_payload)
        user = res.user
        return {
            "success": True,
            "user": {
                "id": user.id,
                "login_id": login_id,
                "email": user.email,
                "full_name": metadata["full_name"],
                "phone": phone or ""
            }
        }
    except Exception as err:
        err_msg = str(err)
        if "already registered" in err_msg.lower() or "unique" in err_msg.lower():
            return {"success": False, "message": "User with this email already exists in Supabase."}
        return {"success": False, "message": f"Supabase Auth error: {err_msg}"}


def supabase_signin(identifier: str, password: str):
    """
    Authenticates user with Supabase Cloud. Supports Login ID, Email, or Phone.
    """
    if not supabase:
        return {"success": False, "message": "Supabase not connected"}

    try:
        email_to_use = identifier
        login_id = identifier
        full_name = identifier.capitalize()
        phone = ""

        # If user entered a login_id or phone instead of email, find their email from Supabase users
        if "@" not in identifier:
            users_list = supabase.auth.admin.list_users()
            found_user = None
            for u in users_list:
                meta = u.user_metadata or {}
                if meta.get("login_id") == identifier or meta.get("phone") == identifier:
                    found_user = u
                    break
            
            if found_user:
                email_to_use = found_user.email
                login_id = (found_user.user_metadata or {}).get("login_id", identifier)
                full_name = (found_user.user_metadata or {}).get("full_name", login_id)
                phone = (found_user.user_metadata or {}).get("phone", "")
            else:
                return {"success": False, "message": "No account found with this Login ID or Phone in Supabase."}

        # Sign in with email and password
        auth_res = supabase.auth.sign_in_with_password({
            "email": email_to_use,
            "password": password
        })

        user = auth_res.user
        meta = user.user_metadata or {}

        return {
            "success": True,
            "user": {
                "id": user.id,
                "login_id": meta.get("login_id", login_id),
                "email": user.email,
                "full_name": meta.get("full_name", full_name),
                "phone": meta.get("phone", phone)
            }
        }
    except Exception as err:
        return {"success": False, "message": "Invalid credentials or password mismatch in Supabase."}


def supabase_reset_password(identifier: str, new_password: str):
    """
    Resets user password in Supabase Cloud Authentication.
    """
    if not supabase:
        return {"success": False, "message": "Supabase not connected"}

    try:
        users_list = supabase.auth.admin.list_users()
        target_user = None
        for u in users_list:
            if u.email == identifier:
                target_user = u
                break
            meta = u.user_metadata or {}
            if meta.get("login_id") == identifier or meta.get("phone") == identifier:
                target_user = u
                break

        if not target_user:
            return {"success": False, "message": "No user found with provided identifier in Supabase."}

        supabase.auth.admin.update_user_by_id(target_user.id, {"password": new_password})
        return {"success": True, "message": "Password successfully updated in Supabase Cloud!"}
    except Exception as err:
        return {"success": False, "message": f"Error updating password: {err}"}


def supabase_log_activity(user_identifier: str, action: str, description: str, metadata: dict = None, ip_address: str = None):
    """
    Logs an event, user login, or warehouse operation in the Supabase Cloud 'activity_logs' table.
    Gracefully falls back if table is pending creation in Supabase SQL editor.
    """
    if not supabase:
        return False
    try:
        payload = {
            "user_identifier": user_identifier or "System",
            "action": action,
            "description": description,
            "metadata": metadata or {},
            "ip_address": ip_address or "127.0.0.1"
        }
        supabase.table("activity_logs").insert(payload).execute()
        return True
    except Exception as e:
        print(f"[SUPABASE LOG] {action} by {user_identifier}: {description} (Notice: {e})")
        return False


def supabase_get_activities(limit: int = 25):
    """
    Fetches the latest activity logs from Supabase Cloud for live monitoring.
    """
    if not supabase:
        return []
    try:
        res = supabase.table("activity_logs").select("*").order("created_at", desc=True).limit(limit).execute()
        return res.data or []
    except Exception as e:
        return []

