require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { HandlePostReceive, HandleGetById, HandleQuickReceive } = require('./public/controllers/Receive.js');
const { LinkLogger } = require('./public/controllers/DefaultController.js');
const { renderNotFound } = require('./public/controllers/RenderPage.js');
const { HandleDownload } = require('./public/controllers/Download.js');
const { connect } = require('./public/monkeese/dbCon.js');
const monitorDeletion = require('./public/controllers/Delete.js').monitorDeletion;
const initializeWebSocketServer = require('./public/controllers/Socket.js');
const { info } = require('./public/controllers/LoggerStyles.js');
const app = express();
const server = http.createServer(app);
const PORT = 3000;
const WS_PORT = 8090;
const mongoURI = process.env.MONGO_URI;

connect(mongoURI);

const wssServer = http.createServer();
initializeWebSocketServer(wssServer);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.use(LinkLogger);

app.use('/upload', require('./public/routes/uploadRouter.js'));
app.use('/delete', require('./public/routes/deleteRouter.js'));
app.use('/', require('./public/routes/pagesRouter.js'));
app.use('/update-wss', require('./public/routes/wssRouter.js'));

app.post('/receive', HandlePostReceive);
app.post('/', HandleDownload);
app.get('/:fileId', HandleGetById);
app.get('/q/:fileId', HandleQuickReceive);

app.use(renderNotFound);

monitorDeletion();

server.listen(PORT, () => {
    console.log(`${info} ExpressRelay initialized at http://localhost:${PORT}`);
});

wssServer.listen(WS_PORT, () => {
    console.log(`${info} WebSocket initialized at ws://localhost:${WS_PORT}`);
});