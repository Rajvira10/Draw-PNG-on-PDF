const express = require('express');
const { PDFDocument, drawImage } = require('pdf-lib');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
const port = 3000;

const upload = multer();

app.post('/api/process-pdf', upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files.pdfFile || !req.files.imageFile) {
      throw new Error('PDF and image files are required');
    }

    const { height, width, x, y } = req.body;
    const pdfBuffer = req.files.pdfFile[0].buffer;
    const imageBuffer = req.files.imageFile[0].buffer;

    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    // Embed the image
    const image = await pdfDoc.embedPng(imageBuffer);

    const page = pdfDoc.getPage(0);

    // Draw the image with the specified coordinates
    page.drawImage(image, {
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
    });

    // Save pdf locally
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('modified.pdf', pdfBytes);

    res.send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
