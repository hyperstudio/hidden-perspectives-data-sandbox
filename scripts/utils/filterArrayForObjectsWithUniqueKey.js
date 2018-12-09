const filterArrayForObjectsWithUniqueKey = (arrayToBeFiltered, uniqueObjectKey) => Object.values(
	arrayToBeFiltered.reduce((acc, currentObject) => ({
		...acc,
		[(currentObject[uniqueObjectKey] || '').trim().toLowerCase()]: currentObject,
	}), {}),
);

module.exports = filterArrayForObjectsWithUniqueKey;
