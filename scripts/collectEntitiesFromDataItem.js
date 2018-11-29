function getEntitiesFromFile() {}
function getEntitiesFromDandelion() {}
function createDataItemStringConfig() {}
function hasSameId() {}
function parseEntity() {}
function saveEntity() {}
function parseDandelionError() {}
function onEntitiesSaveError() {}
function onEntitiesParseError() {}

function collectEntitiesFromDataItem(dataItem, allDataItems) {
	return new Promise((reject, resolve) => {
		const entities = getEntitiesFromFile(dataItem.id);

		if (!entities) {
			return getEntitiesFromDandelion(dataItem)
				.then((result) => resolve(result, dataItem, allDataItems))
				.catch((err) => reject(parseDandelionError(err), dataItem, allDataItems));
		}
		resolve(entities, dataItem, allDataItems);
		return undefined;
	});
}

function collectEntitiesForNextDataItem(dataItem, allDataItems) {
	const indexOfDataItem = allDataItems.findIndex(hasSameId(dataItem.id));
	const indexOfNextDataItem = indexOfDataItem + 1;
	const nextDataItem = allDataItems[indexOfNextDataItem];
	if (indexOfDataItem > allDataItems.length - 1) {
		return Promise.reject('All dataItems finished');
	}
	return getAndSaveEntitiesForDataItem(nextDataItem, allDataItems);
}

const getOnEntitiesCollectionErrorHandler = ({
	reject, resolve,
}) => function onEntitiesCollectionError(err) {
	if (err === 'All dataItems finished') {
		return resolve();
	}
	if (err === 'No units left') {
		return reject();
	}
	return reject(err);
};

export default function getAndSaveEntitiesForDataItem(dataItem, allDataItems) {
	return new Promise((reject, resolve) => collectEntitiesFromDataItem(dataItem, allDataItems)
		.then(saveEntity)
		.catch(onEntitiesSaveError)
		.then(parseEntity)
		.catch(onEntitiesParseError)
		.then(collectEntitiesForNextDataItem)
		.catch(getOnEntitiesCollectionErrorHandler({
			reject,
			resolve: () => resolve(allDataItems),
		})));
}
