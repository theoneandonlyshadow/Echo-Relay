const { Model } = require('./public/monkeese/model.js');
const { connect } = require('./public/monkeese/dbCon.js');
const { driveUpload, restDelete, monitorDeletion, zip, driveDelete, shorty } = require('./public/controllers/controller.js');
const { Readable } = require('stream')
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const sizeLimit = 7 * 1024 * 1024 * 1024;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: sizeLimit }
});

connect('mongodb+srv://madhavnair700:devatheking7@echorelay.jaedn.mongodb.net/');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    console.log(`requested: ${req.url}`);
    next();
});

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
        const shortCode = shortUrl.split('/').pop();

        const fileRecord = new Model({ 
            name: zipFileName, 
            size: fileSizeinMB,
            fileid: fileId, 
            url: downloadLink, 
            shorty: shortUrl,
            shortCode: shortCode
        });
        await fileRecord.save();

        fs.unlinkSync(zipFilePath);
        files.forEach((file) => fs.unlinkSync(file.path));

        const dir = path.join(__dirname, 'uploads');
        restDelete(dir);

        res.redirect(`/success?link=${encodeURIComponent(downloadLink)}&shortUrl=${encodeURIComponent(shortUrl)}`); 
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

<<<<<<< HEAD
app.get('/success', async (req, res) => {
    try {
        const downloadLink = req.query.link;
        const shorty = req.query.shortUrl;

        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid' });
        }
        const shortCode = shorty.slice(-6);
        const file = await Model.findOne({ shortCode });
        if (!file) {
            return res.render('error', { message: 'Invalid ShortURL, file not found' });
        }
        res.render('success', { downloadLink, shorty });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Server Error' });
    }
=======
app.get('/success', (req, res) => {
    const downloadLink = req.query.link;
    const shorty = req.query.shortUrl;
    if (!downloadLink || !shorty) {
        return res.render('error', { message: 'Some error occurred while fetching the URLs' });
    }
    res.render('success', { downloadLink, shorty });
>>>>>>> 52faa75e31e26841535c522b62eb9cd7c7e106b4
});

app.get('/deleted', (req, res) => {
    return res.render('deleted');
});

app.get('/receive', (req, res) => {
    return res.render('receive');
});

app.post("/receive", async (req, res) => {
    try {
        let { fileId } = req.body;

        if(fileId.startsWith('http://') || fileId.startsWith('https://')) {
            fileId = fileId.split('/').pop();
        }

        if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
            return res.status(400).render("error", { message: "Invalid file URL or ID." });
        }

        const fileRecord = await Model.findOne({
            $or: [{ shortCode: fileId }, { fileid: fileId }]
        });

        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found" });
        }

        const downloadURL = `https://drive.google.com/uc?id=${fileRecord.fileid}&export=download`;
        const response = await fetch(downloadURL);

        if (!response.ok) {
            return res.status(response.status === 404 ? 404 : 500).render("error",
                { message: response.status === 404 ? "File not found" : "Error fetching file" }
            );
        }

        let fileName = "ER_DEFAULT";
        const contentDisposition = response.headers.get("content-disposition");
        const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?([^;]*)/);

        if (match?.[1]) {
            fileName = decodeURIComponent(match[1]).replace(/"/g, "");
        }

        res.set({
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        });

        return response.body
            ? Readable.fromWeb(response.body).pipe(res)
            : res.status(500).render("error", { message: "Unable to retrieve file stream." });

    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).render("error", { message: "An unexpected server error occurred while processing your request." });
    }
});

app.get('/error', (req, res) => {
    const errorMessage = req.query.message || 'An unexpected error occurred';
    return res.render('error', { message: errorMessage });
});

app.get('/', (req, res) => {
    return res.render('home');
});

app.use((req, res, next) => { 
    res.status(404).render('404');
});

monitorDeletion();

app.listen(PORT, () => {
    console.log(`the server is running at http://localhost:${PORT}`);
});