
import json
import os
import re

def normalize_name(name):
    """Normalize string for fuzzy matching (lowercase, alphanumeric only)."""
    return re.sub(r'[^a-z0-9]', '', name.lower())

def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def link_images(items_file, collectibles_dir):
    items = load_json(items_file)
    
    # Get all image files in the directory
    image_files = os.listdir(collectibles_dir)
    image_map = {normalize_name(f.rsplit('.', 1)[0]): f for f in image_files if f.endswith('.png')}
    
    matched_count = 0
    total_items = len(items)
    
    for item in items:
        name = item.get('name', '')
        normalized_name = normalize_name(name)
        
        # Try exact match on normalized name
        if normalized_name in image_map:
            item['image'] = f"/static/collectibles/{image_map[normalized_name]}"
            matched_count += 1
            continue
            
        # Try some special case replacements commonly found in binding of isaac names
        # e.g., <3 -> lessthan3 (based on file list I saw)
        special_cases = {
            "<3": "lessthan3",
            "1up!": "1up",
            "smart fly": "smart_fly", # spaces might be underscores in map but we strip them in normalize. 
                                      # Wait, my normalize removes underscores too.
                                      # Let's see... 'items.json' has "Smart Fly", normalized: "smartfly"
                                      # File: "smart_fly.png", normalized: "smartfly"
                                      # So normalizing by removing special chars should work for most underscores too!
        }
        
        # Check if the name has a special mapping or handle specific nuances if needed
        # But let's rely on the simple normalization first.
        
    save_json(items_file, items)
    print(f"Matched {matched_count} images out of {total_items} items.")

if __name__ == "__main__":
    ITEMS_FILE = 'items.json'
    COLLECTIBLES_DIR = 'static/collectibles'
    link_images(ITEMS_FILE, COLLECTIBLES_DIR)
