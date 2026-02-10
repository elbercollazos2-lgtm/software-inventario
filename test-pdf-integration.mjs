import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

async function testPDFProcessor() {
    console.log('🔍 Iniciando prueba del Procesador de PDFs (Agente Python)...');

    const pdfPath = path.resolve('fv09014117630472026000000xee4.pdf');
    if (!fs.existsSync(pdfPath)) {
        console.error('❌ Error: No se encontró el archivo PDF de prueba fv09014117630472026.pdf');
        return;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(pdfPath));

    try {
        const response = await axios.post('http://localhost:5001/process', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('✅ Conexión exitosa con el Agente Python');
        console.log('📄 Archivo procesado:', response.data.filename);
        console.log('📊 Items extraídos:', response.data.total_items);

        if (response.data.items && response.data.items.length > 0) {
            console.log('📌 Muestra del primer item:');
            console.log(response.data.items[0]);
            console.log('🌟 PRUEBA DE INTEGRACIÓN EXITOSA');
        } else {
            console.log('⚠️ No se extrajeron items del PDF. Verifique el formato del archivo.');
        }

    } catch (error) {
        console.error('❌ Error en la comunicación con el PDF Processor:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testPDFProcessor();
