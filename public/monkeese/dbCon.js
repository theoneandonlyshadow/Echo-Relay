const mongoose = require('mongoose');

const connect = async function(url) {
    try {
        await mongoose.connect(url);
        console.log('[SUCC] Connected to MongoDB database');
    }
    catch (error) {
        console.error('[ERROR] Failed to connect to MongoDB database:', error.message);
        process.exit(1);
    }
}

module.exports = { connect };