import pdfplumber

pdf_file = r"C:\proyectos\software inventario\fv09014117630472026000000xee4.pdf"

with pdfplumber.open(pdf_file) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"--- Page {i+1} Tables ---")
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
