import os
import json
import uuid
from datetime import datetime
import bcrypt
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

class ConversationState:
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("WARNING: SUPABASE_URL or SUPABASE_KEY not set. State manager will fail.")
        else:
            self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            self._seed_orders()

    def _seed_orders(self):
        """Seeds initial mock order database if empty."""
        try:
            response = self.supabase.table('orders').select('order_id').execute()
            if len(response.data) == 0:
                initial_orders = [
                    {"order_id": "12345", "status": "Shipped", "eta": "Tomorrow by 8 PM", "details": "{}"},
                    {"order_id": "67890", "status": "Processing", "eta": "3-5 business days", "details": "{}"},
                    {"order_id": "11111", "status": "Delivered", "eta": "Already delivered", "details": "{}"}
                ]
                self.supabase.table('orders').insert(initial_orders).execute()
        except Exception as e:
            print("Failed to seed orders:", e)

    def get_order(self, order_id):
        try:
            response = self.supabase.table('orders').select('*').eq('order_id', order_id).execute()
            if response.data:
                order_dict = response.data[0]
                if isinstance(order_dict.get("details"), str):
                    try: order_dict["details"] = json.loads(order_dict["details"])
                    except: pass
                return order_dict
        except Exception:
            pass
            
        import random
        statuses = ["Shipped", "Processing", "In Transit", "Delivered"]
        etas = ["Tomorrow by 5 PM", "In 2-3 business days", "By Friday next week", "Delivered yesterday"]
        status = random.choice(statuses)
        eta = random.choice(etas)
        
        try:
            self.supabase.table('orders').insert({
                "order_id": order_id, "status": status, "eta": eta, "details": "{}"
            }).execute()
        except Exception:
            pass
            
        return {"order_id": order_id, "status": status, "eta": eta, "details": {}}

    def create_order(self, order_id, status, eta, details, user_email=None):
        details_json = json.dumps(details) if isinstance(details, dict) else details
        try:
            self.supabase.table('orders').upsert({
                "order_id": order_id, "status": status, "eta": eta, 
                "details": details_json, "user_email": user_email
            }).execute()
        except Exception as e:
            print(e)
        return {"order_id": order_id, "status": status, "eta": eta}

    def get_user_orders(self, user_email):
        try:
            response = self.supabase.table('orders').select('*').eq('user_email', user_email).execute()
            result = []
            for order_dict in response.data:
                if isinstance(order_dict.get("details"), str):
                    try: order_dict["details"] = json.loads(order_dict["details"])
                    except: pass
                result.append(order_dict)
            return sorted(result, key=lambda x: x['order_id'], reverse=True)
        except Exception:
            return []
            
    def hash_password(self, password):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def create_user(self, email, password, first_name, last_name):
        is_admin = 1 if "admin" in email.lower() else 0
        try:
            self.supabase.table('users').insert({
                "email": email, 
                "password_hash": self.hash_password(password), 
                "first_name": first_name, 
                "last_name": last_name, 
                "is_admin": is_admin
            }).execute()
            return True
        except Exception as e:
            print(e)
            return False

    def verify_user(self, email, password):
        try:
            response = self.supabase.table('users').select('*').eq('email', email).execute()
            if response.data:
                user = response.data[0]
                stored_hash = user['password_hash'].encode('utf-8')
                if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                    return user
            return None
        except Exception:
            return None
            
    def get_user_by_email(self, email):
        try:
            response = self.supabase.table('users').select('*').eq('email', email).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception:
            return None
            
    def update_user_wishlist(self, email, wishlist):
        wishlist_str = json.dumps(wishlist) if isinstance(wishlist, list) else wishlist
        try:
            self.supabase.table('users').update({"wishlist": wishlist_str}).eq('email', email).execute()
        except Exception:
            pass
            
    def get_user_wishlist(self, email):
        try:
            response = self.supabase.table('users').select('wishlist').eq('email', email).execute()
            if response.data and response.data[0].get("wishlist"):
                wishlist = response.data[0]["wishlist"]
                if isinstance(wishlist, str):
                    try: return json.loads(wishlist)
                    except: return []
                return wishlist
            return []
        except Exception:
            return []
            
    def get_all_users(self):
        try:
            response = self.supabase.table('users').select('id, email, first_name, last_name, is_admin').execute()
            return response.data
        except Exception:
            return []
            
    def get_all_orders(self):
        try:
            response = self.supabase.table('orders').select('*').execute()
            result = []
            for order_dict in response.data:
                if isinstance(order_dict.get("details"), str):
                    try: order_dict["details"] = json.loads(order_dict["details"])
                    except: pass
                result.append(order_dict)
            return sorted(result, key=lambda x: x['order_id'], reverse=True)
        except Exception:
            return []

    def list_sessions(self):
        try:
            response = self.supabase.table('sessions').select('session_id, created_at, current_intent').execute()
            sessions_list = []
            for row in response.data:
                msg_resp = self.supabase.table('messages').select('user_text').eq('session_id', row['session_id']).order('id', desc=False).limit(1).execute()
                title = "New Conversation"
                if msg_resp.data:
                    title = msg_resp.data[0]['user_text']
                if len(title) > 25:
                    title = title[:22] + "..."
                try:
                    dt = datetime.fromisoformat(row["created_at"])
                    time_str = dt.strftime("%I:%M %p").lower()
                except Exception:
                    time_str = "12:00 am"
                sessions_list.append({
                    "id": row["session_id"],
                    "title": title,
                    "timestamp": time_str
                })
            sessions_list.sort(key=lambda x: x.get('timestamp'), reverse=True)
            return sessions_list
        except Exception:
            return []

    def create_session(self):
        session_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        slots_json = json.dumps({})
        try:
            self.supabase.table('sessions').insert({
                "session_id": session_id, "created_at": created_at, "slots": slots_json
            }).execute()
        except Exception:
            pass
        return session_id

    def get_session(self, session_id):
        try:
            session_resp = self.supabase.table('sessions').select('*').eq('session_id', session_id).execute()
            if not session_resp.data:
                return None
            session_row = session_resp.data[0]
            
            msg_resp = self.supabase.table('messages').select('*').eq('session_id', session_id).order('id', desc=False).execute()
            
            history = []
            for row in msg_resp.data:
                history.append({
                    "user": row["user_text"],
                    "bot": row["bot_response"],
                    "intent": row["intent"],
                    "timestamp": row["timestamp"]
                })
                
            slots = session_row.get("slots", '{}')
            if isinstance(slots, str):
                try: slots = json.loads(slots)
                except: slots = {}
                
            return {
                "session_id": session_row["session_id"],
                "created_at": session_row["created_at"],
                "current_intent": session_row.get("current_intent"),
                "slots": slots,
                "pending_slot": session_row.get("pending_slot"),
                "pending_intent": session_row.get("pending_intent"),
                "history": history
            }
        except Exception as e:
            print("Error getting session:", e)
            return None

    def set_pending_state(self, session_id, slot_name, intent_name):
        try:
            self.supabase.table('sessions').update({
                "pending_slot": slot_name, "pending_intent": intent_name
            }).eq('session_id', session_id).execute()
        except Exception:
            pass

    def clear_pending_state(self, session_id):
        try:
            self.supabase.table('sessions').update({
                "pending_slot": None, "pending_intent": None
            }).eq('session_id', session_id).execute()
        except Exception:
            pass

    def update_session(self, session_id, intent, entities, user_text, bot_response):
        session = self.get_session(session_id)
        if not session:
            created_at = datetime.now().isoformat()
            slots_json = json.dumps(entities)
            try:
                self.supabase.table('sessions').insert({
                    "session_id": session_id, "created_at": created_at, 
                    "current_intent": intent, "slots": slots_json
                }).execute()
            except Exception:
                pass
        else:
            updated_slots = {**session["slots"], **entities}
            slots_json = json.dumps(updated_slots)
            try:
                self.supabase.table('sessions').update({
                    "current_intent": intent, "slots": slots_json
                }).eq('session_id', session_id).execute()
            except Exception:
                pass
                
        timestamp = datetime.now().isoformat()
        try:
            self.supabase.table('messages').insert({
                "session_id": session_id, "user_text": user_text, 
                "bot_response": bot_response, "intent": intent, "timestamp": timestamp
            }).execute()
        except Exception as e:
            print("Error inserting message:", e)

    def get_slot(self, session_id, slot_name):
        session = self.get_session(session_id)
        if session:
            return session["slots"].get(slot_name)
        return None

    def clear_session(self, session_id):
        try:
            self.supabase.table('sessions').delete().eq('session_id', session_id).execute()
        except Exception:
            pass