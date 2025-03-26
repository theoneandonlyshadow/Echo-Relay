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
const { info, succ, err } = require('../controllers/LoggerStyles.js');
const crypto = require('crypto');
function shorty(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let code;
        let isUnique = false;
        const base_url = `${req.protocol}://${req.get('host')}`;
        while (!isUnique) {
            code = shortCode();
            const shortUrl = `${base_url}/${code}`;
            const existing = yield Model.findOne({ shorty: shortUrl });
            if (!existing)
                isUnique = true;
        }
        const shortUrl = `${base_url}/${code}`;
        return shortUrl;
    });
}
function shortCode() {
    random = crypto.randomBytes(20).toString('hex').substring(0, 6);
    console.log(`${info} shortCode: ${random}`);
    return random;
}
module.exports = { shorty };
