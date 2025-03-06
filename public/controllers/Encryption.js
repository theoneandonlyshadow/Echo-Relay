require('dotenv').config();
const crypto = require('crypto');

function hashPass(pass) {
    return crypto.createHash('sha256').update(pass).digest('hex');
}

function encryptHash(hash) {
    if (!hash) {
        return {
            encHash: '',
            encKey: '',
            iv: '',
            kIv: '',
        }
    }
    const masterKey = Buffer.from(process.env.AES_256_KEY, 'hex');
    const uniqueKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', uniqueKey, iv);
    let encHash = cipher.update(hash, 'utf-8', 'hex');
    encHash += cipher.final('hex');

    const kIv = crypto.randomBytes(16);
    const cipherKey = crypto.createCipheriv('aes-256-cbc', masterKey, kIv);
    let encKey = cipherKey.update(uniqueKey.toString('hex'), 'utf-8', 'hex');
    encKey += cipherKey.final('hex');

    return { encHash, encKey, iv: iv.toString('hex'), kIv: kIv.toString('hex') };
}

function decryptHash(encHash, encKey, ivHex, kIvHex) {
    if (!encHash ||!encKey ||!ivHex ||!kIvHex) {
        return '';
    }
    const masterKey = Buffer.from(process.env.AES_256_KEY, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const kIv = Buffer.from(kIvHex, 'hex');

    const decipherKey = crypto.createDecipheriv('aes-256-cbc', masterKey, kIv);
    let uniqueKeyHex = decipherKey.update(encKey, 'hex', 'utf-8');
    uniqueKeyHex += decipherKey.final('utf-8');
    const uniqueKey = Buffer.from(uniqueKeyHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', uniqueKey, iv);
    let decHash = decipher.update(encHash, 'hex', 'utf-8');
    decHash += decipher.final('utf-8');

    return decHash;
}

function VerifyPassword(ohp, ehp) {
    const result = ohp === ehp ? true : false;
    return result;
}

module.exports = { hashPass, encryptHash, decryptHash, VerifyPassword };