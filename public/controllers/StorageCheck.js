const { drive } = require('./DefaultController');
const { formatFileSize } = require('../js/upload.js')
const checkStorage = async () => { 
    //right now it doesn't accept any parameters, but it must accept a drive as parameter when there are multiple drives
    const response = await drive.about.get({fields: "storageQuota"});
    const availStorage = response.data.storageQuota.limit - response.data.storageQuota.usage;
    console.log(`Available storage: ${formatFileSize(availStorage)}`);
};

const bestStorage = (accStorage, currStorage) => {
    //forEach or map or reduce??
};

module.exports = { checkStorage, bestStorage };
