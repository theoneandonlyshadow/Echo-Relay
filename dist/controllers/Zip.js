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
const fs = require('fs');
const archiver = require('archiver');
const { info, succ, err } = require('../controllers/LoggerStyles.js');
function zip(files, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            output.on('close', () => {
                console.log(`${succ} files compressed to zip: ${outputPath}`);
                resolve();
            });
            // if zipping encounters error debugging
            archive.on('error', (error) => {
                console.error(`${err} archiving error:`, error);
                reject(error);
            });
            archive.pipe(output);
            files.forEach((file) => {
                console.log(`${info} checking: ${file.path}`);
                if (fs.existsSync(file.path)) {
                    console.log(`${info} adding file to zip: ${file.originalname} from ${file.path}`);
                    archive.file(file.path, { name: file.originalname });
                }
                else {
                    console.error(`${info} file not found: ${file.path}`);
                }
            });
            archive.finalize();
        });
    });
}
module.exports = { zip };
