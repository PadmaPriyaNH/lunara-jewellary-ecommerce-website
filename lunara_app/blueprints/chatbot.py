from __future__ import annotations
from flask import Blueprint, jsonify, request, session, current_app
from ..services.faq_service import load_faqs, match_faq, detect_sentiment
from ..services.db import save_ticket

bp = Blueprint('chatbot', __name__)


@bp.get('/faqs')
def api_faqs():
    faqs_list = load_faqs(current_app.config) or []
    questions = [
        {'question': f.get('question', ''), 'category': f.get('category', '')}
        for f in faqs_list if f.get('question')
    ]
    return jsonify({'faqs': questions[:12]})


@bp.post('/chatbot/ask')
def chatbot_ask():
    data = request.get_json() or {}
    message = (data.get('message') or '').strip()
    user_name = (data.get('name') or '').strip()
    user_email = (data.get('email') or '').strip().lower()

    if 'user_id' in session:
        # Fetch user details only if provided and non-empty
        from ..services.db import load_json
        data_dir = current_app.config.get('DATA_DIR', 'data')
        users = load_json(data_dir, 'users.json', [])
        u = next((u for u in users if u.get('id') == session['user_id']), None)
        if u:
            user_name = user_name or u.get('name')
            user_email = user_email or u.get('email')

    if not message:
        return jsonify({'success': False, 'reply': "I didn't catch that. Could you type your question again?", 'matched': False})

    sentiment = detect_sentiment(message)
    faqs_list = load_faqs(current_app.config)
    best_match, score = match_faq(message, faqs_list)

    threshold = 0.67
    ticket_id = None

    if best_match and score >= threshold:
        reply = best_match.get('answer', "Here's what I found.")
        matched = True
        if sentiment == 'negative':
            ticket_id = save_ticket(current_app.config, user_name or None, user_email or None, message, sentiment, status='open', source='chat-escalated')
            reply += f"\n\nI've also flagged this to our support team to assist you further. Your ticket ID is {ticket_id}."
    else:
        matched = False
        reply = (
            "I'm here to help! I couldn't find an exact answer to that. "
            "I've logged this for our support team and they'll follow up soon."
        )
        ticket_id = save_ticket(current_app.config, user_name or None, user_email or None, message, sentiment, status='open', source='chat-unmatched')
        reply += f" Your ticket ID is {ticket_id}."

    return jsonify({'success': True, 'reply': reply, 'matched': matched, 'ticket_id': ticket_id, 'sentiment': sentiment})
