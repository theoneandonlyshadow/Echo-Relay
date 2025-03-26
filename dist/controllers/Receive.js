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
const { ValidityCheck, shortyExtractor } = require('./FileValidation.js');
const { Model } = require('../monkeese/model.js');
const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');
const HandlePostReceive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { fileId } = req.body;
        const short = shortyExtractor(fileId);
        if (!ValidityCheck(short)) {
            return res.status(400).render("error", { message: "Invalid file URL or ID.", status_code: 400 });
        }
        ;
        const fileRecord = yield Model.findOne({
            $or: [{ shortCode: short }, { fileid: short }]
        });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found", status_code: 400 });
        }
        return res.render('download', { ID: short });
    }
    catch (error) {
        console.error(`${err} Error processing file request:`, error);
        return res.status(500).render("error", { message: "An unexpected error occurred.", status_code: 500 });
    }
});
const HandleGetById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if the /:fileid is typed by the user in the url bar and if the file is found in the database, it will render the download page, else it will render error page.
    try {
        let downloadLink = req.params.fileId;
        const shorty = shortyExtractor(downloadLink);
        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid', status_code: 400 });
        }
        if (!ValidityCheck(shorty)) {
            return res.status(400).render("error", { message: "Invalid file URL or ID.", status_code: 400 });
        }
        ;
        const file = yield Model.findOne({ shortCode: shorty });
        if (!file) {
            return res.render('error', { message: 'Invalid ShortURL, file not found', status_code: 400 });
        }
        res.status(200).render("download", { downloadURL: "https://drive.google.com/uc?id=${fileRecord.fileid}&export=download", ID: req.params.fileId });
    }
    catch (error) {
        console.error(error);
        res.render('error', { message: 'Server Error', status_code: 500 });
    }
});
const HandleQuickReceive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        const { password } = req.body || '';
        const fileRecord = yield Model.findOne({ shortCode: fileId });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found", status_code: 404 });
        }
        if (fileRecord.encryptHash) {
            if (!password) {
                res.status(400).render("password", { message: "Password is required to download this file.", ID: fileId });
            }
        }
    }
    catch (error) {
        console.error(`${err} Error downloading file:`, error);
        return res.status(500).render("error", { message: "An unexpected error occurred while processing your request.", status_code: 500 });
    }
});
module.exports = { HandlePostReceive, HandleGetById, HandleQuickReceive };
