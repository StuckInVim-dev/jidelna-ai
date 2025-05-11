from flask import Flask, request, jsonify, session, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import requests
import json
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-super-secret-key'  # Remember to change this!
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  # Using SQLite for simplicity initially
db = SQLAlchemy(app)
CORS(app,
    supports_credentials=True,
    origins=["http://localhost:3000"],
    expose_headers=["Content-Type", "Set-Cookie"],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# --- StravaMenuFetcher Class (updated with better session management) ---
class StravaMenuFetcher:
    # Class variable to store session IDs for each user
    _session_cache = {}
    
    def __init__(self, canteen_number: str, username: str, password: str):
        self.base_url = "https://app.strava.cz/api"
        self.canteen_number = canteen_number
        self.username = username
        self.password = password
        self.session_id = None
        self.headers = {
            "accept": "*/*",
            "content-type": "text/plain;charset=UTF-8",
            "user-agent": "Mozilla/5.0"
        }
        self.cookies = {
            "NEXT_LOCALE": "cs",
            "multiContext": self._generate_multi_context_cookie()
        }
        # Create a unique key for this user in the session cache
        self.cache_key = f"{canteen_number}:{username}"
        # Try to get an existing session from the cache
        if self.cache_key in self._session_cache:
            self.session_id = self._session_cache[self.cache_key]
            print(f"Using cached session ID: {self.session_id}")

    def _generate_multi_context_cookie(self) -> str:
        user_data = {"jmeno": self.username, "cislo": self.canteen_number}

        expiration_time = int((time.time() + (8 * 60 * 60)) * 1000)
        
        user_data = {"jmeno": self.username, "cislo": self.canteen_number}

        final_cookie = "%7B%22lastUser%22%3A%7B%22value%22%3A%22" + \
               json.dumps(user_data).replace('"', '%5C%22') + \
               "%22%2C%22expiration%22%3A" + str(expiration_time) + "%7D%7D"
        return final_cookie

    def authenticate(self) -> bool:
        """Authenticate with Strava API and store the session ID"""
        url = f"{self.base_url}/login"
        data = {
            "cislo": self.canteen_number,
            "jmeno": self.username,
            "heslo": self.password,
            "zustatPrihlasen": False,
            "environment": "W",
            "lang": "CZ"
        }
        try:
            response = requests.post(url, headers=self.headers,
                                   cookies=self.cookies, json=data, timeout=10)
            response_data = response.json()
            self.session_id = response_data.get("sid")
            print(f"AUTHENTICATE Session id: {self.session_id}")
            
            # Store the session ID in the class cache if successful
            if self.session_id:
                self._session_cache[self.cache_key] = self.session_id
                
                # Update user's account balance if available
                if "uzivatel" in response_data and "konto" in response_data["uzivatel"]:
                    konto_str = response_data["uzivatel"]["konto"]
                    try:
                        # Update the user's konto in the database
                        with app.app_context():
                            user = User.query.filter_by(strava_username=self.username, 
                                                      canteen_number=self.canteen_number).first()
                            if user:
                                user.konto = float(konto_str.replace(',', '.'))
                                db.session.commit()
                                print(f"Updated user balance to {user.konto}")
                    except Exception as e:
                        print(f"Failed to update user balance: {str(e)}")
                
            return True if self.session_id else False
        except Exception as e:
            print(f"Auth error: {str(e)}")
            return False

    def _ensure_authenticated(self, max_retries=1) -> bool:
        """Ensure we have a valid session ID, with limited retries"""
        if self.session_id:
            return True
            
        # No session ID, try to authenticate
        retry_count = 0
        while retry_count <= max_retries:
            if self.authenticate():
                return True
            retry_count += 1
            print(f"Authentication retry {retry_count}/{max_retries}")
            
        return False

    def _execute_api_request(self, url, data, operation_name, max_retries=1):
        """Execute an API request with retry logic for expired sessions"""
        retry_count = 0
        
        while retry_count <= max_retries:
            # Ensure we have a session ID
            if not self._ensure_authenticated(max_retries=1):
                print(f"Failed to authenticate for {operation_name}")
                return None
                
            # Update the session ID in the request data
            data["sid"] = self.session_id
            
            try:
                print(f"{operation_name.upper()} Session id: {self.session_id}")
                response = requests.post(url, headers=self.headers,
                                      cookies=self.cookies, json=data, timeout=15)
                
                # Check if the response indicates an expired session
                if response.status_code == 401 or (response.text and "unauthorized" in response.text.lower()):
                    print(f"Session expired during {operation_name}, retrying...")
                    self.session_id = None
                    # Remove from cache
                    if self.cache_key in self._session_cache:
                        del self._session_cache[self.cache_key]
                    retry_count += 1
                    continue
                    
                # Handle empty response
                if not response.text:
                    return {"message": f"{operation_name} completed (empty response)"}
                    
                # Handle 'false' response
                if response.text.strip() == 'false':
                    return False
                    
                # Try to parse as JSON
                return response.json()
                
            except Exception as e:
                print(f"{operation_name} error: {str(e)}")
                # Only retry if it might be a session issue
                if "Unauthorized" in str(e) or "expired" in str(e).lower():
                    self.session_id = None
                    # Remove from cache
                    if self.cache_key in self._session_cache:
                        del self._session_cache[self.cache_key]
                    retry_count += 1
                    continue
                return None
                
        print(f"Max retries reached for {operation_name}")
        return None

    def fetch_daily_menus(self):
        """Fetch daily menus with retry logic for expired sessions"""
        url = f"{self.base_url}/objednavky"
        data = {
            "cislo": self.canteen_number,
            "sid": self.session_id,  # Will be updated in _execute_api_request
            "s5url": "https://wss5.strava.cz/WSStravne5_15/WSStravne5.svc",
            "lang": "CZ",
            "konto": 0
        }
        
        return self._execute_api_request(url, data, "fetch daily menu")

    def add_food_item(self, item_id: str, quantity: int = 1):
        """Add food item to current order with retry logic"""
        url = f"{self.base_url}/pridejJidloS5"
        data = {
            "cislo": self.canteen_number,
            "sid": self.session_id,  # Will be updated in _execute_api_request
            "url": "https://wss5.strava.cz/WSStravne5_15/WSStravne5.svc",
            "veta": item_id,
            "pocet": quantity,
            "lang": "CZ",
            "ignoreCert": "false"
        }
        
        result = self._execute_api_request(url, data, "add food item")
        
        # The API returns the cost of the item, not the new balance
        # We don't update the user's konto here since this is just a temporary change
        # The actual balance update will happen when the order is submitted
        
        return result

    def save_orders(self):
        """Finalize and submit all pending orders with retry logic"""
        if not self.session_id and not self.authenticate():
            return None
            
        url = f"{self.base_url}/saveOrders"
        data = {
            "cislo": self.canteen_number,
            "sid": self.session_id,
            "url": "https://wss5.strava.cz/WSStravne5_15/WSStravne5.svc",
            "xml": None,
            "lang": "CZ",
            "ignoreCert": "false"
        }
        
        print(f"SAVE ORDERS Session id: {self.session_id}")
        try:
            response = requests.post(url, headers=self.headers,
                                   cookies=self.cookies, json=data, timeout=15)
            
            # Handle empty response
            if not response.text:
                return {"message": "Order submitted (empty response)"}
                
            # Handle 'false' response
            if response.text.strip() == 'false':
                return False
                
            # Try to parse as JSON
            result = response.json()
            print(f"SAVE ORDERS Response content: {str(result)[:200]}...")
            
            # Update user's account balance if available in the response
            if "konto" in result:
                try:
                    konto_str = result["konto"]
                    with app.app_context():
                        user = User.query.filter_by(strava_username=self.username, 
                                                  canteen_number=self.canteen_number).first()
                        if user:
                            user.konto = float(konto_str.replace(',', '.'))
                            db.session.commit()
                            print(f"Updated user balance to {user.konto} after submitting order")
                except Exception as e:
                    print(f"Failed to update user balance after submitting order: {str(e)}")
            
            return result
        except Exception as e:
            print(f"Save orders error: {str(e)}")
            return None

# --- Database Model ---
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False) # Insecure for now!
    
    strava_username = db.Column(db.String(255))
    strava_password = db.Column(db.String(255))
    canteen_number = db.Column(db.String(50))

    konto = db.Column(db.Float, default=0.0)  # Strava account balance

    is_vegan = db.Column(db.Boolean, default=False)
    allergies = db.Column(db.String(500), default='[]') 
    preferred_foods = db.Column(db.String(500), default='[]') 


    def __repr__(self):
        return f"<User {self.email}>"

# --- Helper function to get StravaFetcher for logged-in user ---
def get_strava_fetcher():
    user_id = session.get('user_id')
    if not user_id:
        print("DEBUG: No user_id in session")
        return None
    
    user = db.session.get(User, user_id)
    if not user or not user.strava_username or not user.strava_password or not user.canteen_number:
        print(f"DEBUG: User data incomplete - username: {bool(user and user.strava_username)}, password: {bool(user and user.strava_password)}, canteen: {bool(user and user.canteen_number)}")
        return None
    
    print(f"DEBUG: Creating StravaMenuFetcher for user {user_id} with canteen {user.canteen_number}")
    fetcher = StravaMenuFetcher(user.canteen_number, user.strava_username, user.strava_password)
    
    # Only authenticate if we don't already have a session ID from the cache
    if not fetcher.session_id:
        print("DEBUG: No cached session ID found, authenticating...")
        if not fetcher.authenticate():
            print("DEBUG: Failed to authenticate fetcher")
            return None
        print(f"DEBUG: Successfully authenticated with session ID: {fetcher.session_id}")
    
    return fetcher

# --- Routes ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': 'Email already exists'}), 409

    new_user = User(email=email, password=password) # Insecure storage!
    db.session.add(new_user)
    db.session.commit()
    session['user_id'] = new_user.user_id  # Log in the user
    return jsonify({'success': True, 'message': 'Registration successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if user and user.password == password: # Insecure comparison!
        session['user_id'] = user.user_id
        return jsonify({'success': True, 'message': 'Login successful'}), 200
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logged out'}), 200

@app.route('/settings', methods=['GET'])
def settings_get():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    user = User.query.get(user_id)
    if user:
        return jsonify({
            'success': True,
            'email': user.email,
            'strava_username': user.strava_username,
            'canteen_number': user.canteen_number,
            'konto': user.konto  # Include account balance
        })
    return jsonify({'success': False, 'error': 'User not found'}), 404

@app.route('/settings', methods=['POST'])
def settings_post():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    data = request.get_json()
    user.strava_username = data.get('strava_username')
    user.strava_password = data.get('strava_password') # Storing plain text!
    user.canteen_number = data.get('canteen_number')
    db.session.commit()
    return jsonify({'success': True, 'message': 'Strava details saved'}), 200

@app.route('/api/menus', methods=['GET'])
def get_menus():
    fetcher = get_strava_fetcher()
    if not fetcher:
        return jsonify({'success': False, 'error': 'Not logged in or Strava details not set'}), 401

    menus = fetcher.fetch_daily_menus()
    if menus:
        return jsonify({'success': True, 'menus': menus})
    return jsonify({'success': False, 'error': 'Failed to fetch menus'}), 500

@app.route('/api/order', methods=['POST'])
def order_food_item():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    user = User.query.get(user_id)
    if not user or not user.strava_username or not user.strava_password or not user.canteen_number:
        return jsonify({'success': False, 'error': 'Strava details not set'}), 400

    data = request.get_json()
    item_id = data.get('item_id')
    quantity = data.get('quantity', 1)  # Default quantity is 1

    # Use the helper function to get the fetcher instead of creating a new one
    fetcher = get_strava_fetcher()
    if not fetcher:
        return jsonify({'success': False, 'error': 'Failed to create Strava fetcher'}), 500
        
    result = fetcher.add_food_item(item_id, quantity)
    if result:
        return jsonify({'success': True, 'result': result})
    return jsonify({'success': False, 'error': 'Failed to update item amount'}), 500


@app.route('/api/submit-order', methods=['POST'])
def submit_order():
    print("DEBUG: /api/submit-order endpoint called")
    user_id = session.get('user_id')
    if not user_id:
        print("DEBUG: No user_id in session for submit order")
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    user = db.session.get(User, user_id)
    if not user or not user.strava_username or not user.strava_password or not user.canteen_number:
        print("DEBUG: User data incomplete for submit order")
        return jsonify({'success': False, 'error': 'Strava details not set'}), 400

    # Use the helper function to get the fetcher instead of creating a new one
    fetcher = get_strava_fetcher()
    if not fetcher:
        print("DEBUG: Failed to get Strava fetcher for submit order")
        return jsonify({'success': False, 'error': 'Failed to create Strava fetcher'}), 500
        
    print(f"DEBUG: Submitting order with session ID: {fetcher.session_id}")
    result = fetcher.save_orders()
    
    if result == False:
        print("DEBUG: Order submission returned false (no changes or already processed)")
        return jsonify({'success': True, 'message': 'No changes to submit or order already processed'}), 200
        
    if result:
        print("DEBUG: Order submitted successfully")
        return jsonify({'success': True, 'result': result})
    print("DEBUG: Failed to submit order")
    return jsonify({'success': False, 'error': 'Failed to submit order'}), 500

@app.route('/test_order', methods=['GET', 'POST'])
def test_order():
    """
    A combined endpoint for testing menu viewing, ordering, and submission.
    This is for testing purposes and combines several actions into one page.
    """
    print("DEBUG: /test_order GET endpoint called")
    user_id = session.get('user_id')
    if not user_id:
        print("DEBUG: No user_id in session for test order page")
        return "Please log in to test the ordering functionality."

    # Use the helper function to get the fetcher instead of creating a new one
    fetcher = get_strava_fetcher()
    if not fetcher:
        print("DEBUG: Failed to get Strava fetcher for test order page")
        return "Please set your Strava details in the settings first."
        
    print(f"DEBUG: Test order page fetching menus with session ID: {fetcher.session_id}")
    menus = fetcher.fetch_daily_menus()

    if not menus:
        return "Failed to fetch menus."

    # Render a simple HTML page to display the menu and a form for ordering
    menu_html = "<h1>Daily Menu</h1>"
    for key, table in menus.items():
        if key.startswith('table'):  # Assuming menu tables start with "table"
            menu_html += "<ul>"
            for food_item in table:
                item_id = food_item.get('veta')
                item_name = food_item.get('nazev')
                menu_html += f"<li>{item_name} (ID: {item_id})</li>"
            menu_html += "</ul>"

    order_form = """
        <form method="POST" action="/test_order">
            <label for="item_id">Enter Item ID to Order:</label><br>
            <input type="text" id="item_id" name="item_id"><br>
            <label for="quantity">Quantity:</label><br>
            <input type="number" id="quantity" name="quantity" value="1"><br><br>
            <input type="submit" name="order" value="Add to Order">
            <input type="submit" name="submit_order" value="Submit Order">
        </form>
    """

    return f"{menu_html} {order_form}"

@app.route('/test_order', methods=['POST'])
def test_order_post():
    """Handles the form submission from /test_order."""
    user_id = session.get('user_id')
    if not user_id:
        return "Please log in to use this feature."

    user = User.query.get(user_id)
    if not user or not user.strava_username or not user.strava_password or not user.canteen_number:
        return "Please set your Strava details in the settings."

    fetcher = StravaMenuFetcher(user.canteen_number, user.strava_username, user.strava_password)

    if 'order' in request.form:
        item_id = request.form['item_id']
        quantity = int(request.form.get('quantity', 1))
        result = fetcher.add_food_item(item_id, quantity)
        if result:
            return f"Item {item_id} added to order. Result: {result}"
        else:
            return f"Failed to add item {item_id} to order."

    elif 'submit_order' in request.form:
        result = fetcher.save_orders()
        if result:
            return f"Order submitted successfully! Result: {result}"
        else:
            return "Failed to submit order."

    return "Invalid action."

@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    return jsonify({
        'success': True,
        'preferences': {
            'is_vegan': user.is_vegan,
            'allergies': json.loads(user.allergies),
            'preferred_foods': json.loads(user.preferred_foods)
        }
    })

@app.route('/api/preferences', methods=['POST'])
def update_preferences():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    data = request.get_json()
    
    # Update preferences
    if 'is_vegan' in data:
        user.is_vegan = bool(data['is_vegan'])
    if 'allergies' in data:
        user.allergies = json.dumps(data['allergies'])
    if 'preferred_foods' in data:
        user.preferred_foods = json.dumps(data['preferred_foods'])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Preferences updated successfully'
    })

# Add this route for testing the preferences page
@app.route('/test_preferences', methods=['GET'])
def test_preferences():
    user_id = session.get('user_id')
    if not user_id:
        return "Please log in to view preferences"

    user = User.query.get(user_id)
    if not user:
        return "User not found"

    # Create a simple HTML form for testing
    return '''
        <h1>Food Preferences</h1>
        <form id="preferencesForm">
            <h2>Dietary Restrictions</h2>
            <input type="checkbox" id="isVegan" name="isVegan">
            <label for="isVegan">I am vegan</label><br><br>
            
            <h2>Allergies</h2>
            <input type="text" id="allergy" placeholder="Type an allergy">
            <button type="button" onclick="addAllergy()">Add Allergy</button>
            <ul id="allergyList"></ul>
            
            <h2>Preferred Foods</h2>
            <input type="text" id="preferredFood" placeholder="Type a preferred food">
            <button type="button" onclick="addPreferredFood()">Add Food</button>
            <ul id="preferredFoodList"></ul>
            
            <br><br>
            <button type="submit">Save Preferences</button>
        </form>

        <script>
            // Load existing preferences
            fetch('/api/preferences')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('isVegan').checked = data.preferences.is_vegan;
                        
                        const allergyList = document.getElementById('allergyList');
                        data.preferences.allergies.forEach(allergy => {
                            const li = document.createElement('li');
                            li.textContent = allergy;
                            li.innerHTML += ' <button onclick="this.parentElement.remove()">Remove</button>';
                            allergyList.appendChild(li);
                        });
                        
                        const preferredFoodList = document.getElementById('preferredFoodList');
                        data.preferences.preferred_foods.forEach(food => {
                            const li = document.createElement('li');
                            li.textContent = food;
                            li.innerHTML += ' <button onclick="this.parentElement.remove()">Remove</button>';
                            preferredFoodList.appendChild(li);
                        });
                    }
                });

            function addAllergy() {
                const input = document.getElementById('allergy');
                const list = document.getElementById('allergyList');
                if (input.value.trim()) {
                    const li = document.createElement('li');
                    li.textContent = input.value;
                    li.innerHTML += ' <button onclick="this.parentElement.remove()">Remove</button>';
                    list.appendChild(li);
                    input.value = '';
                }
            }

            function addPreferredFood() {
                const input = document.getElementById('preferredFood');
                const list = document.getElementById('preferredFoodList');
                if (input.value.trim()) {
                    const li = document.createElement('li');
                    li.textContent = input.value;
                    li.innerHTML += ' <button onclick="this.parentElement.remove()">Remove</button>';
                    list.appendChild(li);
                    input.value = '';
                }
            }

            document.getElementById('preferencesForm').onsubmit = function(e) {
                e.preventDefault();
                
                const allergies = Array.from(document.getElementById('allergyList').children)
                    .map(li => li.textContent.replace(' Remove', ''));
                
                const preferredFoods = Array.from(document.getElementById('preferredFoodList').children)
                    .map(li => li.textContent.replace(' Remove', ''));
                
                fetch('/api/preferences', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        is_vegan: document.getElementById('isVegan').checked,
                        allergies: allergies,
                        preferred_foods: preferredFoods
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Preferences saved successfully!');
                    } else {
                        alert('Error saving preferences: ' + data.error);
                    }
                });
            };
        </script>
    '''

@app.route('/')
def home():
    return "Flask backend is running! User authentication, settings, and basic Strava ordering are implemented.  Visit /test_order to test."

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
