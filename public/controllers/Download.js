const { hashPass, decryptHash, VerifyPassword } = require('./Encryption.js');
const { Model } = require('../monkeese/model.js');

const { Readable } = require('stream');

const HandleDownload = async (req, res) => {
    try {
        const { fileID } = req.body;
        const { password } = req.body || '';
        const fileRecord = await Model.findOne({ shortCode: fileID });
        if (!fileRecord) {
            return res.status(404).render("error", { message: "File not found", status_code: 404 });
        }
        if (fileRecord.encryptHash) {
            if (!password) {
                res.status(400).render("password", { message: "Password is required to download this file.", ID: fileID});
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
                { message: response.status === 404 ? "File not found" : "Error fetching file" }
            );
        }
        let fileName = "ER_DEFAULT";
        const contentDisposition = response.headers.get("content-disposition");
        const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?([^;]*)/);
        if (match?.[1]) {
            fileName = decodeURIComponent(match[1]).replace(/"/g, "");
        }
        res.set({
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        });
        return response.body
            ? Readable.fromWeb(response.body).pipe(res)
            : res.status(500).render("error", { message: "Unable to retrieve file stream.", status_code: 500 });
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).render("error", { message: "An error occurred for this request.", status_code: 500 });
    }
}

module.exports = { HandleDownload };