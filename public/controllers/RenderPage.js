const renderDelete = (req, res) => {
    return res.render('deleted');
};

const renderReceive = (req, res) => {
    return res.render('receive');
};

const renderError = (req, res) => {
    const errorMessage = req.query.message || 'An unexpected error occurred';
    return res.render('error', { message: errorMessage });
};

const renderHome = (req, res) => {
    return res.render('home');
};

const renderNotFound = (req, res, next) => {
    return res.render('404');
};

module.exports = { renderDelete, renderReceive, renderError, renderHome, renderNotFound }; 