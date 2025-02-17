const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: 'creds/serviceacc.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

const LinkLogger = (req, res, next) => {
    console.log(`requested: ${req.url}`);
    next();
}

module.exports = { drive, LinkLogger };