const { Model } = require('../monkeese/model.js');

const HandleSuccess = async (req, res) => {
    try {
        const downloadLink = req.query.link;
        const shorty = req.query.shortUrl;

        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid' });
        }
        const shortCode = shorty.slice(-6);
        const file = await Model.findOne({ shortCode });
        if (!file) {
            return res.render('error', { message: 'Invalid ShortURL, file not found' });
        }
        res.render('success', { downloadLink, shorty });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Server Error' });
    }
}

module.exports = { HandleSuccess };