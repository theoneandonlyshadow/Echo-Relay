const { Model } = require('../monkeese/model.js');

const HandleSuccess = async (req, res) => {
    try {
        const downloadLink = req.query.link;
        const shorty = req.query.shortUrl;

        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid', status_code: 400 });
        }

        const shortCode = shorty.slice(-6);
        const file = await Model.findOne({ shortCode });

        if (!file) {
            return res.render('error', { message: 'Invalid ShortURL, file not found', status_code: 400 });
        }

        res.render('success', { downloadLink, shorty, wss: file.wss });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Server Error', status_code: 500 });
    }
}

module.exports = { HandleSuccess };