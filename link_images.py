import json
import os
import re

def normalize_name(name):
    """Normalize string for fuzzy matching (lowercase, alphanumeric only)."""
    return re.sub(r'[^a-z0-9]', '', name.lower())

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filename, data):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

def link_images(items_file, collectibles_dir):
    print(f"Loading items from {items_file}...")
    items = load_json(items_file)
    
    print(f"Scanning images in {collectibles_dir}...")
    image_files = os.listdir(collectibles_dir)
    # Map normalized filename -> filename
    image_map = {normalize_name(f.rsplit('.', 1)[0]): f for f in image_files if f.endswith('.png')}
    
    # Special manual overrides for tricky names
    # Name in items.json -> Filename in static/collectibles (without extension)
    special_cases = {
        "<3": "lessthan3",
        "1up!": "1up",
        "question mark": "questionmark",
        "max's head": "crickets_head", # Known alias? No, Cricket's Head is ID 4. Max's Head was vanilla.
        # Add more if needed based on failures
    }

    matched_count = 0
    total_items = len(items)
    
    for item in items:
        name = item.get('name', '')
        
        # 1. Try manual special cases first (on original name)
        if name in special_cases:
            target_filename = special_cases[name]
            # Verify the file actually exists (normalized check)
            norm_target = normalize_name(target_filename)
            if norm_target in image_map:
                item['image'] = f"/static/collectibles/{image_map[norm_target]}"
                matched_count += 1
                continue

        # 2. Try normalized name match
        normalized_name = normalize_name(name)
        if normalized_name in image_map:
            item['image'] = f"/static/collectibles/{image_map[normalized_name]}"
            matched_count += 1
        elif normalized_name == "bookofbelial": # Handle the duplicate or passive version if needed
             # There might be multiple "book of belial"s?
             # ID 34 is active, ID 59 is passive (Judas Birthright)
             # file 'the_book_of_belial.png' -> 'thebookofbelial'
             # file 'book_of_belial.png' -> 'bookofbelial' (Exists? let's check output)
             if 'bookofbelial' in image_map:
                 item['image'] = f"/static/collectibles/{image_map['bookofbelial']}"
                 matched_count += 1
             elif 'thebookofbelial' in image_map:
                  item['image'] = f"/static/collectibles/{image_map['thebookofbelial']}"
                  matched_count += 1

    print(f"Matched {matched_count} images out of {total_items} items.")
    print("Saving updated items.json...")
    save_json(items_file, items)
    print("Done.")

if __name__ == "__main__":
    ITEMS_FILE = 'items.json'
    COLLECTIBLES_DIR = 'static/collectibles'
    link_images(ITEMS_FILE, COLLECTIBLES_DIR)
