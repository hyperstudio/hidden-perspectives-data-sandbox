const crypto = require('crypto');

function getRandomID() {
	const id = crypto.randomBytes(10).toString('hex');
	return id;
}

module.exports = getRandomID;
