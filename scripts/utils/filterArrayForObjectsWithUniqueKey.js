const filterArrayForObjectsWithUniqueKey = (arrayToBeFiltered, uniqueObjectKey) => Object.values(
	arrayToBeFiltered.reduce((acc, currentObject) => ({
		...acc,
		[currentObject[uniqueObjectKey]]: currentObject,
	}), {}),
);

module.exports = filterArrayForObjectsWithUniqueKey;
