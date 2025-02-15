function ValidityCheck(fileId) {
    if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
        fileId = fileId.split('/').pop(); 
    }
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
        return false;
    }
    return true;
}

module.exports = { ValidityCheck };