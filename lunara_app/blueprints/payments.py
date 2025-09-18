from __future__ import annotations
from datetime import datetime
import uuid
from flask import Blueprint, jsonify, request, session, current_app
from ..services.db import load_json, save_json

bp = Blueprint('payments', __name__)


@bp.post('/process-payment')
def process_payment():
    data = request.get_json() or {}
    user_id = session.get('user_id', 'guest')

    method = data.get('method')
    amount = float(data.get('amount') or 0)
    items = data.get('items') or []

    if amount <= 0 or not items:
        return jsonify({'success': False, 'message': 'Invalid order details'})

    # Mock processing (90% success)
    import random
    if random.random() >= 0.1:
        order_id = str(uuid.uuid4())
        order = {
            'id': order_id,
            'user_id': user_id,
            'items': items,
            'total': amount,
            'status': 'confirmed',
            'payment_method': method,
            'created_at': datetime.now().isoformat()
        }
        data_dir = current_app.config.get('DATA_DIR', 'data')
        orders = load_json(data_dir, 'orders.json', [])
        orders.append(order)
        save_json(data_dir, 'orders.json', orders)
        return jsonify({'success': True, 'orderId': order_id})

    return jsonify({'success': False, 'message': 'Payment declined. Please check your payment details.'})


@bp.get('/order/<order_id>')
def get_order(order_id: str):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please log in to view your orders'})
    data_dir = current_app.config.get('DATA_DIR', 'data')
    orders = load_json(data_dir, 'orders.json', [])
    order = next((o for o in orders if o.get('id') == order_id and o.get('user_id') == session['user_id']), None)
    if order:
        return jsonify({'success': True, 'order': order})
    return jsonify({'success': False, 'message': 'Order not found'})


@bp.get('/orders')
def get_orders():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please log in to view your orders'})
    data_dir = current_app.config.get('DATA_DIR', 'data')
    orders = load_json(data_dir, 'orders.json', [])
    user_orders = [o for o in orders if o.get('user_id') == session['user_id']]
    return jsonify({'success': True, 'orders': user_orders})
