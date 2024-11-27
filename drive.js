const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const bodyParser = require('body-parser');
const app = express();

const PORT = 3000; //put in env later

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 1 * 1024 * 1024 * 1024 } // this limits upload size to 1gb. remember that this is byte conversion. like 1 byte to 1kb to 1mb to 1gb (thats why 1024s are there).
});

const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

async function yeettodrive(filePath, fileName) {
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

async function zip(files, outputpath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputpath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`files compressed to zip: ${outputpath}`);
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
                console.log(`adding file to zip: ${file.originalname} from ${file.path}`);
                archive.file(file.path, { name: file.originalname });
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
        const uploadedfile = `ERMNJP_${Date.now()}.zip`;
        const uploadedfilepath = path.join(__dirname, 'uploads', uploadedfile);
        await zip(files, uploadedfilepath);
        const uploadedfileid = await yeettodrive(uploadedfilepath, uploadedfile);
        const downloadlink = `https://drive.google.com/uc?id=${uploadedfileid}&export=download`;
        fs.unlinkSync(uploadedfilepath);
        files.forEach((file) => fs.unlinkSync(file.path));
        res.redirect(`/success.html?link=${encodeURIComponent(downloadlink)}`);
    } catch (error) {
        console.error('upload failed:', error);
        res.redirect('/error.html');
    }
});


app.listen(PORT, () => {
    console.log(`a black man is running at http://localhost:${PORT}`);
});
