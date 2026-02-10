import pdfplumber
import sys

def debug_pdf(path):
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            lines = text.split('\n')
            print(f"--- Top Lines ---")
            for line in lines[:20]:
                print(line)
            
            print(f"\n--- Items Area ---")
            found_desc = False
            for line in lines:
                if "Descripción" in line:
                    found_desc = True
                if found_desc:
                    print(line)

if __name__ == "__main__":
    debug_pdf(r"C:\proyectos\software inventario\fv09014117630472026000000xee4.pdf")
