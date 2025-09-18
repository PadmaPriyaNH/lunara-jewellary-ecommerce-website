from __future__ import annotations
from flask import Blueprint, jsonify, request, current_app
from ..services.db import load_json, save_json

bp = Blueprint('newsletter', __name__)


@bp.post('/subscribe')
def subscribe():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Invalid email address'})

    data_dir = current_app.config.get('DATA_DIR', 'data')
    subscribers = load_json(data_dir, 'subscribers.json', [])

    if email in subscribers:
        return jsonify({'success': False, 'message': 'Email already subscribed'})

    subscribers.append(email)
    save_json(data_dir, 'subscribers.json', subscribers)

    discount_code = f"LUNARA10-{email.split('@')[0][:3].upper()}"
    return jsonify({'success': True, 'discount_code': discount_code})
