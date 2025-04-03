const mongoose = require('mongoose');
const timePeriod = 7 * 24 * 60 * 60; 
const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    fileid: {
        type: String,
        required: true
    },
    encryptHash: {
        type: String
    },
    encryptKey: {
        type: String
    },
    iv : {
        type: String
    },
    kiv: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    shorty: {
        type: String,
        required: true
    },
    shortCode: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        expires: timePeriod
    }
});

const Model = mongoose.model('Relay', schema);

module.exports = { Model };
