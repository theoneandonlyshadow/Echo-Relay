const { Model } = require('./public/monkeese/model.js');
const { connect } = require('./public/monkeese/dbCon.js');
const { driveUpload, restDelete, zip, driveDelete } = require('./public/controllers/controller.js');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const Size = 7 * 1024 * 1024 * 1024;
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: Size }
});

connect('mongodb+srv://madhavnair700:devatheking7@echorelay.jaedn.mongodb.net/');
// JP: connect('mongodb://127.0.0.1:27017/user?directConnection=true&serverSelectionTimeoutMS=2000');
// MN: connect('mongodb+srv://<username>:<password>@echorelay.jaedn.mongodb.net/');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.render('error');

    try {
        const files = req.files;
        const zipFileName = `upload_${Date.now()}.zip`;
        const zipFilePath = path.join(__dirname, 'uploads', zipFileName);

        await zip(files, zipFilePath);

        const fileId = await driveUpload(zipFilePath, zipFileName);
        const downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;

        const fileRecord = new Model({ name: zipFileName, size: Size, fileid: fileId, url: downloadLink });
        await fileRecord.save();

        fs.unlinkSync(zipFilePath);
        files.forEach((file) => fs.unlinkSync(file.path));

        const dir = path.join(__dirname, 'uploads');
        restDelete(dir);

        res.redirect(`/success?link=${encodeURIComponent(downloadLink)}`);
    } catch (error) {
        console.error('Upload error:', error);
        res.render('error');
    }
});

app.delete('/delete/:fileId', async (req, res) => {
    const { fileId } = req.params;
    try {
        await driveDelete(fileId);
        const fileRecord = await Model.findOneAndDelete({ fileid: fileId });
        if (!fileRecord) {
            return res.status(404).json({ message: 'File not found in database.' });
        }
        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file.', error: error.message });
    }
});

app.get('/success', (req, res) => {
    const downloadLink = req.query.link;
    if (!downloadLink) {
        return res.render('error');
    }
    res.render('success', { downloadLink });
});

app.listen(PORT, () => {
    console.log(`the server is running at http://localhost:${PORT}`);
});