from __future__ import annotations
from flask import Blueprint, jsonify, request, current_app
from ..services.db import load_json

bp = Blueprint('products', __name__)


@bp.get('/products')
def get_products():
    category = request.args.get('category', 'all')
    data_dir = current_app.config.get('DATA_DIR', 'data')
    products = load_json(data_dir, 'products.json', [])
    if category == 'all':
        return jsonify(products)
    filtered = [p for p in products if p.get('category') == category]
    return jsonify(filtered)
