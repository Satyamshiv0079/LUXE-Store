from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sys
import os
import threading
import time
import json
from functools import wraps
from dotenv import load_dotenv
from receipt_mailer import send_receipt
from flask_socketio import SocketIO, emit
import jwt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

load_dotenv()

JWT_SECRET = os.environ.get("JWT_SECRET", "luxe-super-secret-jwt-key")

def load_store_policies():
    policy_path = os.path.join(os.path.dirname(__file__), '..', 'dialog_service', 'store_policies.md')
    try:
        with open(policy_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return ""

# Fix the path so Python can find nlp_service and dialog_service
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from nlp_service.predictor import NLPPredictor
from dialog_service.dialog_manager import DialogManager
from groq import Groq

groq_lock = threading.Lock()

app = Flask(__name__)

# Configure CORS to restrict allowed origins to trusted clients
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5000").split(",")
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Secure API Token Verification Decorator
def require_api_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if app.config.get('TESTING', False):
            return f(*args, **kwargs)
            
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            # Fallback for development if no token is required
            if not os.environ.get("API_AUTH_TOKEN"):
                return f(*args, **kwargs)
            return jsonify({"error": "Unauthorized. Missing Bearer token."}), 401
            
        provided_token = auth_header.split(" ")[1]
        
        # Check if it's the static API token
        if provided_token == os.environ.get("API_AUTH_TOKEN"):
            return f(*args, **kwargs)
            
        # Check if it's a valid JWT
        try:
            payload = jwt.decode(provided_token, JWT_SECRET, algorithms=["HS256"])
            request.user = payload
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Unauthorized. Invalid token."}), 401

    return decorated_function

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if app.config.get('TESTING', False):
            return f(*args, **kwargs)
            
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized. Missing Bearer token."}), 401
            
        provided_token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(provided_token, JWT_SECRET, algorithms=["HS256"])
            if not payload.get("is_admin"):
                return jsonify({"error": "Forbidden. Admin access required."}), 403
            request.user = payload
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Unauthorized. Invalid token."}), 401

    return decorated_function

# Initialize services
nlp = NLPPredictor(model_path=os.path.join(os.path.dirname(__file__), '..', 'nlp_service', 'model'))
dialog = DialogManager()

# Groq client
groq_client = None

GROQ_MODELS = {
    "llama3-70b": "llama-3.3-70b-versatile",
    "llama3-8b": "llama-3.1-8b-instant",
}

@app.route('/')
def home():
    return jsonify({"message": "AI Chatbot API is running!", "status": "ok"})

@app.route('/health')
def health():
    groq_ok = bool(os.environ.get("GROQ_API_KEY"))
    return jsonify({"status": "healthy", "groq_enabled": groq_ok})

@app.route('/session/new', methods=['POST'])
@require_api_token
def new_session():
    session_id = dialog.start_session()
    return jsonify({"session_id": session_id})

# Groq client helper
def get_groq_client():
    global groq_client
    if groq_client is None:
        with groq_lock:
            if groq_client is None:
                api_key = os.environ.get("GROQ_API_KEY")
                if api_key:
                    groq_client = Groq(api_key=api_key)
    return groq_client

@app.route('/sessions', methods=['GET'])
@require_api_token
def list_sessions():
    sessions = dialog.state.list_sessions()
    return jsonify({"sessions": sessions})

@app.route('/auth/register', methods=['POST'])
@require_api_token
def register_user():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400
        
    email = data['email']
    password = data['password']
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    
    success = dialog.state.create_user(email, password, first_name, last_name)
    if success:
        return jsonify({"success": True, "message": "User created"})
    else:
        return jsonify({"success": False, "error": "Email already exists"}), 409

@app.route('/auth/login', methods=['POST'])
@require_api_token
def login_user():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400
        
    user = dialog.state.verify_user(data['email'], data['password'])
    if user:
        # Generate JWT
        payload = {
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "is_admin": user.get("is_admin", 0)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "is_admin": user.get("is_admin", 0)
            }
        })
    else:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/auth/orders', methods=['GET'])
@require_api_token
def user_orders():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400
    orders = dialog.state.get_user_orders(email)
    return jsonify({"success": True, "orders": orders})

@app.route('/orders/new', methods=['POST'])
@require_api_token
def new_order():
    data = request.get_json()
    if not data or 'order_id' not in data:
        return jsonify({"error": "Missing order_id"}), 400
    
    order_id = data.get('order_id')
    status = data.get('status', 'Processing')
    eta = data.get('eta', '3-5 business days')
    details = data.get('details', {})
    user_email = data.get('user_email', None)
    
    order = dialog.state.create_order(order_id, status, eta, details, user_email)
    
    # Send mock HTML receipt if user is logged in
    if user_email:
        user = dialog.state.get_user_by_email(user_email)
        user_name = user['first_name'] if user else "Customer"
        send_receipt(user_email, user_name, order_id, details)
        
        # Phase 4.3: Generate PDF Receipt
        try:
            spool_dir = os.path.join(os.path.dirname(__file__), 'receipts_spool')
            os.makedirs(spool_dir, exist_ok=True)
            pdf_path = os.path.join(spool_dir, f"{order_id}.pdf")
            
            c = canvas.Canvas(pdf_path, pagesize=letter)
            c.setFont("Helvetica-Bold", 24)
            c.drawString(50, 750, "LUXE STORE - INVOICE")
            c.setFont("Helvetica", 12)
            c.drawString(50, 710, f"Order ID: {order_id}")
            c.drawString(50, 690, f"Customer: {user_name} ({user_email})")
            
            y = 650
            for item in details.get('items', []):
                c.drawString(50, y, f"- {item.get('name')} (x{item.get('quantity')}) - ${item.get('price')}")
                y -= 20
                
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y - 20, f"Total: ${details.get('total')}")
            c.save()
        except Exception as e:
            print(f"Failed to generate PDF: {e}")
            
    return jsonify({"success": True, "order": order})

@app.route('/auth/wishlist', methods=['GET', 'POST'])
@require_api_token
def handle_wishlist():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "error": "Email is required"}), 400
        
    if request.method == 'GET':
        wishlist = dialog.state.get_user_wishlist(email)
        return jsonify({"success": True, "wishlist": wishlist})
        
    elif request.method == 'POST':
        data = request.get_json()
        wishlist = data.get('wishlist', [])
        dialog.state.update_user_wishlist(email, wishlist)
        return jsonify({"success": True})

@app.route('/admin/users', methods=['GET'])
@require_admin
def get_all_users():
    users = dialog.state.get_all_users()
    return jsonify({"success": True, "users": users})

@app.route('/admin/orders', methods=['GET'])
@require_admin
def get_all_orders():
    orders = dialog.state.get_all_orders()
    return jsonify({"success": True, "orders": orders})

@app.route('/chat', methods=['POST'])
@require_api_token
def chat():
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    user_message = data['message']
    session_id = data.get('session_id', None)
    model_key = data.get('model', 'llama3-70b')
    model_id = GROQ_MODELS.get(model_key, GROQ_MODELS['llama3-70b'])
    mode = data.get('mode', 'support_engine')

    if mode == 'novamind_ai':
        # Pure general-purpose AI Mode (bypasses intent classification & local support FSM)
        client = get_groq_client()
        if client is None:
            bot_response = "I'm sorry, I'm having trouble connecting to my AI brain. Please configure your GROQ_API_KEY in the environment."
            engine = "fallback_engine"
            if not session_id or not dialog.state.get_session(session_id):
                session_id = dialog.start_session()
        else:
            session = dialog.state.get_session(session_id)
            if not session:
                session_id = dialog.start_session()
                session = dialog.state.get_session(session_id)

            # Filter history to only include general-purpose Q&A to isolate context completely!
            history = [turn for turn in session["history"] if turn.get("intent") == "generative_qa"] if session else []

            # Check for policy RAG keywords
            policy_keywords = ['return', 'refund', 'shipping', 'delivery', 'size', 'sizing', 'fit', 'wash', 'clean', 'policy', 'policies']
            policy_context = ""
            if any(kw in user_message.lower() for kw in policy_keywords):
                policy_context = f"\n\nLUXE STORE POLICIES (Use this to answer policy questions):\n{load_store_policies()}"

            messages = [
                {
                    "role": "system",
                    "content": "You are NovaMind, an ultra-advanced AI companion with the versatile intelligence and conversational capabilities of Claude, Gemini, and Grok. "
                               "You possess deep knowledge in coding, science, mathematics, analysis, and creative writing. "
                               "Be natural, warm, engaging, and witty. Answer the user's questions in detail. "
                               "Do NOT mention order tracking, shipping, refunds, or customer support unless the user explicitly asks for it." + policy_context
                }
            ]
            for turn in history[-8:]:
                messages.append({"role": "user", "content": turn["user"]})
                messages.append({"role": "assistant", "content": turn["bot"]})

            messages.append({"role": "user", "content": user_message})

            try:
                completion = client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    max_tokens=1024,
                    temperature=0.7
                )
                bot_response = completion.choices[0].message.content
                engine = "generative_engine"
            except Exception as e:
                bot_response = f"I encountered an error communicating with my generative brain: {str(e)}"
                engine = "fallback_engine"

            # Log to SQLite session database as generative_qa to preserve chat history
            dialog.state.update_session(
                session_id=session_id,
                intent="generative_qa",
                entities={},
                user_text=user_message,
                bot_response=bot_response
            )

        return jsonify({
            "session_id": session_id,
            "user_message": user_message,
            "bot_response": bot_response,
            "intent": "generative_qa",
            "confidence": 1.0,
            "entities": {},
            "engine": engine,
            "model": model_id if engine == "generative_engine" else None
        })

    # 1. Run local BERT Intent Classifier
    nlp_result = nlp.process(user_message)
    intent = nlp_result['intent']
    confidence = nlp_result['confidence']
    entities = nlp_result['entities']

    # Standard support intents that require deterministic database/logic
    support_intents = ['check_order_status', 'cancel_order', 'request_refund', 'greeting', 'goodbye']

    # Get active session FSM state to check if we are waiting for order_id
    session = dialog.state.get_session(session_id)
    pending_slot = session.get("pending_slot") if session else None

    # LLM-Assisted Fallback Extraction:
    # If the database is waiting for "order_id" but our advanced regex failed to extract it,
    # we ask Groq Llama to extract any 4-6 digit order number or LUXE- format from the user's text!
    if pending_slot == "order_id" and "order_id" not in entities:
        client = get_groq_client()
        if client:
            try:
                extraction_prompt = [
                    {
                        "role": "system",
                        "content": "You are a precise JSON extractor. Your only task is to extract an order ID number from the user text. "
                                   "Order IDs can be 4-to-6 digits (e.g. 12345) OR start with LUXE- followed by 8 alphanumeric characters (e.g. LUXE-A1B2C3D4). "
                                   "If you find an order ID number, return it in this exact JSON format: {\"order_id\": \"id_string\"}. "
                                   "If no order ID is present in the text, return exactly: {}"
                    },
                    {
                        "role": "user",
                        "content": f"Extract order ID from: \"{user_message}\""
                    }
                ]
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",  # Use the fastest model for extraction
                    messages=extraction_prompt,
                    response_format={"type": "json_object"},
                    max_tokens=64,
                    temperature=0.0
                )
                import json
                extracted_data = json.loads(completion.choices[0].message.content)
                if "order_id" in extracted_data:
                    entities["order_id"] = str(extracted_data["order_id"])
            except Exception as e:
                print(f"LLM extraction fallback failed: {e}")

    # 2. Check routing condition
    has_order_id = bool(entities.get("order_id"))

    # We route directly to the local Dialog Manager if:
    # 1. The user is actively supplying slot input to fill a pending FSM slot (is_filling_slot)
    # 2. Or, the intent classifier has high confidence for a support action
    # 3. Or, we have an order ID and a support intent
    is_filling_slot = (pending_slot is not None and has_order_id)
    
    if is_filling_slot or (confidence >= 0.65 and intent in support_intents) or (has_order_id and intent in ['check_order_status', 'cancel_order', 'request_refund']):
        # High confidence support query or transactional query with order ID -> local Dialog Manager
        dialog_result = dialog.handle(
            session_id=session_id,
            intent=intent,
            entities=entities,
            user_text=user_message
        )
        session_id = dialog_result["session_id"]
        bot_response = dialog_result["response"]
        engine = "support_engine"
    else:
        # If the low-confidence query is a support action without an order ID,
        # we pre-register the pending FSM state in SQLite (only if there is no active pending slot already!)
        if pending_slot is None and intent in ['check_order_status', 'cancel_order', 'request_refund']:
            dialog.state.set_pending_state(session_id, slot_name="order_id", intent_name=intent)

        # Low confidence or out-of-scope query -> fallback to Groq Llama
        client = get_groq_client()
        if client is None:
            bot_response = "I'm sorry, I'm having trouble connecting to my AI brain. Please configure your GROQ_API_KEY in the environment."
            engine = "fallback_engine"
            # Ensure session exists
            if not session_id or not dialog.state.get_session(session_id):
                session_id = dialog.start_session()
        else:
            # Resolve or create session
            session = dialog.state.get_session(session_id)
            if not session:
                session_id = dialog.start_session()
                session = dialog.state.get_session(session_id)

            history = session["history"] if session else []

            # Check for policy RAG keywords
            policy_keywords = ['return', 'refund', 'shipping', 'delivery', 'size', 'sizing', 'fit', 'wash', 'clean', 'policy', 'policies']
            policy_context = ""
            if any(kw in user_message.lower() for kw in policy_keywords):
                policy_context = f"\n\nLUXE STORE POLICIES (Use this to answer policy questions):\n{load_store_policies()}"

            # Format the system prompt to guide Llama
            messages = [
                {
                    "role": "system",
                    "content": "You are NovaMind, an ultra-advanced hybrid AI assistant with the versatile intelligence and conversational capabilities of Claude, Gemini, and Grok. "
                               "You possess a highly capable General AI brain for coding, analysis, creative writing, and open-ended Q&A, and a built-in Customer Support Engine. "
                               "Be natural, engaging, witty, and highly helpful. "
                               "If the user asks general questions, writes code, or just chats, act like a premium general-purpose AI companion (do not randomly bring up order numbers, refunds, or shipping details unless specifically asked). "
                               "If they ask to track an order, cancel an order, or request a refund, politely let them know that you can automatically resolve it if they ask a specific support question (like 'Where is my order?') and provide their order number." + policy_context
                }
            ]

            # Add context-aware history (limit to last 8 turns to avoid bloat)
            for turn in history[-8:]:
                messages.append({"role": "user", "content": turn["user"]})
                messages.append({"role": "assistant", "content": turn["bot"]})

            messages.append({"role": "user", "content": user_message})

            try:
                completion = client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    max_tokens=1024,
                    temperature=0.7
                )
                bot_response = completion.choices[0].message.content
                engine = "generative_engine"
            except Exception as e:
                bot_response = f"I encountered an error communicating with my generative brain: {str(e)}"
                engine = "fallback_engine"

            # Update dialog session state so generative responses persist in session history
            dialog.state.update_session(
                session_id=session_id,
                intent="generative_qa",
                entities={},
                user_text=user_message,
                bot_response=bot_response
            )

    return jsonify({
        "session_id": session_id,
        "user_message": user_message,
        "bot_response": bot_response,
        "intent": "generative_qa" if engine == "generative_engine" else intent,
        "confidence": confidence,
        "entities": entities,
        "engine": engine,
        "model": model_id if engine == "generative_engine" else None
    })

@app.route('/chat/groq', methods=['POST'])
@require_api_token
def chat_groq():
    global groq_client
    if groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            return jsonify({"error": "Groq API key not configured"}), 500
        groq_client = Groq(api_key=api_key)

    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    user_message = data['message']
    history = data.get('history', [])
    model_key = data.get('model', 'llama3-70b')
    model_id = GROQ_MODELS.get(model_key, GROQ_MODELS['llama3-70b'])

    messages = [
        {
            "role": "system",
            "content": "You are a helpful AI assistant. Be concise, friendly, and accurate."
        }
    ]
    for turn in history[-10:]:
        if turn.get('role') and turn.get('content'):
            messages.append({"role": turn['role'], "content": turn['content']})

    messages.append({"role": "user", "content": user_message})

    try:
        completion = groq_client.chat.completions.create(
            model=model_id,
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )
        reply = completion.choices[0].message.content
        return jsonify({
            "bot_response": reply,
            "model": model_id,
            "usage": {
                "prompt_tokens": completion.usage.prompt_tokens,
                "completion_tokens": completion.usage.completion_tokens
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/groq/models', methods=['GET'])
@require_api_token
def get_groq_models():
    return jsonify({"models": list(GROQ_MODELS.keys())})

@app.route('/history/<session_id>', methods=['GET'])
@require_api_token
def get_history(session_id):
    session = dialog.state.get_session(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify({"history": session["history"]})

# Phase 4.4: Dynamic AI Translations
@app.route('/translate', methods=['POST'])
def translate_texts():
    data = request.get_json()
    if not data or 'texts' not in data or 'target' not in data:
        return jsonify({"error": "Missing texts or target"}), 400
        
    client = get_groq_client()
    if not client:
        return jsonify({"error": "Groq not configured"}), 500
        
    try:
        prompt = [
            {"role": "system", "content": "You are a precise JSON translator. Translate the given array of strings into the requested target language. Return ONLY a valid JSON object with the key 'translated_texts' containing the array of translated strings in the exact same order."},
            {"role": "user", "content": f"Target: {data['target']}\nTexts: {json.dumps(data['texts'])}"}
        ]
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=prompt,
            response_format={"type": "json_object"},
            max_tokens=1024,
            temperature=0.0
        )
        result = json.loads(completion.choices[0].message.content)
        return jsonify({"success": True, "translated_texts": result.get("translated_texts", [])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Phase 4.2: Emulated Stripe Integration
@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    data = request.get_json()
    # Mocking Stripe PaymentIntent creation
    time.sleep(0.5) # Simulate network delay
    mock_client_secret = f"pi_mock_{int(time.time())}_secret_test12345"
    return jsonify({"client_secret": mock_client_secret})

# Phase 4.3: PDF Receipt Download Route
@app.route('/download/invoice/<order_id>', methods=['GET'])
def download_invoice(order_id):
    spool_dir = os.path.join(os.path.dirname(__file__), 'receipts_spool')
    try:
        return send_from_directory(spool_dir, f"{order_id}.pdf", as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "Invoice not found"}), 404

# Phase 4.1: WebSockets Chat Streaming
@socketio.on('chat_message')
def handle_socket_chat(data):
    user_message = data.get('message')
    session_id = data.get('session_id')
    model_key = data.get('model', 'llama3-70b')
    model_id = GROQ_MODELS.get(model_key, GROQ_MODELS['llama3-70b'])
    
    if not user_message:
        emit('error', {'msg': 'No message provided'})
        return
        
    client = get_groq_client()
    if not client:
        emit('chat_complete', {'response': "I'm sorry, Groq API is not configured."})
        return

    # Create or get session
    if not session_id or not dialog.state.get_session(session_id):
        session_id = dialog.start_session()
    session = dialog.state.get_session(session_id)
    history = [turn for turn in session["history"] if turn.get("intent") == "generative_qa"] if session else []

    policy_keywords = ['return', 'refund', 'shipping', 'delivery', 'size', 'sizing', 'fit', 'wash', 'clean', 'policy']
    policy_context = f"\n\nLUXE STORE POLICIES:\n{load_store_policies()}" if any(kw in user_message.lower() for kw in policy_keywords) else ""

    messages = [
        {"role": "system", "content": "You are NovaMind, an ultra-advanced AI companion. Be concise. " + policy_context}
    ]
    for turn in history[-4:]:
        messages.append({"role": "user", "content": turn["user"]})
        messages.append({"role": "assistant", "content": turn["bot"]})
    messages.append({"role": "user", "content": user_message})

    try:
        stream = client.chat.completions.create(
            model=model_id,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
            stream=True
        )
        full_response = ""
        emit('chat_start', {'session_id': session_id})
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                full_response += content
                emit('chat_chunk', {'chunk': content})
                
        emit('chat_complete', {'response': full_response, 'session_id': session_id})
        
        dialog.state.update_session(
            session_id=session_id,
            intent="generative_qa",
            entities={},
            user_text=user_message,
            bot_response=full_response
        )
    except Exception as e:
        emit('chat_complete', {'response': f"Error: {str(e)}", 'session_id': session_id})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    socketio.run(app, host='0.0.0.0', debug=False, port=port)