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
        filtered_items = [
            item for item in items 
            if query in item['name'].lower() or query in item['description'].lower()
        ]
        return jsonify(filtered_items)
    
    return jsonify(items)

if __name__ == '__main__':
    app.run(debug=True)
