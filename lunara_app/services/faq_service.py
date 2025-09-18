"""FAQ and chatbot helper utilities.
Provides:
- FAQ seed data
- Normalization and fuzzy matching
- Loading FAQs from DB or JSON fallback
- Simple sentiment detection
"""
from __future__ import annotations
import difflib
import re
from typing import Any, Dict, List, Optional, Tuple

from .db import DBState, get_db_connection, load_json

FAQ_JSON_FILE = 'faqs.json'

FAQ_SEED: List[Dict[str, str]] = [
    {"category": "General Questions", "question": "Do you ship internationally?", "answer": "Yes, we ship worldwide. Shipping charges and delivery times vary by country and are shown at checkout."},
    {"category": "General Questions", "question": "What are the delivery charges?", "answer": "Delivery is free within India for orders above ₹1,000. For international orders, charges depend on location and weight."},
    {"category": "General Questions", "question": "How many days does shipping take within India?", "answer": "Standard delivery takes 4–7 business days. Express delivery (extra charge) is available in select cities within 2–3 days."},
    {"category": "General Questions", "question": "Do you provide gift wrapping?", "answer": "Yes, we offer free gift wrapping. You can also add a personalized note at checkout."},
    {"category": "General Questions", "question": "Can I customize my jewellery?", "answer": "Yes, we accept customization requests for select designs. Please contact our support team with your requirements."},

    {"category": "Orders & Returns", "question": "What is your return/refund policy?", "answer": "You can return products within 7 days of delivery if unused and in original packaging. Refunds are processed within 5–7 business days after quality checks."},
    {"category": "Orders & Returns", "question": "How do I track my order?", "answer": "Once your order ships, you’ll receive a tracking link by email and SMS. You can also track it from the “My Orders” section on our website."},
    {"category": "Orders & Returns", "question": "How do I cancel or modify my order after placing it?", "answer": "Orders can be modified or canceled within 12 hours of placing them. Please contact customer support immediately for assistance."},
    {"category": "Orders & Returns", "question": "Do you offer exchanges?", "answer": "Yes, exchanges are accepted within 7 days for items of equal or higher value. The product must be unused and returned in original packaging."},
    {"category": "Orders & Returns", "question": "What happens if my order arrives damaged?", "answer": "We’re sorry for the inconvenience. Please share photos of the damaged product with our support team within 24 hours, and we’ll arrange a replacement or refund."},

    {"category": "Product Care", "question": "How do I clean and maintain jewellery?", "answer": "Use a soft cloth to wipe after each use. Keep away from perfumes, lotions, and moisture. Store in a dry box or pouch."},
    {"category": "Product Care", "question": "Are your products waterproof or sweat-resistant?", "answer": "Our jewellery is not waterproof. Avoid wearing during showers, swimming, or workouts to maintain shine."},
    {"category": "Product Care", "question": "What materials do you use in your jewellery?", "answer": "We use 92.5 sterling silver, gold plating, semi-precious stones, and hypoallergenic alloys depending on the design."},
    {"category": "Product Care", "question": "Is your jewellery hypoallergenic?", "answer": "Yes, our products are nickel-free and safe for sensitive skin."},
    {"category": "Product Care", "question": "Do you provide certificates of authenticity?", "answer": "Yes, we provide certificates for silver and gold-plated jewellery confirming purity and authenticity."},

    {"category": "Store & Stock", "question": "Do you have moon-themed jewellery in stock?", "answer": "Yes, we have a special 'Lunara Moon Collection' with rings, pendants, and earrings. Check the Moon Collection section on our website."},
    {"category": "Store & Stock", "question": "How often do you release new collections?", "answer": "We release new collections every season, with limited-edition drops during festivals."},
    {"category": "Store & Stock", "question": "Can I pre-order an item that is out of stock?", "answer": "Yes, pre-orders are available for select designs. Estimated delivery will be shown at checkout."},
    {"category": "Store & Stock", "question": "Do you have a physical store?", "answer": "Currently, we are online-only. However, we plan to open flagship stores soon. Stay tuned!"},
    {"category": "Store & Stock", "question": "Do you offer bulk/wholesale orders?", "answer": "Yes, bulk orders are accepted. Please contact us for pricing and customization options."},

    {"category": "Payments & Support", "question": "What payment methods do you accept?", "answer": "We accept credit/debit cards, UPI, net banking, PayPal, and Cash on Delivery (India only)."},
    {"category": "Payments & Support", "question": "Is my payment information secure?", "answer": "Yes, all transactions are encrypted with SSL and processed securely through trusted payment gateways."},
    {"category": "Payments & Support", "question": "Do you offer EMI or installment options?", "answer": "Yes, EMI is available for orders above ₹5,000 through select banks at checkout."},
    {"category": "Payments & Support", "question": "How can I contact customer support?", "answer": "You can reach us via email at support@lunarajewellery.com or use the chatbot to log a support ticket."},
    {"category": "Payments & Support", "question": "What are your customer service hours?", "answer": "Our support team is available Monday to Saturday, 10:00 AM – 7:00 PM IST."}
]

NEGATIVE_WORDS = {
    'bad','worse','worst','angry','annoyed','upset','frustrated','disappointed','hate','terrible','awful','useless',
    'broken','late','delay','delayed','never','refund','cancel','damaged','problem','issue','complaint','scam','cheat',
    'unhappy','ridiculous','stupid','slow','poor','unacceptable','disgusting','rude','not happy',"don't like"
}


def normalize_text(s: str) -> str:
    s = (s or '').lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def detect_sentiment(message: str) -> str:
    text = normalize_text(message)
    if not text:
        return 'neutral'
    for w in NEGATIVE_WORDS:
        if w in text:
            return 'negative'
    return 'neutral'


def load_faqs(config) -> List[Dict[str, str]]:
    data_dir = config.get("DATA_DIR", "data")
    if DBState.available:
        try:
            conn = get_db_connection(config.__dict__ if hasattr(config, "__dict__") else config)
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT id, category, question, answer FROM faqs")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return rows
        except Exception:
            pass
    return load_json(data_dir, FAQ_JSON_FILE, FAQ_SEED)


def match_faq(user_message: str, faqs_list: List[Dict[str, str]]):
    """Return (best_match, score) using fuzzy match on questions."""
    text = normalize_text(user_message)
    if not text:
        return None, 0.0

    best = None
    best_score = 0.0
    for f in faqs_list:
        q = normalize_text(f.get('question', ''))
        ratio = difflib.SequenceMatcher(None, text, q).ratio()
        overlap = len(set(text.split()) & set(q.split()))
        ratio += min(overlap * 0.02, 0.1)
        if ratio > best_score:
            best = f
            best_score = ratio
    return best, best_score
