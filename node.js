const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload());
app.use(express.static('public'));

app.post('/upload', (req, res) => {
    if (!req.files) return res.status(400).send('No file uploaded');
    const pdfFile = req.files.pdfFile;
    pdfFile.mv(`./uploads/${pdfFile.name}`, (err) => {
        if (err) return res.status(500).send(err);
        res.send('File uploaded!');
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
