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
const { hashPass, decryptHash, VerifyPassword } = require('./Encryption.js');
const { Model } = require('../monkeese/model.js');
const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');
const { Readable } = require('stream');
const HandleDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileID } = req.body;
        const { password } = req.body || '';
        const fileRecord = yield Model.findOne({ shortCode: fileID });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found", status_code: 404 });
        }
        if (fileRecord.encryptHash) {
            if (!password) {
                res.status(400).render("password", { message: "Password is required to download this file.", ID: fileID });
            }
            const hashedPassword = hashPass(password);
            const decrypt = decryptHash(fileRecord.encryptHash, fileRecord.encryptKey, fileRecord.iv, fileRecord.kiv);
            if (!VerifyPassword(decrypt, hashedPassword)) {
                return res.status(401).render("error", { message: "Invalid password.", status_code: 401 });
            }
        }
        const downloadURL = `https://drive.google.com/uc?id=${fileRecord.fileid}&export=download`;
        const response = yield fetch(downloadURL);
        if (!response.ok) {
            return res.status(response.status === 404 ? 404 : 500).render("error", { message: response.status === 404 ? "File not found" : "Error fetching file" });
        }
        let fileName = "ER_DEFAULT";
        const contentDisposition = response.headers.get("content-disposition");
        const match = contentDisposition === null || contentDisposition === void 0 ? void 0 : contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]*)/);
        if (match === null || match === void 0 ? void 0 : match[1]) {
            fileName = decodeURIComponent(match[1]).replace(/"/g, "");
        }
        res.set({
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        });
        return response.body
            ? Readable.fromWeb(response.body).pipe(res)
            : res.status(500).render("error", { message: "Unable to retrieve file stream.", status_code: 500 });
    }
    catch (error) {
        console.error(`${err} Error downloading file:`, error);
        return res.status(500).render("error", { message: "An error occured for this request.", status_code: 500 });
    }
});
module.exports = { HandleDownload };
