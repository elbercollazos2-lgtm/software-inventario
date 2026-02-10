import requests
import json

BASE_URL = "http://localhost:4000/api/inventory"

def test_validate_batch():
    test_items = [
        {"sku": "P204", "description": "AREQUIPE VASO DISPL 6X50 PROLECHE", "qty": 4, "cost": 8571},
        {"sku": "NEWITEM999", "description": "PRODUCTO DE PRUEBA NUEVO", "qty": 10, "cost": 5000}
    ]
    
    try:
        response = requests.post(f"{BASE_URL}/validate-batch", json=test_items)
        print(f"Status: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_validate_batch()
