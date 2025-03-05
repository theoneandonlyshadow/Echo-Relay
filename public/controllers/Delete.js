const { drive } = require('./DefaultController.js');
const { Model } = require('../monkeese/model.js');
const fs = require('fs');
const path = require('path');
const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');

const HandleDelete = async (req, res) => {
    const { fileId } = req.params;
    try {
        await driveDelete(fileId);
        const fileRecord = await Model.findOneAndDelete({ fileid: fileId });
        if (!fileRecord) {
            res.render('error', { message: 'File not found', status_code: 400 });
        }
        res.render('deleted');
    } catch (error) {
        console.error(`${err} Error deleting file:`, error);
        res.render('error', { message: 'Error deleting file', status_code: 500 });
    }
}

async function driveDelete(fileId) {
    console.log(`${info} File ID: ${fileId}`);
    try {
        const resp = await drive.files.delete({
            fileId: fileId,
        });
        console.log(`${info} File deleted: ${fileId}`);
        return resp;
    }
    catch (error) {
        console.error(`${info} Error deleting file:`, error);
        throw error;
    }
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

async function monitorDeletion() {
    const changeStream = Model.watch([{ $match: { operationType: 'delete' } }]);

    changeStream.on('change', async (change) => {
        try {
            const deletedId = change.documentKey._id;
            const deletedDoc = change.fullDocument;

            if (deletedDoc && deletedDoc.fileid) {
                await driveDelete(deletedDoc.fileid);
                console.log(`[INFO] File with ID ${deletedDoc.fileid} deleted from Google Drive.`);
            } else {
                console.log(`[INFO] Deleted document with ID ${deletedId} has no associated fileid.`);
            }
        } catch (error) {
            console.error(`${err} Error processing deletion:`, error);
        }
    });

    changeStream.on('error', (error) => {
        console.error(`${err} Change stream error:`, error);
    });
}

module.exports = { HandleDelete, driveDelete, restDelete, monitorDeletion };