"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chalkStyles = void 0;
const chalk_1 = __importDefault(require("chalk"));
const chalkStyles = {
    info: chalk_1.default.blue.bold,
    err: chalk_1.default.red.bold,
    warn: chalk_1.default.yellow.bold,
    succ: chalk_1.default.green.bold,
};
exports.chalkStyles = chalkStyles;
