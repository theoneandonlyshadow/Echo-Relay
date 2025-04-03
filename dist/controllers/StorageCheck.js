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
const { drive } = require('./DefaultController');
const { formatFileSize } = require('../js/upload.js');
const checkStorage = () => __awaiter(void 0, void 0, void 0, function* () {
    //right now it doesn't accept any parameters, but it must accept a drive as parameter when there are multiple drives
    const response = yield drive.about.get({ fields: "storageQuota" });
    const availStorage = response.data.storageQuota.limit - response.data.storageQuota.usage;
    console.log(`Available storage: ${formatFileSize(availStorage)}`);
});
const bestStorage = (accStorage, currStorage) => {
    //forEach or map or reduce??
};
module.exports = { checkStorage, bestStorage };
