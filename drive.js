const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

async function uploadFileToDrive(filePath, fileName) {
    const fileMetadata = {
        name: fileName,
    };

    const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });

    const fileId = response.data.id;

    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return fileId;
}



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        const fileId = await uploadFileToDrive(filePath, fileName);

        const downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;


        res.redirect(`/success.html?link=${encodeURIComponent(downloadLink)}`);
    } catch (error) {
        console.error('Upload failed:', error);
        res.redirect('/error.html');
    } finally {
        fs.unlinkSync(req.file.path);
    }
});

app.get('/download/:id', (req, res) => {
    const fileId = req.params.id;
    const url = `https://drive.google.com/uc?id=${fileId}&export=download`;
    res.redirect(url);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
