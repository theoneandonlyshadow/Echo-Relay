const express = require('express');
const { HandleDelete } = require('../controllers/Delete.js');

const router = express.Router();

router.delete('/:fileId', HandleDelete);

module.exports = router;
