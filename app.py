"""
Lunara Jewellery - Flask Entrypoint
Bootstraps the modular application using the application factory pattern.

Author: N H Padma Priya
"""
from __future__ import annotations
import os
from lunara_app import create_app

__author__ = "N H Padma Priya"

app = create_app()


if __name__ == '__main__':
    # Respect env var for port/debug in local dev; production uses WSGI server (e.g., gunicorn)
    port = int(os.environ.get('PORT', '5000'))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
