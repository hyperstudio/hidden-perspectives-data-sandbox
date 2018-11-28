const fs = require('fs');

function appendToFile(filepath, data, callback) {
    fs.readFile(filepath, 'utf8', (error, fileData) => {
        if (error) {
            console.log(error);
        } else {
            const object = JSON.parse(fileData);
            object.push(data);
            const json = JSON.stringify(object);

            fs.writeFile(filepath, json, 'utf8', () => {
                callback();
                console.log(`Appended to file: ${filepath}`);
            });
        }
    });
}

module.exports = appendToFile;
