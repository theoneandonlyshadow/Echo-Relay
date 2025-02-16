const express = require('express');
const { renderDelete, renderReceive, renderError, renderHome, renderNotFound } = require('../controllers/RenderPage.js');
const { HandleSuccess } = require('../controllers/Success.js');

const router = express.Router();

router.get('/success', HandleSuccess);
router.get('/deleted', renderDelete);
router.get('/receive', renderReceive);
router.get('/error', renderError);
router.get('/', renderHome);

module.exports = router;
