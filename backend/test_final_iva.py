import requests
import json

BASE_URL = "http://localhost:4000/api/inventory"

def test_final_upload():
    import random
    nit = f"999{random.randint(100,999)}-{random.randint(1,9)}"
    # First, let's create a test provider
    prov_resp = requests.post("http://localhost:4000/api/proveedores", json={
        "nombre": "PROVEEDOR TEST IVA FINAL",
        "nit": nit,
        "contacto": "Test Contact"
    })
    
    if prov_resp.status_code != 201:
        print(f"Provider creation failed: {prov_resp.status_code}")
        print(prov_resp.text)
        return

    provider_id = prov_resp.json().get('id')
    print(f"Created provider ID: {provider_id} with NIT: {nit}")

    test_data = [
        {
            "codigo_barras": f"IVA_FINAL_{random.randint(100,999)}",
            "nombre": "Producto Final con IVA",
            "cantidad": 5,
            "precio_compra": 1500,
            "iva": 19,
            "proveedor_id": provider_id
        }
    ]

    response = requests.post(f"{BASE_URL}/batch-upload", json=test_data)
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

if __name__ == "__main__":
    test_final_upload()
