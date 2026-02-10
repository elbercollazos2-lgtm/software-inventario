from reportlab.pdfgen import canvas
import requests
import os

# 1. Generate PDF (Simulated Invoice)
pdf_file = "invoice_test.pdf"
c = canvas.Canvas(pdf_file)
c.drawString(100, 800, "INVOICE #2026-001")
c.drawString(100, 780, "Vendor: Supermarket Supplies")
c.drawString(100, 750, "SKU          Description          Qty     Price")
c.drawString(100, 730, "PROD-001     Jabon Liquido        5       12.50")
c.drawString(100, 715, "ITEM-999     Cepillo Dental       10      5.00")
c.drawString(100, 700, "SKU-ABC      Galletas Oreo        20      1.99")
c.drawString(100, 685, "INVALID      Zero Qty             0       10.00")
c.drawString(100, 670, "NO-PRICE     Missing price        5")
c.save()

print(f"Generated {pdf_file}")

# 2. Send to API
url = "http://localhost:5000/process"
try:
    with open(pdf_file, 'rb') as f:
        files = {'file': (pdf_file, f, 'application/pdf')}
        response = requests.post(url, files=files)
    
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
