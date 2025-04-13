// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

let currentPDF = null;

// Load PDF when file is uploaded
document.getElementById('pdf-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    
    loadingTask.promise.then((pdf) => {
        currentPDF = pdf;
        renderPDF(pdf);
    });
});

// Render PDF pages
function renderPDF(pdf) {
    const viewer = document.getElementById('pdf-viewer');
    viewer.innerHTML = ''; // Clear previous PDF

    for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then((page) => {
            const canvas = document.createElement('canvas');
            viewer.appendChild(canvas);
            
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({
                canvasContext: canvas.getContext('2d'),
                viewport
            });
        });
    }
}

// Add text to PDF (using pdf-lib)
document.getElementById('add-text').addEventListener('click', async () => {
    if (!currentPDF) return alert("Upload a PDF first!");
    
    const { PDFDocument } = PDFLib;
    const fileInput = document.getElementById('pdf-upload');
    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    firstPage.drawText("Hello, PDF!", {
        x: 50,
        y: 50,
        size: 30,
        color: PDFLib.rgb(1, 0, 0),
    });
    
    const modifiedPdfBytes = await pdfDoc.save();
    downloadPDF(modifiedPdfBytes);
});

// Save PDF
document.getElementById('save-pdf').addEventListener('click', async () => {
    if (!currentPDF) return alert("No PDF loaded!");
    const fileInput = document.getElementById('pdf-upload');
    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    downloadPDF(arrayBuffer);
});

// Download modified PDF
function downloadPDF(data) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.pdf';
    a.click();
}

// Example: Add image to PDF
document.getElementById('add-image').addEventListener('click', async () => {
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.load(await currentPDF.arrayBuffer);
    
    const imageBytes = await fetch('image.png').then(res => res.arrayBuffer());
    const image = await pdfDoc.embedPng(imageBytes);
    
    const pages = pdfDoc.getPages();
    pages[0].drawImage(image, {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
    });
    
    const modifiedPdfBytes = await pdfDoc.save();
    downloadPDF(modifiedPdfBytes);
});
