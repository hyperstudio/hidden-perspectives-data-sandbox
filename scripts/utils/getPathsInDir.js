const fs = require('fs');

const getPathsInDir = (path) => new Promise((resolve, reject) => {
	fs.readdir(path, (err, paths) => {
		if (err) return reject(err);
		return resolve(paths);
	});
});

module.exports = getPathsInDir;
