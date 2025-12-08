import urllib.request
import json
import os
import re

# Sources
ITEMS_URL = "https://raw.githubusercontent.com/Rchardon/RebirthItemTracker/master/items.json"
BOSSES_WIKI_URL = "https://bindingofisaacrebirth.fandom.com/wiki/Bosses"
ENEMIES_WIKI_URL = "https://bindingofisaacrebirth.fandom.com/wiki/Monsters"

def fetch_json(url):
    print(f"Fetching JSON from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            return json.loads(data)
    except Exception as e:
        print(f"Error fetching JSON: {e}")
        return {}

def fetch_wiki_names(url, category_name):
    print(f"Fetching {category_name} from {url}...")
    names = set()
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # Very basic scraping: Look for links with titles that might be entities
            # We look for <a href="/wiki/..." title="...">Name</a>
            # This is heuristic and might include some noise, but it's a start.
            # We try to filter by checking if it's likely a content link.
            
            # Regex to capture title attribute from anchor tags
            matches = re.findall(r'<a[^>]+title="([^"]+)"[^>]*>', html)
            
            for name in matches:
                # Filter out obvious non-entity pages
                if ':' in name or 'User' in name or 'Talk' in name or 'Special' in name or 'File' in name or 'Category' in name:
                    continue
                if name in ["Home", "Wiki", "Community", "Search", "Edit"]:
                    continue
                names.add(name)
                
    except Exception as e:
        print(f"Error fetching {category_name}: {e}")
    
    sorted_names = sorted(list(names))
    print(f"Found {len(sorted_names)} potential {category_name}.")
    
    # improved structure
    return [{"name": name, "type": category_name} for name in sorted_names]

def save_json(data, filename):
    print(f"Saving data to {filename}...")
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
    print("Done.")

def main():
    # 1. Fetch Items
    raw_items = fetch_json(ITEMS_URL)
    
    # Convert dict of items to list and add ID if missing
    items = []
    if isinstance(raw_items, dict):
        for key, value in raw_items.items():
             # Some items might be simple strings if the format is weird, but usually they are dicts
             if isinstance(value, dict):
                 value['id'] = key # Ensure ID is present
                 items.append(value)
    elif isinstance(raw_items, list):
        items = raw_items
    
    print(f"Processed {len(items)} items.")
    save_json(items, 'items.json')

    # 2. Fetch Bosses
    bosses = fetch_wiki_names(BOSSES_WIKI_URL, "Boss")
    save_json(bosses, 'bosses.json')
    
    # 3. Fetch Enemies
    enemies = fetch_wiki_names(ENEMIES_WIKI_URL, "Enemy")
    save_json(enemies, 'enemies.json')

    # 4. Create all_data.txt
    print("Creating all_data.txt...")
    with open('all_data.txt', 'w', encoding='utf-8') as f:
        f.write("=== ITEMS ===\n")
        f.write(f"Total: {len(items)}\n\n")
        for item in items:
            name = item.get('name', 'Unknown')
            desc = item.get('text', item.get('description', ''))
            f.write(f"Name: {name}\nDescription: {desc}\n\n")
        
        f.write("\n=== BOSSES ===\n")
        f.write(f"Total: {len(bosses)}\n\n")
        for boss in bosses:
            f.write(f"{boss['name']}\n")
        
        f.write("\n=== ENEMIES ===\n")
        f.write(f"Total: {len(enemies)}\n\n")
        for enemy in enemies:
            f.write(f"{enemy['name']}\n")
    print("All tasks completed.")

if __name__ == "__main__":
    main()
