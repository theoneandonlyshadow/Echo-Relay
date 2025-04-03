require('dotenv').config();
const crypto = require('crypto');

const masterKey = process.env.MASTERKEY ? 
  Buffer.from(process.env.MASTERKEY.slice(0, 64), 'hex') : 
  crypto.randomBytes(32); // fallback

function hashPass(pass) {
    if (!pass) return '';
    return crypto.createHash('sha256').update(pass).digest('hex');
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
    
    try {
        const uniqueKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv('aes-256-cbc', uniqueKey, iv);
        let encHash = cipher.update(hash, 'utf8', 'hex');
        encHash += cipher.final('hex');
        
        const kIv = crypto.randomBytes(16);
        const cipherKey = crypto.createCipheriv('aes-256-cbc', masterKey, kIv);
        let encKey = cipherKey.update(uniqueKey, 'hex');
        encKey += cipherKey.final('hex');
        
        return { 
            encHash, 
            encKey, 
            iv: iv.toString('hex'), 
            kIv: kIv.toString('hex') 
        };
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt hash');
    }
}

function decryptHash(encHash, encKey, ivHex, kIvHex) {
    if (!encHash || !encKey || !ivHex || !kIvHex) {
        return '';
    }
    
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const kIv = Buffer.from(kIvHex, 'hex');
        
        const decipherKey = crypto.createDecipheriv('aes-256-cbc', masterKey, kIv);
        let uniqueKeyHex = decipherKey.update(encKey, 'hex', 'hex');
        uniqueKeyHex += decipherKey.final('hex');
        
        const uniqueKey = Buffer.from(uniqueKeyHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', uniqueKey, iv);
        let decHash = decipher.update(encHash, 'hex', 'utf8');
        decHash += decipher.final('utf8');
        
        return decHash;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt hash');
    }
}

function verifyPassword(originalHash, encryptedHash) {
    if (!originalHash || !encryptedHash) return false;
    return originalHash === encryptedHash;
}

module.exports = { hashPass, encryptHash, decryptHash, verifyPassword };