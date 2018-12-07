const omitNullValues = (obj) => Object.keys(obj).reduce((acc, key) => {
	const value = obj[key];
	if (value === null) return acc;
	return { ...acc, [key]: value };
}, {});

module.exports = omitNullValues;
