const fs = require('fs');

const writeFile = (filepath, data) => new Promise((resolve, reject) => fs
	.writeFile(filepath, JSON.stringify(data), 'utf8', (err) => (err ?
		reject(err) : resolve(data)
	)));

module.exports = writeFile;
