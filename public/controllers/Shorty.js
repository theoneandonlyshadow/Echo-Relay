const { Model } = require('../monkeese/model.js');

const crypto = require('crypto');

async function shorty(req) {
    let code;
    let isUnique = false;
    const base_url = `${req.protocol}://${req.get('host')}`;
    while (!isUnique) {
        code = shortCode();
        const shortUrl = `${base_url}/${code}`;
        const existing = await Model.findOne({ shorty: shortUrl });
        if (!existing) isUnique = true;
    }
    const shortUrl = `${base_url}/${code}`;
    return shortUrl;
}

function shortCode() {
    random = crypto.randomBytes(20).toString('hex').substring(0,6);
    console.log(`shortCode: ${random}`);
    return random;
}

module.exports = { shorty };