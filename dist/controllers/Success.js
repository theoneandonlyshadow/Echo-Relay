"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Model } = require('../monkeese/model.js');
const HandleSuccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const downloadLink = req.query.link;
        const shorty = req.query.shortUrl;
        if (!downloadLink || !shorty) {
            return res.render('error', { message: 'ShortURL or download link was found invalid', status_code: 400 });
        }
        const shortCode = shorty.slice(-6);
        const file = yield Model.findOne({ shortCode });
        if (!file) {
            return res.render('error', { message: 'Invalid ShortURL, file not found', status_code: 400 });
        }
        res.render('success', { downloadLink, shorty });
    }
    catch (error) {
        console.error(error);
        res.render('error', { message: 'Server Error', status_code: 500 });
    }
});
module.exports = { HandleSuccess };
