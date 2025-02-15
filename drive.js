require('dotenv').config();
const { LinkLogger, drive } = require('./public/controllers/DefaultController.js');
const { HandleUpload, driveUpload } = require('./public/controllers/Upload.js');
const { HandleDelete, driveDelete, restDelete, monitorDeletion } = require('./public/controllers/Delete.js');
const { HandleSuccess } = require('./public/controllers/Success.js');
const { HandlePostReceive, HandleGetById, HandleQuickReceive } = require('./public/controllers/Receive.js');
const { HandleDownload } = require('./public/controllers/Download.js');
const { connect } = require('./public/monkeese/dbCon.js');
const express = require('express');
const multer = require('multer');
const path = require('path');
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

app.use(LinkLogger);

app.post('/upload', upload.array('files'), HandleUpload);

app.delete('/delete/:fileId', HandleDelete);

app.get('/success', HandleSuccess);

app.get('/deleted', (req, res) => {
    return res.render('deleted');
});

app.get('/receive', (req, res) => {
    return res.render('receive');
});

app.post('/receive', HandlePostReceive);

app.get('/:fileId', HandleGetById);

app.get('/q/:fileId', HandleQuickReceive);

app.post('/', HandleDownload);

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