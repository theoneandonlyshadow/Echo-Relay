const fs = require('fs');
const archiver = require('archiver');

async function zip(files, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`files compressed to zip: ${outputPath}`);
            resolve();
        });

        // if zipping encounters error debugging
        archive.on('error', (err) => {
            console.error('archiving error:', err);
            reject(err);
        });

        archive.pipe(output);

        files.forEach((file) => {
            console.log(`checking: ${file.path}`);

            if (fs.existsSync(file.path)) {
                console.log(`adding file to zip: ${file.originalname} from ${file.path}`);
                archive.file(file.path, { name: file.originalname });
            } else {
                console.error(`file not found: ${file.path}`);
            }
        });

        archive.finalize();
    });
}

module.exports = { zip };