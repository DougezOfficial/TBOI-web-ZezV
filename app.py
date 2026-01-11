from flask import Flask, render_template, request, jsonify
import json
import os
import random

app = Flask(__name__)

# Data Cache
DATA_CACHE = {
    'items': [],
    'bosses': [],
    'enemies': []
}

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def init_data():
    """Load all data into memory at startup."""
    print("Loading data into memory...")
    try:
        DATA_CACHE['items'] = load_json('items.json')
        # Normalize items immediately
        DATA_CACHE['items'] = [{
            'name': i.get('name', 'Unknown'),
            'description': i.get('description', i.get('text', '')),
            'rarity': i.get('rarity', 'common'),
            'id': i.get('id'),
            'image_class': i.get('image_class', ''),
            'image': i.get('image')
        } for i in DATA_CACHE['items']]
        
        DATA_CACHE['bosses'] = load_json('bosses.json')
        DATA_CACHE['enemies'] = load_json('enemies.json')
        print(f"Loaded {len(DATA_CACHE['items'])} items, {len(DATA_CACHE['bosses'])} bosses, {len(DATA_CACHE['enemies'])} enemies.")
    except Exception as e:
        print(f"Error loading data: {e}")

# Initialize data on startup
init_data()

@app.route('/')
def home():
    return render_template('index.html')

def paginate(data, page, limit):
    start = (page - 1) * limit
    end = start + limit
    return data[start:end]

@app.route('/api/items')
def get_items():
    query = request.args.get('q', '').lower()
    is_random = request.args.get('random') == 'true'
    limit = request.args.get('limit', default=20, type=int)
    page = request.args.get('page', default=1, type=int)
    
    items = DATA_CACHE['items']

    if query:
        filtered = [
            i for i in items 
            if query in i['name'].lower() or query in i['description'].lower()
        ]
        # Return paginated matched results
        return jsonify(paginate(filtered, page, limit))
    
    if is_random:
        # returns random sample, usually for initial view
        # changing to simple random.sample to avoid in-place shuffle of cached data
        return jsonify(random.sample(items, min(len(items), limit)))
    
    # Standard paginated list
    return jsonify(paginate(items, page, limit))

@app.route('/api/bosses')
def get_bosses():
    query = request.args.get('q', '').lower()
    limit = request.args.get('limit', default=20, type=int)
    page = request.args.get('page', default=1, type=int)
    
    bosses = DATA_CACHE['bosses']
    
    if query:
        bosses = [b for b in bosses if query in b['name'].lower()]
        
    return jsonify(paginate(bosses, page, limit))

@app.route('/api/enemies')
def get_enemies():
    query = request.args.get('q', '').lower()
    limit = request.args.get('limit', default=20, type=int)
    page = request.args.get('page', default=1, type=int)
    
    enemies = DATA_CACHE['enemies']
    
    if query:
        enemies = [e for e in enemies if query in e['name'].lower()]
        
    return jsonify(paginate(enemies, page, limit))

@app.route('/api/featured')
def get_featured():
    # Hardcoded featured lists as per plan
    # Bosses: Duke of Flies (Easy), Monstro (Medium), Mom (Mom)
    # Bestiary: Fly, Dip, Gaper, Fatty, Knight (Progressive)
    # Mini-Bosses: Seven Deadly Sins, Krampus
    
    return jsonify({
        "bosses": [
            {"name": "Duke of Flies", "difficulty": "Easy", "description": "Flies around and spawns flies."},
            {"name": "Monstro", "difficulty": "Medium", "description": "Jumps and spits blood."},
            {"name": "Mom", "difficulty": "Mom", "description": "Stomps and calls for help."}
        ],
        "enemies": [
            {"name": "Fly", "rank": 1},
            {"name": "Dip", "rank": 2},
            {"name": "Gaper", "rank": 3},
            {"name": "Fatty", "rank": 4},
            {"name": "Knight", "rank": 5}
        ],
        "mini_bosses": [
            {"name": "Envy", "title": "The Seven Deadly Sins"},
            {"name": "Gluttony", "title": "The Seven Deadly Sins"},
            {"name": "Wrath", "title": "The Seven Deadly Sins"},
            {"name": "Lust", "title": "The Seven Deadly Sins"},
            {"name": "Greed", "title": "The Seven Deadly Sins"},
            {"name": "Sloth", "title": "The Seven Deadly Sins"},
            {"name": "Pride", "title": "The Seven Deadly Sins"},
            {"name": "Krampus", "title": "Christmas Evil"}
        ]
    })

if __name__ == '__main__':
    app.run(debug=True)
