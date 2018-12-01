const fs = require('fs');
const logger = require('./logger');

const writeFile = (filepath, data) => new Promise((resolve, reject) => {
	fs.writeFile(filepath, JSON.stringify(data), 'utf8', (err) => {
		if (err) return reject(err);

		logger.logTitle('Wrote file:');
		logger.logKeyValuePair({ key: 'Data entries', value: Object.keys(data).length });
		logger.logKeyValuePair({ key: 'File path', value: `\n${filepath}` });
		logger.logEnd();

		return resolve(data);
	});
});

module.exports = writeFile;
