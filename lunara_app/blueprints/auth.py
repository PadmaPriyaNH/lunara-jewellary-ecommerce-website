from __future__ import annotations
from dataclasses import asdict
from datetime import datetime
import uuid
from flask import Blueprint, jsonify, request, session, current_app
from ..services.db import load_json, save_json

bp = Blueprint('auth', __name__)


def hash_password(password: str) -> str:
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password: str, hashed: str) -> bool:
    import bcrypt
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


@bp.post('/register')
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'})
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})

    data_dir = current_app.config.get('DATA_DIR', 'data')
    users = load_json(data_dir, 'users.json', [])

    if any(u.get('email') == email for u in users):
        return jsonify({'success': False, 'message': 'Email already registered'})

    user = {
        'id': str(uuid.uuid4()),
        'name': name,
        'email': email,
        'password': hash_password(password),
        'created_at': datetime.now().isoformat()
    }
    users.append(user)
    save_json(data_dir, 'users.json', users)

    session['user_id'] = user['id']
    return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}})


@bp.post('/login')
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '')

    data_dir = current_app.config.get('DATA_DIR', 'data')
    users = load_json(data_dir, 'users.json', [])

    user = next((u for u in users if u.get('email') == email), None)
    if user and check_password(password, user.get('password', '')):
        session['user_id'] = user['id']
        return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}})
    return jsonify({'success': False, 'message': 'Invalid email or password'})


@bp.post('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})


@bp.get('/user')
def current_user():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'})

    data_dir = current_app.config.get('DATA_DIR', 'data')
    users = load_json(data_dir, 'users.json', [])
    user = next((u for u in users if u.get('id') == session['user_id']), None)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'})
    return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}})
