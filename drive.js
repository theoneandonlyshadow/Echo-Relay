const { Model } = require('./public/monkeese/model.js');
const { connect } = require('./public/monkeese/dbCon.js')
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const bodyParser = require('body-parser');
const app = express();

const PORT = 3000;
const Size = 7 * 1024 * 1024 * 1024; //just use a variable bruh

connect('mongodb+srv://madhavnair700:devatheking7@echorelay.jaedn.mongodb.net/');
// JP: connect('mongodb://127.0.0.1:27017/user?directConnection=true&serverSelectionTimeoutMS=2000');
// MN: connect('mongodb+srv://<username>:<password>@echorelay.jaedn.mongodb.net/');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

//Use camelCase instead of naming variables like a barbarian
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: Size }
});

const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

async function driveUpload(filePath, fileName) {
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

    // change later
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return fileId;
}

async function zip(files, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`files compressed to zip: ${outputPath}`);
            resolve();
        });

        // if zipping encounters error. debugging
        archive.on('error', (err) => {
            console.error('archiving error:', err);
            reject(err);
        });

        archive.pipe(output);

        files.forEach((file) => {
            console.log(`checking: ${file.path}`);

            if (fs.existsSync(file.path)) {
                console.log(`adding file to zip: ${file.originalName} from ${file.path}`);
                archive.file(file.path, { name: file.originalName });
            } else {
                console.error(`file not found: ${file.path}`);
            }
        });

        archive.finalize();
    });
}

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

        res.redirect(`/success?link=${encodeURIComponent(downloadLink)}`);
    } catch (error) {
        console.error('Upload error:', error);
        res.render('error');
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