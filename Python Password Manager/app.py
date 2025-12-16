from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import json
import os
import random

# Your helper modules
from hash_with_bcrypt import hash_password, check_password
from AES import encrypt, decrypt
from random_pass import PasswordGenerator
from password_strength import check_password_strength
from OTP import generate_8_digit_otp
from email_sender import send_otp_email  # <--- IMPORT EMAIL SENDER

app = Flask(__name__)
CORS(app)  # Enable CORS
app.secret_key = 'your_very_secret_key_here_change_this'  # <--- ADDED for sessions

USERS_FILE = "users.json"
SECURED_FILE = "secured.json"

# --- Email Config (from login.py) ---
SENDER_EMAIL = "bhattrohit4123@gmail.com"
APP_PASSWORD = "xyrw tyfe entv xhgz"


# --- Helper Functions ---
def load_data(filename):
    if not os.path.exists(filename):
        return {}
    try:
        with open(filename, "r") as file:
            return json.load(file)
    except json.JSONDecodeError:
        return {}


def save_data(filename, data):
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)


# --- Main Page ---
@app.route('/')
def index():
    return render_template('index.html')


# --- API Endpoints ---

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    master_password = data.get('master_password')
    email = data.get('email')  # <--- ADDED EMAIL

    if not username or not password or not master_password or not email:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    users = load_data(USERS_FILE)
    if username in users:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

    # SECURE: Hash both passwords
    hashed_login_pw = hash_password(password).decode('utf-8')
    hashed_master_pw = hash_password(master_password).decode('utf-8')

    users[username] = {
        "login_hash": hashed_login_pw,
        "master_hash": hashed_master_pw,
        "email": email  # <--- ADDED EMAIL
    }
    save_data(USERS_FILE, users)

    return jsonify({'success': True, 'message': 'User registered successfully!'})


@app.route('/api/login', methods=['POST'])
def api_login():
    # This is the standard password login
    data = request.json
    username = data.get('username')
    password = data.get('password')
    master_password = data.get('master_password')

    users = load_data(USERS_FILE)

    if username not in users:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    user_data = users[username]

    # Check both hashed passwords
    if (check_password(password, user_data.get("login_hash", "").encode('utf-8')) and
            check_password(master_password, user_data.get("master_hash", "").encode('utf-8'))):

        return jsonify({'success': True, 'message': f'Welcome back, {username}!'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401


# --- NEW OTP LOGIN ENDPOINTS ---

@app.route('/api/login/otp/start', methods=['POST'])
def api_otp_start():
    data = request.json
    username = data.get('username')

    users = load_data(USERS_FILE)
    if username not in users:
        return jsonify({'success': False, 'message': 'Username not found'}), 404

    user_email = users[username].get("email")
    if not user_email:
        return jsonify({'success': False, 'message': 'No email registered for this user'}), 400

    # Send the OTP
    otp_sent = send_otp_email(SENDER_EMAIL, APP_PASSWORD, user_email)

    if otp_sent:
        # Store the OTP in the server's session
        session[f'otp_for_{username}'] = otp_sent
        return jsonify({'success': True, 'message': 'OTP sent to your registered email.'})
    else:
        return jsonify({'success': False, 'message': 'Failed to send OTP email.'}), 500


@app.route('/api/login/otp/verify', methods=['POST'])
def api_otp_verify():
    data = request.json
    username = data.get('username')
    otp = data.get('otp')
    master_password = data.get('master_password')

    users = load_data(USERS_FILE)
    if username not in users:
        return jsonify({'success': False, 'message': 'Invalid user'}), 401

    # 1. Verify OTP
    stored_otp = session.get(f'otp_for_{username}')
    if not stored_otp or stored_otp != otp:
        return jsonify({'success': False, 'message': 'Invalid or expired OTP'}), 401

    # 2. Verify Master Password (still required!)
    user_data = users[username]
    if not check_password(master_password, user_data.get("master_hash", "").encode('utf-8')):
        return jsonify({'success': False, 'message': 'Invalid master password'}), 401

    # --- Success! ---
    # Clear the OTP from session
    session.pop(f'otp_for_{username}', None)

    return jsonify({'success': True, 'message': f'Welcome back, {username}!'})


# --- Other Endpoints (Unchanged) ---

@app.route('/api/suggest-password', methods=['GET'])
def api_suggest_password():
    try:
        length = int(request.args.get('length', 16))
    except ValueError:
        length = 16
    new_password = PasswordGenerator.generate(length=length)
    return jsonify({'success': True, 'password': new_password})


@app.route('/api/check-strength', methods=['POST'])
def api_check_strength():
    password = request.json.get('password', '')
    result = check_password_strength(password)
    return jsonify({'success': True, 'score': result['score'], 'verdict': result['verdict']})


@app.route('/api/accounts', methods=['POST'])
def api_add_account():
    data = request.json
    username = data.get('username')
    master_password = data.get('master_password')
    site = data.get('site')
    site_username = data.get('site_username')
    site_password = data.get('site_password')

    users = load_data(USERS_FILE)
    if username not in users or not check_password(master_password,
                                                   users[username].get("master_hash", "").encode('utf-8')):
        return jsonify({'success': False, 'message': 'Invalid master password'}), 401

    encrypted_password = encrypt(f"{site_username}::{site_password}", master_password)

    accounts = load_data(SECURED_FILE)
    if username not in accounts:
        accounts[username] = {}

    accounts[username][site] = encrypted_password
    save_data(SECURED_FILE, accounts)
    return jsonify({'success': True, 'message': 'Account added successfully!'})


@app.route('/api/accounts/all', methods=['POST'])
def api_get_accounts():
    data = request.json
    username = data.get('username')
    master_password = data.get('master_password')

    users = load_data(USERS_FILE)
    if username not in users or not check_password(master_password,
                                                   users[username].get("master_hash", "").encode('utf-8')):
        return jsonify({'success': False, 'message': 'Invalid master password'}), 401

    accounts = load_data(SECURED_FILE)
    user_accounts = accounts.get(username, {})
    decrypted_list = []
    for site, enc_data in user_accounts.items():
        try:
            decrypted = decrypt(enc_data, master_password)
            parts = decrypted.split('::', 1)
            if len(parts) == 2:
                site_user, site_pass = parts
            else:
                site_user, site_pass = "N/A", decrypted
            decrypted_list.append({"site": site, "username": site_user, "password": site_pass})
        except Exception:
            decrypted_list.append({"site": site, "username": "Error", "password": "Could not decrypt"})
    return jsonify({'success': True, 'accounts': decrypted_list})


@app.route('/api/accounts', methods=['DELETE'])
def api_delete_account():
    data = request.json
    username = data.get('username')
    master_password = data.get('master_password')
    site = data.get('site')

    users = load_data(USERS_FILE)
    if username not in users or not check_password(master_password,
                                                   users[username].get("master_hash", "").encode('utf-8')):
        return jsonify({'success': False, 'message': 'Invalid master password'}), 401

    accounts = load_data(SECURED_FILE)
    if username in accounts and site in accounts[username]:
        del accounts[username][site]
        save_data(SECURED_FILE, accounts)
        return jsonify({'success': True, 'message': f'Account "{site}" deleted'})
    else:
        return jsonify({'success': False, 'message': 'Account not found'}), 404


@app.route('/api/suggest-pin', methods=['GET'])
def api_suggest_pin():
    new_pin = generate_8_digit_otp()
    return jsonify({'success': True, 'pin': new_pin})


if __name__ == '__main__':
    app.run(port=8080, debug=True)