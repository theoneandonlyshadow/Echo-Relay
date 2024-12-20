const { Model } = require('./public/monkeese/model.js');
const { connect } = require('./public/monkeese/dbCon.js');
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const MAX_FILE_SIZE = 7 * 1024 * 1024 * 1024; // 7GB

// MongoDB connection
connect('mongodb+srv://madhavnair700:devatheking7@echorelay.jaedn.mongodb.net/');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

// Ensure 'uploads' folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer setup for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: MAX_FILE_SIZE },
});

const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Upload file to Google Drive
async function driveUpload(filePath, fileName) {
    try {
        const fileMetadata = { name: fileName };
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
            requestBody: { role: 'reader', type: 'anyone' },
        });

        return fileId;
    } catch (error) {
        throw new Error(`Drive upload failed: ${error.message}`);
    }
}

// Create a zip archive
async function zip(files, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);

        files.forEach((file) => {
            if (fs.existsSync(file.path)) {
                archive.file(file.path, { name: file.originalname });
            } else {
                console.error(`File not found: ${file.path}`);
            }
        });

        archive.finalize();
    });
}

app.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.render('error');

    try {
        const files = req.files;
        const zipFileName = `ER_${Date.now()}.zip`;
        const zipFilePath = path.join(__dirname, 'uploads', zipFileName);

        // compress all files into a zip
        await zip(files, zipFilePath);

        // upload the zip file to Google Drive
        const fileId = await driveUpload(zipFilePath, zipFileName);
        const googlelink = `https://drive.google.com/uc?id=${fileId}&export=download`;

        // url generator
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = crypto.randomBytes(20).toString('hex').substring(0, 6); // generate code
            const existing = await Model.findOne({ shorty: code });
            if (!existing) isUnique = true;
        }

        // save the file record to the db
        const fileRecord = new Model({
            name: zipFileName,
            size: files.reduce((acc, file) => acc + file.size, 0),
            fileid: fileId,
            url: googlelink,
            shorty: code,
        });
        await fileRecord.save();
        console.log('File record saved:', fileRecord);

        // delete temporary files
        fs.unlinkSync(zipFilePath);
        files.forEach((file) => fs.unlinkSync(file.path));

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const shortLink = `${baseUrl}/${code}`;
        res.redirect(`/success?link=${encodeURIComponent(shortLink)}`);
    } catch (error) {
        console.error('Upload error:', error.errors ? error.errors : error);
        res.render('error', { error });
    }
});

app.get('/:shorty', async (req, res) => {
    try {
        const code = req.params.shorty; 
        const record = await Model.findOne({ shorty: code });

        if (!record) {
            console.error(`Short URL not found: ${code}`);
            return res.render('error', { error: 'Short URL not found' });
        }

        res.redirect(record.url);
    } catch (error) {
        console.error('Redirect error:', error);
        res.render('error', { error: 'An error occurred during redirection' });
    }
});

app.get('/success', (req, res) => {
    try {
        const shortLink = req.query.link;

        if (!shortLink) {
            console.error('Short URL not found');
            return res.status(404).render('error', { error: 'Short URL not found' });
        }

        console.log('Rendering success page with shortLink:', shortLink);
        res.render('success', { shortLink });
    } catch (err) {
        console.error('Error rendering success page:', err);
        res.status(500).render('error', { error: 'An error occurred' });
    }
});

app.get('/receive', (req, res) => {
    res.render('receive');
});

// start the engine
app.listen(PORT, () => {
    console.log(`The server is running at http://localhost:${PORT}`);
});
