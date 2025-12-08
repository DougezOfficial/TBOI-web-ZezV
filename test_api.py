import app
import json

def test_api():
    with app.app.test_client() as client:
        # 1. Test Items (Random + Limit)
        print("Testing /api/items?random=true&limit=5...")
        response = client.get('/api/items?random=true&limit=5')
        data = json.loads(response.data)
        if len(data) == 5:
            print("SUCCESS: Items limit works.")
        else:
            print(f"FAILED: Expected 5 items, got {len(data)}")

        # 2. Test Bosses
        print("Testing /api/bosses...")
        response = client.get('/api/bosses')
        data = json.loads(response.data)
        print(f"Fetched {len(data)} bosses.")
        if len(data) > 0:
            print("SUCCESS: Bosses endpoint works.")
        else:
             print("FAILED: No bosses returned.")

        # 3. Test Enemies
        print("Testing /api/enemies...")
        response = client.get('/api/enemies')
        data = json.loads(response.data)
        print(f"Fetched {len(data)} enemies.")
        
        # 4. Test Featured
        print("Testing /api/featured...")
        response = client.get('/api/featured')
        data = json.loads(response.data)
        if "bosses" in data and "enemies" in data and "mini_bosses" in data:
            print("SUCCESS: Featured endpoint structure is correct.")
            print("Featured Bosses:", [b['name'] for b in data['bosses']])
        else:
             print("FAILED: Featured endpoint missing keys.")

if __name__ == '__main__':
    test_api()
