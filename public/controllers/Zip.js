const fs = require('fs');
const archiver = require('archiver');
const { info, succ, err } = require('../controllers/LoggerStyles.js');

async function zip(files, outputPath) {
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
            } else {
                console.error(`${info} file not found: ${file.path}`);
            }
        });

        archive.finalize();
    });
}

module.exports = { zip };