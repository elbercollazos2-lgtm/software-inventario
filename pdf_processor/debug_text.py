import pdfplumber
import re

pdf_file = r"C:\proyectos\software inventario\fv09014117630472026000000xee4.pdf"

with pdfplumber.open(pdf_file) as pdf:
    full_text = ""
    for page in pdf.pages:
        full_text += page.extract_text(layout=True) + "\n"

print("--- RAW TEXT START ---")
print(full_text)
print("--- RAW TEXT END ---")
