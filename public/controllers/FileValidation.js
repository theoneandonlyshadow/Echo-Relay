function ValidityCheck(fileId) {
if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return false;
}
return true;
}

function shortyExtractor(fileId) {
    if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
        fileId = fileId.split('/').pop();
        console.log('Shortened URL:', fileId);
    }
    return fileId;
}

module.exports = { ValidityCheck, shortyExtractor };