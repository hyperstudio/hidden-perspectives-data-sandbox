const fs = require('fs');

const readFile = (path, encoding = 'utf-8') => new Promise((resolve, reject) => {
	fs.readFile(path, encoding, (readErr, file) => {
		if (readErr) return reject(readErr);
		return resolve(file);
	});
});

module.exports = readFile;
