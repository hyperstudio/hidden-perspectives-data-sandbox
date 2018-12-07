const filterArrayForObjectsWithUniqueKey = (arrayToBeFiltered, uniqueObjectKey) => arrayToBeFiltered
	.filter((array, index, self) => index === self.findIndex((arr) => (
		arr.label === array[uniqueObjectKey]
	)));

module.exports = filterArrayForObjectsWithUniqueKey;
