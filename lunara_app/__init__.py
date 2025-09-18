"""
Lunara Jewellery web app - Flask application factory.
Sets up configuration, CORS, logging, data directories, and registers blueprints.

Author: N H Padma Priya
"""
from __future__ import annotations
import logging
from pathlib import Path
from typing import Optional

from flask import Flask
from flask_cors import CORS

try:
    # Optional: load .env if present for local dev
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

from .config import Config

__author__ = "N H Padma Priya"


def _setup_logging(level: int = logging.INFO) -> None:
    if logging.getLogger().handlers:
        return  # already configured by hosting platform
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )


def create_app(config: Optional[Config] = None) -> Flask:
    """Application factory.

    - Applies configuration
    - Initializes CORS
    - Ensures data directory exists
    - Initializes DB (if configured/available)
    - Registers blueprints
    """
    _setup_logging()

    # Use project-level static/templates directories (one level above the package)
    app = Flask(__name__, static_folder="../static", template_folder="../templates")

    # Config
    app.config.from_object(config or Config())

    # Security: secret key via env with fallback for dev
    app.secret_key = app.config.get("SECRET_KEY")

    # CORS
    cors_origins = app.config.get("CORS_ORIGINS")
    CORS(app, resources={r"/api/*": {"origins": cors_origins or "*"}})

    # Ensure data dir exists
    data_dir = Path(app.config.get("DATA_DIR", "data"))
    data_dir.mkdir(parents=True, exist_ok=True)

    # Initialize DB and seed FAQs if possible
    try:
        from .services.db import init_db
        from .services.faq_service import FAQ_SEED
        init_db(FAQ_SEED, app.config)
    except Exception as e:
        logging.getLogger(__name__).info("DB init skipped or failed: %s", e)

    # Blueprints
    from .blueprints.main import bp as main_bp
    from .blueprints.products import bp as products_bp
    from .blueprints.auth import bp as auth_bp
    from .blueprints.payments import bp as payments_bp
    from .blueprints.chatbot import bp as chatbot_bp
    from .blueprints.newsletter import bp as newsletter_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(payments_bp, url_prefix="/api")
    app.register_blueprint(chatbot_bp, url_prefix="/api")
    app.register_blueprint(newsletter_bp, url_prefix="/api")

    return app
