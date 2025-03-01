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
        let downloadLink = req.params.fileId;
        const shorty = shortyExtractor(downloadLink);

        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid', status_code: 400 });
        }

        if (!ValidityCheck(shorty)) {
            return res.status(400).render("error", { message: "Invalid file URL or ID.", status_code: 400 });
        };

        const file = await Model.findOne({ shortCode: shorty });
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
                res.status(400).render("password", { message: "Password is required to download this file.", ID: fileId});
            }
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).render("error", { message: "An unexpected error occurred while processing your request.", status_code: 500 });
    }
 }

module.exports = { HandlePostReceive, HandleGetById, HandleQuickReceive };