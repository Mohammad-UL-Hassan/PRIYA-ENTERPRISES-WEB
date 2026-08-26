from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from functools import wraps
import json
import os
import re
import time


# =========================================================
# PRIYA ENTERPRISES
# PRODUCTION-READY FLASK BACKEND
# =========================================================

app = Flask(__name__)


# =========================================================
# CONFIGURATION
# =========================================================

APP_VERSION = "2.0.0"

BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "inquiries.json"

# Optional admin API key.
#
# For production, set this as an environment variable:
#
# Windows:
# set PRIYA_ADMIN_KEY=your-secret-key
#
# Linux / Render:
# PRIYA_ADMIN_KEY=your-secret-key
#
ADMIN_API_KEY = os.environ.get("PRIYA_ADMIN_KEY", "")

# Allowed frontend origins.
#
# For development:
# http://127.0.0.1:5500
# http://localhost:5500
#
# For production, set:
#
# PRIYA_ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
#
DEFAULT_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://127.0.0.1:5000",
    "http://localhost:5000",
]
ENV_ORIGINS = os.environ.get("PRIYA_ALLOWED_ORIGINS", "")

if ENV_ORIGINS.strip():

    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in ENV_ORIGINS.split(",")
        if origin.strip()
    ]

else:

    ALLOWED_ORIGINS = DEFAULT_ORIGINS


# =========================================================
# CORS
# =========================================================

CORS(app)

@app.after_request
def add_cors_headers(response):

    origin = request.headers.get("Origin")

    if origin in ALLOWED_ORIGINS:

        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization"
        )
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"

    return response


# =========================================================
# THREAD LOCK
# =========================================================

file_lock = Lock()


# =========================================================
# SIMPLE RATE LIMITER
# =========================================================
#
# This prevents accidental repeated submissions.
#
# It is intentionally simple because this application
# uses JSON storage instead of Redis/database storage.
# =========================================================

RATE_LIMIT_SECONDS = 20

recent_requests = {}


def get_client_ip():

    forwarded = request.headers.get("X-Forwarded-For")

    if forwarded:

        return forwarded.split(",")[0].strip()

    return request.remote_addr or "unknown"


def rate_limit():

    ip = get_client_ip()

    current_time = time.time()

    previous_time = recent_requests.get(ip)

    if previous_time:

        elapsed = current_time - previous_time

        if elapsed < RATE_LIMIT_SECONDS:

            return False

    recent_requests[ip] = current_time

    # Cleanup old entries

    expired = [

        address

        for address, timestamp in recent_requests.items()

        if current_time - timestamp > RATE_LIMIT_SECONDS * 3

    ]

    for address in expired:

        recent_requests.pop(address, None)

    return True


# =========================================================
# JSON STORAGE
# =========================================================

def ensure_data_file():

    if not DATA_FILE.exists():

        with file_lock:

            if not DATA_FILE.exists():

                DATA_FILE.write_text(
                    "[]",
                    encoding="utf-8"
                )


def load_inquiries():

    ensure_data_file()

    try:

        with file_lock:

            raw_data = DATA_FILE.read_text(
                encoding="utf-8"
            )

            data = json.loads(raw_data)

        if isinstance(data, list):

            return data

        return []

    except (
        json.JSONDecodeError,
        OSError,
        TypeError
    ):

        return []


def save_inquiries(inquiries):

    ensure_data_file()

    temporary_file = DATA_FILE.with_suffix(".tmp")

    data = json.dumps(
        inquiries,
        indent=4,
        ensure_ascii=False
    )

    with file_lock:

        temporary_file.write_text(
            data,
            encoding="utf-8"
        )

        temporary_file.replace(DATA_FILE)


# =========================================================
# INPUT CLEANING
# =========================================================

def clean_text(value, max_length=500):

    if value is None:

        return ""

    value = str(value).strip()

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value[:max_length]


def valid_email(email):

    if not email:

        return True

    pattern = (
        r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )

    return re.match(
        pattern,
        email
    ) is not None


def normalize_phone(phone):

    if not phone:

        return ""

    cleaned = re.sub(
        r"\D",
        "",
        str(phone)
    )

    # +91XXXXXXXXXX / 91XXXXXXXXXX

    if (
        cleaned.startswith("91")
        and len(cleaned) == 12
    ):

        cleaned = cleaned[2:]

    return cleaned


def valid_phone(phone):

    cleaned = normalize_phone(phone)

    return (
        len(cleaned) == 10
        and cleaned[0] in "6789"
    )


# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

def require_admin_key(function):

    @wraps(function)
    def wrapper(*args, **kwargs):

        # If no admin key has been configured,
        # admin endpoints remain disabled.

        if not ADMIN_API_KEY:

            return jsonify({
                "success": False,
                "error": "Admin access is not configured."
            }), 503

        supplied_key = request.headers.get(
            "X-Admin-Key",
            ""
        )

        if supplied_key != ADMIN_API_KEY:

            return jsonify({
                "success": False,
                "error": "Unauthorized."
            }), 401

        return function(*args, **kwargs)

    return wrapper


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "success": True,

        "service":
            "Priya Enterprises Backend",

        "status":
            "ONLINE",

        "version":
            APP_VERSION,

        "message":
            "Priya Enterprises API is running."

    })


# =========================================================
# API STATUS
# =========================================================

@app.route("/api/status", methods=["GET"])
def api_status():

    inquiries = load_inquiries()

    return jsonify({

        "success": True,

        "status": "ONLINE",

        "service":
            "Priya Enterprises API",

        "version":
            APP_VERSION,

        "total_inquiries":
            len(inquiries),

        "timestamp":
            datetime.now(
                timezone.utc
            ).isoformat()

    })


# =========================================================
# CREATE INQUIRY
# =========================================================

@app.route(
    "/api/inquiries",
    methods=["POST"]
)
def create_inquiry():

    # -----------------------------------------------------
    # RATE LIMIT
    # -----------------------------------------------------

    if not rate_limit():

        return jsonify({

            "success": False,

            "error":
                "Please wait a few seconds before "
                "sending another enquiry."

        }), 429


    # -----------------------------------------------------
    # CONTENT TYPE
    # -----------------------------------------------------

    if not request.is_json:

        return jsonify({

            "success": False,

            "error":
                "Request must contain JSON data."

        }), 400


    # -----------------------------------------------------
    # JSON DATA
    # -----------------------------------------------------

    data = request.get_json(
        silent=True
    )

    if not isinstance(data, dict):

        return jsonify({

            "success": False,

            "error":
                "Invalid request data."

        }), 400


    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    name = clean_text(
        data.get("name"),
        100
    )

    phone = clean_text(
        data.get("phone"),
        30
    )

    email = clean_text(
        data.get("email"),
        150
    )

    material = clean_text(
        data.get("material"),
        100
    )

    message = clean_text(
        data.get("message"),
        1000
    )


    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not name:

        return jsonify({

            "success": False,

            "error":
                "Please enter your name."

        }), 400


    if len(name) < 2:

        return jsonify({

            "success": False,

            "error":
                "Name must contain at least 2 characters."

        }), 400


    if not phone:

        return jsonify({

            "success": False,

            "error":
                "Please enter your phone number."

        }), 400


    if not valid_phone(phone):

        return jsonify({

            "success": False,

            "error":
                "Please enter a valid Indian mobile number."

        }), 400


    if email and not valid_email(email):

        return jsonify({

            "success": False,

            "error":
                "Please enter a valid email address."

        }), 400


    if not material:

        return jsonify({

            "success": False,

            "error":
                "Please select the material you are interested in."

        }), 400


    if not message:

        return jsonify({

            "success": False,

            "error":
                "Please enter your enquiry."

        }), 400


    if len(message) < 3:

        return jsonify({

            "success": False,

            "error":
                "Please enter a little more information."

        }), 400


    # -----------------------------------------------------
    # NORMALIZE PHONE
    # -----------------------------------------------------

    normalized_phone = normalize_phone(
        phone
    )


    # -----------------------------------------------------
    # LOAD EXISTING INQUIRIES
    # -----------------------------------------------------

    inquiries = load_inquiries()


    # -----------------------------------------------------
    # CREATE UNIQUE ID
    # -----------------------------------------------------

    timestamp = datetime.now(
        timezone.utc
    )

    inquiry_id = (

        "PE-"

        + timestamp.strftime(
            "%Y%m%d%H%M%S"
        )

        + "-"

        + f"{len(inquiries) + 1:04d}"

    )


    # -----------------------------------------------------
    # CREATE RECORD
    # -----------------------------------------------------

    inquiry = {

        "id":
            inquiry_id,

        "name":
            name,

        "phone":
            normalized_phone,

        "email":
            email,

        "material":
            material,

        "message":
            message,

        "status":
            "new",

        "created_at":
            timestamp.isoformat()

    }


    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    inquiries.append(
        inquiry
    )

    try:

        save_inquiries(
            inquiries
        )

    except OSError:

        return jsonify({

            "success": False,

            "error":
                "Unable to save your enquiry. "
                "Please try again."

        }), 500


    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    return jsonify({

        "success":
            True,

        "message":
            "Thank you! Your enquiry has been received. "
            "Priya Enterprises will contact you soon.",

        "inquiry": {

            "id":
                inquiry["id"],

            "status":
                inquiry["status"],

            "created_at":
                inquiry["created_at"]

        }

    }), 201


# =========================================================
# GET ALL INQUIRIES
# =========================================================
#
# PROTECTED ENDPOINT
# =========================================================

@app.route(
    "/api/inquiries",
    methods=["GET"]
)
@require_admin_key
def get_inquiries():

    inquiries = load_inquiries()

    return jsonify({

        "success":
            True,

        "count":
            len(inquiries),

        "inquiries":
            inquiries

    })


# =========================================================
# GET SINGLE INQUIRY
# =========================================================

@app.route(
    "/api/inquiries/<inquiry_id>",
    methods=["GET"]
)
@require_admin_key
def get_single_inquiry(inquiry_id):

    inquiries = load_inquiries()

    for inquiry in inquiries:

        if inquiry.get("id") == inquiry_id:

            return jsonify({

                "success":
                    True,

                "inquiry":
                    inquiry

            })


    return jsonify({

        "success":
            False,

        "error":
            "Inquiry not found."

    }), 404


# =========================================================
# UPDATE INQUIRY STATUS
# =========================================================

@app.route(
    "/api/inquiries/<inquiry_id>",
    methods=["PATCH"]
)
@require_admin_key
def update_inquiry(inquiry_id):

    if not request.is_json:

        return jsonify({

            "success":
                False,

            "error":
                "Request must contain JSON data."

        }), 400


    data = request.get_json(
        silent=True
    )

    if not isinstance(data, dict):

        return jsonify({

            "success":
                False,

            "error":
                "Invalid request data."

        }), 400


    new_status = clean_text(
        data.get("status"),
        30
    ).lower()


    allowed_statuses = {
        "new",
        "contacted",
        "completed",
        "cancelled"
    }


    if new_status not in allowed_statuses:

        return jsonify({

            "success":
                False,

            "error":
                "Invalid inquiry status."

        }), 400


    inquiries = load_inquiries()


    for inquiry in inquiries:

        if inquiry.get("id") == inquiry_id:

            inquiry["status"] = new_status

            inquiry["updated_at"] = (
                datetime.now(
                    timezone.utc
                ).isoformat()
            )

            try:

                save_inquiries(
                    inquiries
                )

            except OSError:

                return jsonify({

                    "success":
                        False,

                    "error":
                        "Unable to update inquiry."

                }), 500


            return jsonify({

                "success":
                    True,

                "message":
                    "Inquiry updated successfully.",

                "inquiry":
                    inquiry

            })


    return jsonify({

        "success":
            False,

        "error":
            "Inquiry not found."

    }), 404


# =========================================================
# DELETE INQUIRY
# =========================================================

@app.route(
    "/api/inquiries/<inquiry_id>",
    methods=["DELETE"]
)
@require_admin_key
def delete_inquiry(inquiry_id):

    inquiries = load_inquiries()

    updated = [

        inquiry

        for inquiry in inquiries

        if inquiry.get("id") != inquiry_id

    ]


    if len(updated) == len(inquiries):

        return jsonify({

            "success":
                False,

            "error":
                "Inquiry not found."

        }), 404


    try:

        save_inquiries(
            updated
        )

    except OSError:

        return jsonify({

            "success":
                False,

            "error":
                "Unable to delete inquiry."

        }), 500


    return jsonify({

        "success":
            True,

        "message":
            "Inquiry deleted successfully."

    })


# =========================================================
# 404 HANDLER
# =========================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "success":
            False,

        "error":
            "API endpoint not found."

    }), 404


# =========================================================
# 405 HANDLER
# =========================================================

@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({

        "success":
            False,

        "error":
            "HTTP method not allowed."

    }), 405


# =========================================================
# 500 HANDLER
# =========================================================

@app.errorhandler(500)
def internal_error(error):

    return jsonify({

        "success":
            False,

        "error":
            "Internal server error."

    }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    ensure_data_file()

    print()
    print("=" * 60)
    print("       PRIYA ENTERPRISES — BACKEND SERVER")
    print("=" * 60)
    print("Status  : ONLINE")
    print("Version : " + APP_VERSION)
    print("Home    : http://127.0.0.1:5000")
    print("API     : http://127.0.0.1:5000/api/inquiries")
    print("Status  : http://127.0.0.1:5000/api/status")
    print("=" * 60)
    print()

    app.run(
        host="0.0.0.0",
        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),
        debug=False
    )