const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const archiver = require('archiver');

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
                console.log(`adding file to zip: ${file.originalName} from ${file.path}`);
                archive.file(file.path, { name: file.originalName });
            } else {
                console.error(`file not found: ${file.path}`);
            }
        });

        archive.finalize();
    });
}

module.exports = { driveUpload, driveDelete, restDelete, zip };