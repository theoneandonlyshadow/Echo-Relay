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
const mongoose = require('mongoose');
const { succ, err } = require('../controllers/LoggerStyles.js');
const connect = function (url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose.connect(url);
            console.log(`${succ} MongoDB initialized`);
        }
        catch (error) {
            console.error(`${err} Failed to connect to MongoDB database:`, error.message);
            process.exit(1);
        }
    });
};
module.exports = { connect };
