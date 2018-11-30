const fs = require('fs');

const readFile = (path) => new Promise((resolve, reject) => {
	fs.readFile(path, 'utf-8', (readErr, file) => {
		if (readErr) return reject(readErr);
		return resolve(file);
	});
});

module.exports = readFile;
