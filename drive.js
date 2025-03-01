require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { HandlePostReceive, HandleGetById, HandleQuickReceive } = require('./public/controllers/Receive.js');
const { LinkLogger } = require('./public/controllers/DefaultController.js');
const { renderNotFound } = require('./public/controllers/RenderPage.js');
const { HandleDownload } = require('./public/controllers/Download.js');
const { connect } = require('./public/monkeese/dbCon.js');
const monitorDeletion = require('./public/controllers/Delete.js').monitorDeletion;

const app = express();
const PORT = 3000;
const mongoURI = process.env.MONGO_URI;

connect(mongoURI);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.use(LinkLogger);

app.use('/upload', require('./public/routes/uploadRouter.js'));
app.use('/delete', require('./public/routes/deleteRouter.js'));
app.use('/', require('./public/routes/pagesRouter.js'));

app.post('/receive', HandlePostReceive);
app.post('/', HandleDownload);
app.get('/:fileId', HandleGetById);
app.get('/q/:fileId', HandleQuickReceive);

app.use(renderNotFound);

monitorDeletion();

app.listen(PORT, () => {
    console.log(`[INFO] The server is running at http://localhost:${PORT}`);
});
