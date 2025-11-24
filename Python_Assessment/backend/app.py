from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pdf_generator import generate_pdf
import subprocess
import uuid
import os

app = Flask(__name__)
CORS(app)

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
    FALLBACK_WEIGHT = 53.6
    mac = "DA:1C:78:A1:42:FB"

    exe_path = os.path.join(os.path.dirname(__file__), "hn_30012.exe")

    try:
        result = subprocess.run(
            [exe_path, mac],
            capture_output=True,
            text=True,
            timeout=15
        )

        stdout = result.stdout.strip()
        stderr = result.stderr.strip()
        if not stdout:
            return jsonify({
                "weightKg": FALLBACK_WEIGHT,
                "note": "No output from EXE. Using fallback weight."
            }), 200

        import re
        match = re.search(r'"value"\s*:\s*([0-9]+(?:\.[0-9]+)?)', stdout)

        if not match:
            return jsonify({
                "weightKg": FALLBACK_WEIGHT,
                "note": "No weight found in output. Using fallback.",
                "raw": stdout
            }), 200

        weight = float(match.group(1))

        return jsonify({
            "weightKg": weight,
            "raw": stdout,
            "stderr": stderr,
            "return_code": result.returncode
        }), 200

    except Exception as e:
        return jsonify({
            "weightKg": FALLBACK_WEIGHT,
            "note": "Exception occurred, using fallback.",
            "error": str(e)
        }), 200

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
