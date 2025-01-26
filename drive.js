const { Model } = require('./public/monkeese/model.js');
const { connect } = require('./public/monkeese/dbCon.js');
const { driveUpload, restDelete, monitorDeletion, zip, driveDelete, shorty } = require('./public/controllers/controller.js');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const PORT = 3000;
const sizeLimit = 7 * 1024 * 1024 * 1024;
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: sizeLimit }
});

//connect('mongodb://127.0.0.1:27017/user?directConnection=true&serverSelectionTimeoutMS=2000');
connect('mongodb+srv://madhavnair700:devatheking7@echorelay.jaedn.mongodb.net/');
// JP: connect('mongodb://127.0.0.1:27017/user?directConnection=true&serverSelectionTimeoutMS=2000');
// MN: connect('mongodb+srv://<username>:<password>@echorelay.jaedn.mongodb.net/');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.render('error');

    try {
        const files = req.files;
        const zipFileName = `ER_${Date.now()}.zip`;
        const zipFilePath = path.join(__dirname, 'uploads', zipFileName);
        const fileSizeInBytes = files.reduce((acc, file) => acc + file.size, 0);
        const fileSizeinMB = ((fileSizeInBytes / 1024) / 1024);
        await zip(files, zipFilePath);

        const fileId = await driveUpload(zipFilePath, zipFileName);
        const downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
        const shortUrl = await shorty(req);

        const fileRecord = new Model({ 
            name: zipFileName, 
            size: fileSizeinMB,
            fileid: fileId, 
            url: downloadLink, 
            shorty: shortUrl
        });
        await fileRecord.save();

        fs.unlinkSync(zipFilePath);
        files.forEach((file) => fs.unlinkSync(file.path));

        const dir = path.join(__dirname, 'uploads');
        restDelete(dir);

        res.redirect(`/success?link=${encodeURIComponent(downloadLink)}&shortUrl=${encodeURIComponent(shortUrl)}`); // Pass short URL to success route
    } catch (error) {
        console.error('Upload error:', error);
        res.render('error', { message: error.message });
    }
});

app.delete('/delete/:fileId', async (req, res) => {
    const { fileId } = req.params;
    try {
        await driveDelete(fileId);
        const fileRecord = await Model.findOneAndDelete({ fileid: fileId });
        if (!fileRecord) {
            res.render('error', { message: 'File not found' });
        }
        res.render('deleted');
    } catch (error) {
        console.error('Error deleting file:', error);
        res.render('error', { message: 'Error deleting file' });
    }
});

app.get('/success', (req, res) => {
    const downloadLink = req.query.link;
    const shorty = req.query.shortUrl;
    if (!downloadLink || !shorty) {
        return res.render('error', { message: 'Some error occurred while fetching the URLs' });
    }
    res.render('success', { downloadLink, shorty });
});

app.get('/deleted', (req, res) => {
    return res.render('deleted');
});

app.get('/receive', (req, res) => {
    return res.render('receive');
});

app.get('/', (req, res) => {
    return res.render('home');
})

app.use((req, res, next) => { 
    res.status(404).render('404') 
}) 

monitorDeletion();

app.listen(PORT, () => {
    console.log(`the server is running at http://localhost:${PORT}`);
});