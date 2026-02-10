from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import io
import logging
import re
import pdfplumber

from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF Processor Agent")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_invoice_text(pages):
    """
    Advanced logic to group words by Y coordinate to find rows.
    """
    items = []
    provider_name = ""
    provider_nit = ""
    
    for i, page in enumerate(pages):
        text = page.extract_text()
        if not text:
            continue
            
        lines = text.split('\n')
        
        # Extraction of provider info from first page
        if i == 0:
            for line in lines[:15]:
                # Look for NIT pattern
                nit_match = re.search(r'Nit:?\s*([\d\.\-]+)', line, re.IGNORECASE)
                if nit_match:
                    if not provider_nit:
                        provider_nit = nit_match.group(1)
                    continue # Skip NIT lines for provider name
                
                # First lines usually contain the company name
                # Clean up line: remove "FACTURA..." if present at the end
                clean_line = re.sub(r'\s+FACTURA.*$', '', line, flags=re.IGNORECASE).strip()
                
                if not provider_name and len(clean_line) > 3 and "Página" not in clean_line:
                    provider_name = clean_line

        for line in lines:
            # logger.debug(f"Processing line: {line}")
            # Improved pattern to be more flexible
            match = re.search(r'(\d+[\.,]\d+)\s+([A-Z0-9\-]{3,})\s+(.+?)\s+(?:GRM|UND|PCS|UNID|KIL|PAQ|DSP)\s+(\d+[\.,]\d+)\s+\$?\s?([\d\.]+[\.,]\d+)', line)
            
            if match:
                sku = match.group(2)
                desc = match.group(3).strip()
                try:
                    qty = float(match.group(4).replace(',', '.'))
                    # Remove thousand separator (dot) and replace decimal separator (comma)
                    price_str = match.group(5).replace('.', '').replace(',', '.')
                    cost = float(price_str)
                    
                    if qty > 0 and cost > 0:
                        items.append({
                            "sku": sku,
                            "description": desc,
                            "qty": qty,
                            "cost": cost
                        })
                        logger.info(f"Found item: {sku} - {desc}")
                except ValueError:
                    continue
                    
    return items, provider_name, provider_nit

@app.get("/")
def read_root():
    return {"status": "active", "service": "pdf_processor", "version": "2.1.provider"}

@app.post("/process")
async def process_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        content = await file.read()
        file_obj = io.BytesIO(content)
        
        items = []
        provider_name = ""
        provider_nit = ""
        
        with pdfplumber.open(file_obj) as pdf:
            items, provider_name, provider_nit = parse_invoice_text(pdf.pages)
        
        logger.info(f"Processed: {file.filename} - Found {len(items)} items, Provider: {provider_name}")
        
        return {
            "filename": file.filename,
            "items": items,
            "total_items": len(items),
            "provider": provider_name,
            "provider_nit": provider_nit
        }
        
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
