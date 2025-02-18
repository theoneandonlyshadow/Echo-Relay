const { hashPass, encryptHash, decryptHash, VerifyPassword } = require('./Encryption.js');
const { ValidityCheck, shortyExtractor } = require('./FileValidation.js');
const { Model } = require('../monkeese/model.js');

const HandlePostReceive = async (req, res) => {
    try {
        let { fileId } = req.body;
        const short = shortyExtractor(fileId);
        if (!ValidityCheck(short)) {
            return res.status(400).render("error", { message: "Invalid file URL or ID.", status_code: 400 });
        };
        const fileRecord = await Model.findOne({
            $or: [{ shortCode: short }, { fileid: short }]
        });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found", status_code: 400 });
        }
        return res.render('download', { ID: short });
    } catch (error) {
        console.error("Error processing file request:", error);
        return res.status(500).render("error", { message: "An unexpected error occurred.", status_code: 500 });
    }
}


const HandleGetById = async (req, res) => {
    try {
        const downloadLink = req.query.link;
        const shorty = req.query.shortUrl;

        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid', status_code: 400 });
        }
        const shortCode = shorty.slice(-6);
        const file = await Model.findOne({ shortCode });
        if (!file) {
            return res.render('error', { message: 'Invalid ShortURL, file not found', status_code: 400 });
        }
        res.status(200).render("download", { downloadURL: "https://drive.google.com/uc?id=${fileRecord.fileid}&export=download", ID: req.params.fileId });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Server Error', status_code: 500 });
    }
}

const HandleQuickReceive = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { password } = req.body || '';
        const fileRecord = await Model.findOne({ shortCode: fileId });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found", status_code: 404 });
        }
        if (fileRecord.encryptHash) {
            if (!password) {
                return res.status(400).render("error", { message: "Password is required to download this file.", status_code: 400 });
            }
            const hashedPassword = hashPass(password);
            const decrypt = decryptHash(fileRecord.encryptHash, fileRecord.encryptKey, fileRecord.iv, fileRecord.kiv);
            if (!VerifyPassword(decrypt, hashedPassword)) {
                return res.status(401).render("error", { message: "Invalid password.", status_code: 401 });
            }
        }
        const downloadURL = `https://drive.google.com/uc?id=${fileRecord.fileid}&export=download`;
        const response = await fetch(downloadURL);
        if (!response.ok) {
            return res.status(response.status === 404 ? 404 : 500).render("error", 
                { message: response.status === 404 ? "File not found" : "Error fetching file", status_code: response.status === 404 ? 404 : 500 }
            );
        }
        res.redirect(downloadURL);
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).render("error", { message: "An unexpected error occurred while processing your request.", status_code: 500 });
    }
 }

module.exports = { HandlePostReceive, HandleGetById, HandleQuickReceive };