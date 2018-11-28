const fs = require('fs');

function writeFile(filepath, data) {
    fs.writeFile(filepath, JSON.stringify(data), 'utf8', () => {
        console.log(`Wrote file: ${filepath}`);
    });
}

module.exports = writeFile;
