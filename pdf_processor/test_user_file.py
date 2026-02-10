import requests
import os

pdf_file = r"C:\proyectos\software inventario\fv09014117630472026000000xee4.pdf"
url = "http://localhost:5000/process"

print(f"Testing with file: {pdf_file}")

try:
    with open(pdf_file, 'rb') as f:
        files = {'file': (os.path.basename(pdf_file), f, 'application/pdf')}
        response = requests.post(url, files=files)
    
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
