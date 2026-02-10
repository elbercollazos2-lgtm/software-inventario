import pdfplumber

def extract_text(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf, open('debug_output.txt', 'w', encoding='utf-8') as f:
            for i, page in enumerate(pdf.pages):
                f.write(f"--- Página {i+1} ---\n")
                text = page.extract_text()
                f.write(text if text else "[Vacío o Imagen]")
                f.write("\n\n")
        print("✅ Texto guardado en debug_output.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text('fv09014117630472026000000xee4.pdf')
