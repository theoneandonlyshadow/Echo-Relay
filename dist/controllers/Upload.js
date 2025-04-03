"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { hashPass, encryptHash } = require('./Encryption.js');
const { restDelete } = require('./Delete.js');
const { zip } = require('./Zip.js');
const { shorty } = require('./Shorty.js');
const { Model } = require('../monkeese/model.js');
const { drive } = require('./DefaultController.js');
const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');
const fs = require('fs');
const path = require('path');
const HandleUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || req.files.length === 0)
        return res.render('error', { message: "No files selected", status_code: 400 });
    try {
        const files = req.files;
        const pass = req.body.password || '';
        const hashedpass = pass ? hashPass(pass) : pass;
        const enc = encryptHash(hashedpass);
        const zipFileName = `ER_${Date.now()}.zip`;
        const zipFilePath = path.join('uploads', zipFileName);
        const fileSizeInBytes = files.reduce((acc, file) => acc + file.size, 0);
        const fileSizeinMB = ((fileSizeInBytes / 1024) / 1024);
        yield zip(files, zipFilePath);
        const fileId = yield driveUpload(zipFilePath, zipFileName);
        const downloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
        const shortUrl = yield shorty(req);
        const shortCode = shortUrl.split('/').pop();
        const fileRecord = new Model({
            name: zipFileName,
            size: fileSizeinMB,
            fileid: fileId,
            encryptHash: enc.encHash,
            encryptKey: enc.encKey,
            iv: enc.iv,
            kiv: enc.kIv,
            url: downloadLink,
            shorty: shortUrl,
            shortCode: shortCode
        });
        yield fileRecord.save();
        fs.unlinkSync(zipFilePath);
        files.forEach((file) => fs.unlinkSync(file.path));
        const dir = path.join(process.cwd(), 'uploads');
        restDelete(dir);
        res.redirect(`/success?link=${encodeURIComponent(downloadLink)}&shortUrl=${encodeURIComponent(shortUrl)}`);
    }
    catch (error) {
        console.error(`${err} Upload error:`, error);
        res.render('error', { message: "Some error occurred while uploading the files.", status_code: 500 });
    }
});
function driveUpload(filePath, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileMetadata = {
            name: fileName,
        };
        const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath),
        };
        const response = yield drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        const fileId = response.data.id;
        console.log(`${info} File ID: ${fileId}`);
        // change later
        yield drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        return fileId;
    });
}
module.exports = { HandleUpload, driveUpload };
