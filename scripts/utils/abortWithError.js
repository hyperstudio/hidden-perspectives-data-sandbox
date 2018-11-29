module.exports = (err) => {
	if (err.message) {
		console.log(err.message);
	}
	if (err.code) {
		console.log(err.code);
	}
	if (err.stack) {
		console.log(err.stack);
	}

	console.log(err);
	process.exit(1);
};
