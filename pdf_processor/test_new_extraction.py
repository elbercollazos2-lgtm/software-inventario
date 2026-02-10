import requests

def test_extraction():
    url = "http://localhost:5001/process"
    files = {'file': ('test.pdf', open(r"C:\proyectos\software inventario\fv09014117630472026000000xee4.pdf", 'rb'), 'application/pdf')}
    
    try:
        response = requests.post(url, files=files)
        print(f"Status: {response.status_code}")
        print("Response:")
        data = response.json()
        print(f"Provider: {data.get('provider')}")
        print(f"NIT: {data.get('provider_nit')}")
        print(f"Total items: {data.get('total_items')}")
        for item in data.get('items', [])[:3]:
            print(f"  - {item['sku']}: {item['description']} ({item['qty']} x {item['cost']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_extraction()
