from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

def load_items():
    with open('items.json', 'r') as f:
        return json.load(f)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/items')
def get_items():
    query = request.args.get('q', '').lower()
    items = load_items()
    
    if query:
        filtered_items = []
        for item in items:
            name = item.get('name', 'Unknown')
            description = item.get('description', item.get('text', ''))
            rarity = item.get('rarity', 'common')
            
            if query in name.lower() or query in description.lower():
                # Return a normalized structure
                filtered_items.append({
                    'name': name,
                    'description': description,
                    'rarity': rarity,
                    'id': item.get('id'),
                    'image_class': item.get('image_class', '') 
                })
        return jsonify(filtered_items)
    
    # Return normalized items even without query
    normalized_items = [{
        'name': i.get('name', 'Unknown'),
        'description': i.get('description', i.get('text', '')),
        'rarity': i.get('rarity', 'common'),
        'id': i.get('id'),
        'image_class': i.get('image_class', '')
    } for i in items]
    return jsonify(normalized_items)

if __name__ == '__main__':
    app.run(debug=True)
