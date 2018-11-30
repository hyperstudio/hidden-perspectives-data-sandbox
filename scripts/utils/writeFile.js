const fs = require('fs');

function writeFile(filepath, data) {
	fs.writeFile(filepath, JSON.stringify(data), 'utf8', () => {
		const numberOfDataEntries = Object.keys(data).length;

		console.log('WROTE FILE:');
		console.log('————————————————————————————————————————————————————');
		console.log(`Data entries: ${numberOfDataEntries}`);
		console.log(`File path: ${filepath}`);
		console.log('————————————————————————————————————————————————————\n\n');
	});
}

module.exports = writeFile;
