"use strict";
const { google } = require('googleapis');
const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');
const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });
const LinkLogger = (req, res, next) => {
    console.log(`${info} requested: ${req.url}`);
    next();
};
const handleSocket = (req, res) => {
    res.render('socket');
};
module.exports = { drive, LinkLogger, handleSocket };
