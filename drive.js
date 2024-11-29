const { Model } = require('./model.js');
const { connect } = require('./dbCon.js')
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

connect('mongodb://127.0.0.1:27017/user?directConnection=true&serverSelectionTimeoutMS=2000');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Use camelCase instead of naming variables like a barbarian
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: Size, }
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
    console.log('files uploaded:', req.files);

    if (!req.files || req.files.length === 0) {
        console.error('no files uploaded. error.');
        return res.redirect('/error.html');
    }

    try {
        const files = req.files;
        const uploadedFile = `ERMNJP_${Date.now()}.zip`;
        const uploadedFilePath = path.join(__dirname, 'uploads', uploadedFile);
        await zip(files, uploadedFilePath);
        const uploadedFileId = await driveUpload(uploadedFilePath, uploadedFile);
        const downloadLink = `https://drive.google.com/uc?id=${uploadedFileId}&export=download`;
        const file = new Model({ name: uploadedFile, size: Size, fileid: uploadedFileId, url: downloadLink });
        try {
            await file.save();
            fs.unlinkSync(uploadedFilePath);
            files.forEach((file) => fs.unlinkSync(file.path));
            res.redirect(`/success.html?link=${encodeURIComponent(downloadLink)}`);
        } catch (err) {
            console.error('error deleting uploaded file from local system:', err);
            res.redirect('/error.html');
        }
    } catch (error) {
        console.error('upload failed:', error);
        res.redirect('/error.html');
    }
});


app.listen(PORT, () => {
    console.log(`the server is running at http://localhost:${PORT}`);
});

