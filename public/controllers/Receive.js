const { hashPass, encryptHash, decryptHash, VerifyPassword } = require('./Encryption.js');
const { ValidityCheck, shortyExtractor } = require('./FileValidation.js');
const { Model } = require('../monkeese/model.js');

const HandlePostReceive = async (req, res) => {
    try {
        let { fileId } = req.body;
        const short = shortyExtractor(fileId);
        if (!ValidityCheck(short)) {
            return res.status(400).render("error", { message: "Invalid file URL or ID." });
        };
        const fileRecord = await Model.findOne({
            $or: [{ shortCode: short }, { fileid: short }]
        });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found" });
        }
        return res.render('download', { ID: short });
    } catch (error) {
        console.error("Error processing file request:", error);
        return res.status(500).render("error", { message: "An unexpected error occurred." });
    }
}

const HandleGetById = async (req, res) => {
    try {
        const { fileId } = req.params;
        console.log(fileId);
        const { password } = req.body || '';
        const fileRecord = await Model.findOne({ shortCode: fileId });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found" });
        }
        if (fileRecord.encryptHash) {
            if (!password) {
                return res.status(400).render("error", { message: "Password is required to download this file." });
            }
            const hashedPassword = hashPass(password);
            const decrypt = decryptHash(fileRecord.encryptHash, fileRecord.encryptKey, fileRecord.iv, fileRecord.kiv);
            if (!VerifyPassword(decrypt, hashedPassword)) {
                return res.status(401).render("error", { message: "Invalid password." });
            }
        }
        const downloadURL = `https://drive.google.com/uc?id=${fileRecord.fileid}&export=download`;
        const response = await fetch(downloadURL);
        if (!response.ok) {
            return res.status(response.status === 404 ? 404 : 500).render("error", 
                { message: response.status === 404 ? "File not found" : "Error fetching file" }
            );
        }
        res.redirect(downloadURL);
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).render("error", { message: "An unexpected error occurred while processing your request." });
    }
}

const HandleQuickReceive = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { password } = req.body || '';
        const fileRecord = await Model.findOne({ shortCode: fileId });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found" });
        }
        if (fileRecord.encryptHash) {
            if (!password) {
                return res.status(400).render("error", { message: "Password is required to download this file." });
            }
            const hashedPassword = hashPass(password);
            const decrypt = decryptHash(fileRecord.encryptHash, fileRecord.encryptKey, fileRecord.iv, fileRecord.kiv);
            if (!VerifyPassword(decrypt, hashedPassword)) {
                return res.status(401).render("error", { message: "Invalid password." });
            }
        }
        const downloadURL = `https://drive.google.com/uc?id=${fileRecord.fileid}&export=download`;
        const response = await fetch(downloadURL);
        if (!response.ok) {
            return res.status(response.status === 404 ? 404 : 500).render("error", 
                { message: response.status === 404 ? "File not found" : "Error fetching file" }
            );
        }
        res.redirect(downloadURL);
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).render("error", { message: "An unexpected error occurred while processing your request." });
    }
 }

module.exports = { HandlePostReceive, HandleGetById, HandleQuickReceive };