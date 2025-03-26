"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPass = hashPass;
exports.encryptHash = encryptHash;
exports.decryptHash = decryptHash;
exports.verifyPassword = verifyPassword;
const dotenv_1 = require("dotenv");
const crypto_1 = __importDefault(require("crypto"));
(0, dotenv_1.config)();
const MASTER_KEY = process.env.MASTERKEY;
if (!MASTER_KEY) {
    throw new Error("MASTERKEY is not defined in environment variables");
}
const masterKey = Buffer.from(MASTER_KEY.slice(0, 64), 'hex');
function hashPass(pass) {
    return crypto_1.default.createHash('sha256').update(pass).digest('hex');
}
function encryptHash(hash) {
    if (!hash) {
        return {
            encHash: '',
            encKey: '',
            iv: '',
            kIv: '',
        };
    }
    const uniqueKey = crypto_1.default.randomBytes(32);
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', uniqueKey, iv);
    let encHash = cipher.update(hash, 'utf-8', 'hex');
    encHash += cipher.final('hex');
    const kIv = crypto_1.default.randomBytes(16);
    const cipherKey = crypto_1.default.createCipheriv('aes-256-cbc', masterKey, kIv);
    let encKey = cipherKey.update(uniqueKey.toString('hex'), 'utf-8', 'hex');
    encKey += cipherKey.final('hex');
    return { encHash, encKey, iv: iv.toString('hex'), kIv: kIv.toString('hex') };
}
function decryptHash(encHash, encKey, ivHex, kIvHex) {
    if (!encHash || !encKey || !ivHex || !kIvHex) {
        return '';
    }
    const iv = Buffer.from(ivHex, 'hex');
    const kIv = Buffer.from(kIvHex, 'hex');
    const decipherKey = crypto_1.default.createDecipheriv('aes-256-cbc', masterKey, kIv);
    let uniqueKeyHex = decipherKey.update(encKey, 'hex', 'utf-8');
    uniqueKeyHex += decipherKey.final('utf-8');
    const uniqueKey = Buffer.from(uniqueKeyHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', uniqueKey, iv);
    let decHash = decipher.update(encHash, 'hex', 'utf-8');
    decHash += decipher.final('utf-8');
    return decHash;
}
function verifyPassword(ohp, ehp) {
    return ohp === ehp;
}
