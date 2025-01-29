const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const crypto = require('crypto');
const archiver = require('archiver');
const { Model } = require('../monkeese/model');

const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// [function declaration] upload files to drive
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
    console.log(`File ID: ${fileId}`);

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

// [function declaration] delete files from drive on user's action 
async function driveDelete(fileId) {
    console.log(`File ID: ${fileId}`);
    try {
        const resp = await drive.files.delete({
            fileId: fileId,
        });
        console.log(`File deleted: ${fileId}`);
        return resp;
    }
    catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// [function declaration] delete files from drive after records expire from database
async function monitorDeletion() {
    const changeStream = Model.watch([{ $match: { operationType: 'delete' } }]);

    changeStream.on('change', async (change) => {
        try {
            const deletedId = change.documentKey._id;
            const deletedDoc = change.fullDocument;

            if (deletedDoc && deletedDoc.fileid) {
                await driveDelete(deletedDoc.fileid);
                console.log(`File with ID ${deletedDoc.fileid} deleted from Google Drive.`);
            } else {
                console.log(`Deleted document with ID ${deletedId} has no associated fileid.`);
            }
        } catch (error) {
            console.error('Error processing deletion:', error);
        }
    });

    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
    });
}

// [function declaration] delete hashed files after successful upload
function restDelete(hashDir) {
    try {
        const files = fs.readdirSync(hashDir);
        files.forEach(file => fs.unlinkSync(path.join(hashDir, file)));
        console.log('Temporary files deleted');
    }
    catch (error) {
        console.error('Error deleting temporary files:', error);
        throw error;
    }
}

//[function declaration] zip the uploaded files
async function zip(files, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`files compressed to zip: ${outputPath}`);
            resolve();
        });

        // if zipping encounters error debugging
        archive.on('error', (err) => {
            console.error('archiving error:', err);
            reject(err);
        });

        archive.pipe(output);

        files.forEach((file) => {
            console.log(`checking: ${file.path}`);

            if (fs.existsSync(file.path)) {
                console.log(`adding file to zip: ${file.originalname} from ${file.path}`);
                archive.file(file.path, { name: file.originalname });
            } else {
                console.error(`file not found: ${file.path}`);
            }
        });

        archive.finalize();
    });
}

// [function declaration] meet shorty, it midgets the url
async function shorty(req) {
    let code;
    let isUnique = false;
    const base_url = `${req.protocol}://${req.get('host')}`;
    while (!isUnique) {
        code = shortCode();
        const shortUrl = `${base_url}/${code}`;
        const existing = await Model.findOne({ shorty: shortUrl });
        if (!existing) isUnique = true;
    }
    const shortUrl = `${base_url}/${code}`;
    return shortUrl;
}

function shortCode() {
    random = crypto.randomBytes(20).toString('hex').substring(0,6);
    console.log(`shortCode: ${random}`);
    return random;
}

module.exports = { driveUpload, driveDelete, restDelete, monitorDeletion, zip, shorty };