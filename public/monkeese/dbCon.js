const mongoose = require('mongoose');
const { succ, err } = require('../controllers/LoggerStyles.js');

const connect = async function(url) {
    try {
        await mongoose.connect(url);
        console.log(`${succ} MongoDB initialized`);
    }
    catch (error) {
        console.error(`${err} Failed to connect to MongoDB database:`, error.message);
        process.exit(1);
    }
}

module.exports = { connect };