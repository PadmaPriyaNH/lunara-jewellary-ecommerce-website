"""Database utilities with graceful fallback to JSON storage.
- Uses MySQL if driver and connection succeed.
- Falls back to JSON files in data directory if not.
"""
from __future__ import annotations
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import mysql.connector  # type: ignore
    from mysql.connector import Error  # type: ignore
    MYSQL_DRIVER_AVAILABLE = True
except Exception:  # pragma: no cover - driver not present in many envs
    mysql = None  # type: ignore
    Error = Exception  # type: ignore
    MYSQL_DRIVER_AVAILABLE = False


class DBState:
    available: bool = False


def get_db_connection(config: Dict[str, Any]):
    if not MYSQL_DRIVER_AVAILABLE:
        raise Error("MySQL driver not available")
    return mysql.connector.connect(
        host=config.get("MYSQL_HOST"),
        user=config.get("MYSQL_USER"),
        password=config.get("MYSQL_PASSWORD"),
        database=config.get("MYSQL_DB"),
        port=int(config.get("MYSQL_PORT", 3306)),
        auth_plugin=config.get("MYSQL_AUTH_PLUGIN", "mysql_native_password"),
    )


def ensure_data_dir(data_dir: str) -> Path:
    p = Path(data_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


def load_json(data_dir: str, filename: str, default):
    path = ensure_data_dir(data_dir) / filename
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=2, ensure_ascii=False)
        return default
    except json.JSONDecodeError:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=2, ensure_ascii=False)
        return default


def save_json(data_dir: str, filename: str, data):
    path = ensure_data_dir(data_dir) / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def init_db(faq_seed: List[Dict[str, Any]], config) -> None:
    """Create tables and seed FAQs if using MySQL; otherwise ensure JSON files exist."""
    from .faq_service import FAQ_JSON_FILE

    data_dir = config.get("DATA_DIR", "data")

    try:
        conn = get_db_connection(config.__dict__ if hasattr(config, "__dict__") else config)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS faqs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                question TEXT NOT NULL,
                sentiment VARCHAR(32),
                status VARCHAR(32) DEFAULT 'open',
                source VARCHAR(32) DEFAULT 'chat',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        conn.commit()

        # Seed FAQs if empty
        cur.execute("SELECT COUNT(*) FROM faqs")
        (count,) = cur.fetchone()
        if count == 0:
            insert_sql = "INSERT INTO faqs (category, question, answer) VALUES (%s, %s, %s)"
            cur.executemany(insert_sql, [(f['category'], f['question'], f['answer']) for f in faq_seed])
            conn.commit()
        cur.close()
        conn.close()
        DBState.available = True
    except Exception:
        # Fallback to JSON storage
        DBState.available = False
        # Ensure JSON files exist
        faqs = load_json(data_dir, FAQ_JSON_FILE, faq_seed)
        if not faqs:
            save_json(data_dir, FAQ_JSON_FILE, faq_seed)
        # Ensure basic ticket store exists
        load_json(data_dir, "support_tickets.json", [])


def save_ticket(config, name: Optional[str], email: Optional[str], question: str, sentiment: str,
                status: str = 'open', source: str = 'chat') -> Optional[int]:
    data_dir = config.get("DATA_DIR", "data")

    if DBState.available:
        try:
            conn = get_db_connection(config.__dict__ if hasattr(config, "__dict__") else config)
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO support_tickets (name, email, question, sentiment, status, source) VALUES (%s, %s, %s, %s, %s, %s)",
                (name, email, question, sentiment, status, source)
            )
            conn.commit()
            ticket_id = cur.lastrowid
            cur.close()
            conn.close()
            return int(ticket_id)
        except Exception:
            pass

    tickets = load_json(data_dir, "support_tickets.json", [])
    new_ticket = {
        'id': len(tickets) + 1,
        'name': name,
        'email': email,
        'question': question,
        'sentiment': sentiment,
        'status': status,
        'source': source,
        'created_at': datetime.now().isoformat()
    }
    tickets.append(new_ticket)
    save_json(data_dir, "support_tickets.json", tickets)
    return int(new_ticket['id'])
