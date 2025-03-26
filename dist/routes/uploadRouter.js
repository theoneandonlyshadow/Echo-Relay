"use strict";
const express = require('express');
const multer = require('multer');
const { HandleUpload } = require('../controllers/Upload.js');
const router = express.Router();
const sizeLimit = 7 * 1024 * 1024 * 1024;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: sizeLimit }
});
router.post('/', upload.array('files'), HandleUpload);
module.exports = router;
