Lunara Jewellery E-commerce (Flask)

Production-ready, modular Flask application with a built-in FAQ-driven chatbot, JSON storage with optional MySQL, and a responsive frontend.

Features
- Modular Flask app using blueprints and an application factory
- FAQ chatbot with fuzzy matching and sentiment-based escalation to support tickets
- User registration/login with hashed passwords
- Products catalog, cart, and mock payments
- JSON file storage by default; optional MySQL auto-init/seed
- CORS-enabled API endpoints for frontend integration
- Environment variable-based configuration

Project structure
- app.py — Entrypoint that bootstraps the application factory
- lunara_app/
  - __init__.py — create_app, CORS, blueprint registration
  - config.py — central configuration (env-driven)
  - services/
    - db.py — DB helpers + JSON fallbacks
    - faq_service.py — FAQ seed, fuzzy match, sentiment, loaders
  - blueprints/
    - main.py — index route
    - products.py — /api/products
    - auth.py — /api/register, /api/login, /api/logout, /api/user
    - payments.py — /api/process-payment, /api/orders, /api/order/<id>
    - chatbot.py — /api/faqs, /api/chatbot/ask
    - newsletter.py — /api/subscribe
- templates/
  - index.html — responsive SPA-like site
- static/
  - css/, js/, images/ — assets including chatbot widget UI
- data/ — JSON storage (products.json, users.json, orders.json, faqs.json, support_tickets.json, subscribers.json)

Setup
1) Python 3.10+
2) Create and activate a virtual environment
   - Windows (PowerShell):
     python -m venv venv
     venv\Scripts\Activate.ps1
   - macOS/Linux:
     python3 -m venv venv
     source venv/bin/activate
3) Install dependencies
   pip install -r requirements.txt
4) Run the app (dev)
   set FLASK_DEBUG=1 (Windows) or export FLASK_DEBUG=1 (macOS/Linux)
   python app.py
5) Visit http://localhost:5000

Environment variables
- SECRET_KEY — Flask session secret
- DATA_DIR — path for JSON storage (default: data)
- CORS_ORIGINS — allowed origins for API (default: *)
- MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT, MYSQL_AUTH_PLUGIN — to enable MySQL

Testing
- The service layer is designed to be unit-testable. Basic test plan:
  1. faq_service.normalize_text — input variations map to normalized tokens
  2. faq_service.match_faq — returns best match and reasonable threshold behavior
  3. faq_service.detect_sentiment — negative keywords flagged correctly
  4. db.save_json/load_json — roundtrip integrity
  5. chatbot endpoints — POST /api/chatbot/ask with known and unknown queries

Run sample tests (manual):
- curl http://localhost:5000/api/faqs
- curl -X POST http://localhost:5000/api/chatbot/ask -H "Content-Type: application/json" -d "{\"message\":\"Do you ship internationally?\"}"

Deployment
- Use gunicorn (or waitress on Windows) to serve the Flask app
- Set environment variables for production (SECRET_KEY, CORS_ORIGINS, MySQL if desired)
- Example (Heroku-like):
  - pip install gunicorn
  - gunicorn -w 2 -b 0.0.0.0:$PORT app:app

Security & best practices
- No secrets in code; configure via environment variables
- Passwords hashed with bcrypt
- Basic input sanitation and validation on API endpoints
- CORS restricted via env when deploying

Extending the chatbot
- Add more FAQs: modify data/faqs.json or seed list in faq_service.py
- Swap matching with an embedding-based search: create new matcher in services and update chatbot blueprint
- Add order-status intents: create /api/chatbot/order-status and a new handler module

Author
- N H Padma Priya

License
- MIT License (c) 2025 N H Padma Priya. See LICENSE for details.
