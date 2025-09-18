"""Centralized configuration for Lunara app.
Use environment variables for secrets and deployment settings.
"""
from __future__ import annotations
import os
from dataclasses import dataclass


@dataclass
class Config:
    # Flask
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "dev-insecure-key-change-me")

    # Data directory for JSON fallbacks/local storage
    DATA_DIR: str = os.environ.get("DATA_DIR", "data")

    # MySQL configuration (optional)
    MYSQL_HOST: str = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_USER: str = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.environ.get("MYSQL_PASSWORD", "")
    MYSQL_DB: str = os.environ.get("MYSQL_DB", "lunara")
    MYSQL_PORT: int = int(os.environ.get("MYSQL_PORT", "3306"))
    MYSQL_AUTH_PLUGIN: str = os.environ.get("MYSQL_AUTH_PLUGIN", "mysql_native_password")

    # CORS
    CORS_ORIGINS: str | None = os.environ.get("CORS_ORIGINS")

    # Feature flags
    DEBUG: bool = os.environ.get("FLASK_DEBUG", "0") == "1"
