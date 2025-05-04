const { drive } = require('./DefaultController');
const { formatFileSize } = require('../js/upload.js')
const checkStorage = async (drive) => {

    const response = await drive.about.get({ fields: "storageQuota" });
    const availStorage = response.data.storageQuota.limit - response.data.storageQuota.usage;
    console.log(`Available storage: ${formatFileSize(availStorage)}`);
    return availStorage;
};

/**This function creates an array of available drives with storages and returns the best drive
Need to use this every time you want to upload a file or we could run this every 10 mins or so.
Create an array of drives and pass it into this function. */

const findBestStorage = async (drives) => {
    let bestDrive = null;
    const storageArray = await Promise.all(
        drives.map(async (drive) => {
            const available = await checkStorage(drive);
            return { drive, available };
        })
    );
    const best = storageArray.reduce((prev, curr) =>
        curr.available > prev.available ? curr : prev
    );
    console.log(`Best drive is: ${best.drive.name} with ${formatFileSize(best.available)} available.\n`);
    return best.drive;
};

module.exports = { checkStorage, findBestStorage };
