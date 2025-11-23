from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pdf_generator import generate_pdf
import subprocess
import uuid
import os

app = Flask(__name__)
CORS(app)

# simple in-memory user store: id -> user dict
USERS = {}

API_PREFIX = "/api"

@app.route(API_PREFIX + "/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    # basic validation
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name required"}), 400

    # create or update user by email if provided, else generate id
    email = data.get("email")
    user_id = None
    if email:
        # find existing by email
        for uid, u in USERS.items():
            if u.get("email") == email:
                user_id = uid
                break

    if not user_id:
        user_id = str(uuid.uuid4())

    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "age": data.get("age"),
        "gender": data.get("gender"),
        "heightCm": data.get("heightCm"),
        "weightKg": data.get("weightKg")  # optional
    }
    USERS[user_id] = user
    return jsonify({"user": user}), 200

@app.route(API_PREFIX + "/run-exe", methods=["POST"])
def run_exe():
    """
    Runs the scale exe on the server and returns weight as e.g. {'weightKg': 72.4}
    Update EXE_PATH to your real exe location.
    The EXE is expected to print the weight as plain text, e.g. "72.4"
    """
    EXE_PATH = r"C:\path\to\scale.exe"  # <<-- update this path for your environment
    if not os.path.exists(EXE_PATH):
        return jsonify({"error": f"Scale exe not found at {EXE_PATH}"}), 500

    try:
        out = subprocess.check_output([EXE_PATH], text=True, stderr=subprocess.STDOUT, timeout=10)
        # parse first float in output
        import re
        m = re.search(r"(\d+(?:\.\d+)?)", out)
        if not m:
            return jsonify({"error": "No numeric weight found in exe output", "raw": out}), 500
        weight = float(m.group(1))
        return jsonify({"weightKg": weight}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "exe failed", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route(API_PREFIX + "/measure-bmi", methods=["POST"])
def measure_bmi():
    """
    payload: { userId, heightCm (optional override), weightKg (optional if provided by frontend) }
    Returns measurement and updated user.
    """
    data = request.get_json() or {}
    user_id = data.get("userId")
    if not user_id or user_id not in USERS:
        return jsonify({"error": "userId missing or not found"}), 400

    user = USERS[user_id]
    height = data.get("heightCm") or user.get("heightCm")
    weight = data.get("weightKg") or user.get("weightKg")
    try:
        height_m = float(height) / 100.0
        weight_f = float(weight)
        bmi = round(weight_f / (height_m ** 2), 2)
    except Exception:
        return jsonify({"error": "Invalid height or weight provided"}), 400

    # categorize
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    measurement = {
        "weightKg": weight_f,
        "heightCm": float(height),
        "bmi": bmi,
        "category": category
    }

    # update user stored info
    user["heightCm"] = float(height)
    user["weightKg"] = weight_f
    USERS[user_id] = user

    # generate pdf (will write bmi_report_<userId>.pdf)
    pdf_path = generate_pdf(user, measurement, output_path=f"backend/bmi_report_{user_id}.pdf")

    return jsonify({"user": user, "measurement": measurement, "pdf": pdf_path}), 200

@app.route(API_PREFIX + "/report/<user_id>", methods=["GET"])
def report(user_id):
    path = f"backend/bmi_report_{user_id}.pdf"
    if not os.path.exists(path):
        return jsonify({"error": "Report not found"}), 404
    return send_file(path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
