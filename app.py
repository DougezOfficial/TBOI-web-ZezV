from flask import Flask, render_template, request, jsonify
import json
import os
import random

app = Flask(__name__)

def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/items')
def get_items():
    query = request.args.get('q', '').lower()
    is_random = request.args.get('random') == 'true'
    limit = request.args.get('limit', type=int)
    
    items = load_json('items.json')
    
    # Normalize items for frontend
    normalized_items = [{
        'name': i.get('name', 'Unknown'),
        'description': i.get('description', i.get('text', '')),
        'rarity': i.get('rarity', 'common'),
        'id': i.get('id'),
        'image_class': i.get('image_class', '')
    } for i in items]

    if query:
        filtered = [
            i for i in normalized_items 
            if query in i['name'].lower() or query in i['description'].lower()
        ]
        return jsonify(filtered)
    
    if is_random:
        random.shuffle(normalized_items)
    
    if limit:
        normalized_items = normalized_items[:limit]
        
    return jsonify(normalized_items)

@app.route('/api/bosses')
def get_bosses():
    query = request.args.get('q', '').lower()
    bosses = load_json('bosses.json')
    
    # Filter out potential non-boss pages from wiki scraping if needed, 
    # but for now we assume the file is decent or we rely on frontend to display names.
    # We normalized structure: {name: "...", type: "Boss"}
    
    if query:
        bosses = [b for b in bosses if query in b['name'].lower()]
        
    return jsonify(bosses)

@app.route('/api/enemies')
def get_enemies():
    query = request.args.get('q', '').lower()
    # "enemies.json" might contain mini-bosses too if scraped together, 
    # but based on previous steps we scraped 'Monsters' page for enemies.
    enemies = load_json('enemies.json')
    
    if query:
        enemies = [e for e in enemies if query in e['name'].lower()]
        
    return jsonify(enemies)

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
