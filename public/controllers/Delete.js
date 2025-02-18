const { drive } = require('./DefaultController.js');
const { Model } = require('../monkeese/model.js');
const fs = require('fs');
const path = require('path');

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
        console.error('Error deleting file:', error);
        res.render('error', { message: 'Error deleting file', status_code: 500 });
    }
}

async function driveDelete(fileId) {
    console.log(`File ID: ${fileId}`);
    try {
        const resp = await drive.files.delete({
            fileId: fileId,
        });
        console.log(`File deleted: ${fileId}`);
        return resp;
    }
    catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

function restDelete(hashDir) {
    try {
        const files = fs.readdirSync(hashDir);
        files.forEach(file => fs.unlinkSync(path.join(hashDir, file)));
        console.log('Temporary files deleted');
    }
    catch (error) {
        console.error('Error deleting temporary files:', error);
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
                console.log(`File with ID ${deletedDoc.fileid} deleted from Google Drive.`);
            } else {
                console.log(`Deleted document with ID ${deletedId} has no associated fileid.`);
            }
        } catch (error) {
            console.error('Error processing deletion:', error);
        }
    });

    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
    });
}

module.exports = { HandleDelete, driveDelete, restDelete, monitorDeletion };