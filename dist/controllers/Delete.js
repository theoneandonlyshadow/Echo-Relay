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
const { drive } = require('./DefaultController.js');
const { Model } = require('../monkeese/model.js');
const fs = require('fs');
const path = require('path');
const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');
const HandleDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileId } = req.params;
    try {
        yield driveDelete(fileId);
        const fileRecord = yield Model.findOneAndDelete({ fileid: fileId });
        if (!fileRecord) {
            res.render('error', { message: 'File not found', status_code: 400 });
        }
        res.render('deleted');
    }
    catch (error) {
        console.error(`${err} Error deleting file:`, error);
        res.render('error', { message: 'Error deleting file', status_code: 500 });
    }
});
function driveDelete(fileId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${info} File ID: ${fileId}`);
        try {
            const resp = yield drive.files.delete({
                fileId: fileId,
            });
            console.log(`${info} File deleted: ${fileId}`);
            return resp;
        }
        catch (error) {
            console.error(`${info} Error deleting file:`, error);
            throw error;
        }
    });
}
function restDelete(hashDir) {
    try {
        const files = fs.readdirSync(hashDir);
        files.forEach(file => fs.unlinkSync(path.join(hashDir, file)));
        console.log(`${info} Temporary files deleted`);
    }
    catch (error) {
        console.error(`${err} Error deleting temporary files:`, error);
        throw error;
    }
}
function monitorDeletion() {
    return __awaiter(this, void 0, void 0, function* () {
        const changeStream = Model.watch([{ $match: { operationType: 'delete' } }]);
        changeStream.on('change', (change) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedId = change.documentKey._id;
                const deletedDoc = change.fullDocument;
                if (deletedDoc && deletedDoc.fileid) {
                    yield driveDelete(deletedDoc.fileid);
                    console.log(`[INFO] File with ID ${deletedDoc.fileid} deleted from Google Drive.`);
                }
                else {
                    console.log(`[INFO] Deleted document with ID ${deletedId} has no associated fileid.`);
                }
            }
            catch (error) {
                console.error(`${err} Error processing deletion:`, error);
            }
        }));
        changeStream.on('error', (error) => {
            console.error(`${err} Change stream error:`, error);
        });
    });
}
module.exports = { HandleDelete, driveDelete, restDelete, monitorDeletion };
