import app
import json

def test_api():
    with app.app.test_client() as client:
        print("Testing /api/items...")
        response = client.get('/api/items')
        
        if response.status_code != 200:
            print(f"FAILED: Status code {response.status_code}")
            return
            
        data = json.loads(response.data)
        print(f"Fetched {len(data)} items.")
        
        if len(data) == 0:
            print("WARNING: 0 items returned.")
            return

        first_item = data[0]
        print("First item sample:", json.dumps(first_item, indent=4))
        
        # Check required fields
        required = ['name', 'description', 'rarity']
        missing = [f for f in required if f not in first_item]
        
        if missing:
            print(f"FAILED: Missing keys in response: {missing}")
        else:
            print("SUCCESS: Response structure is correct.")

if __name__ == "__main__":
    test_api()
