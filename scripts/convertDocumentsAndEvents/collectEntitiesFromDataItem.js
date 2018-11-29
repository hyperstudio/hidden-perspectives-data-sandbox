const fs = require('fs');
const unirest = require('unirest');

const { ERROR_TYPES } = require('../constants');
const { getPathByConstantName } = require('../utils/pathUtil');
const isDocumentData = require('../utils/isDocumentData');
const abortWithError = require('../utils/abortWithError');

function getEntitiesFromFile(fileName) { // TODO: Use `id` instead `fileName` as key name
	return new Promise((resolve, reject) => {
		const rawEntitiesPath = getPathByConstantName('RAW_ENTITIES');
		fs.readFile(rawEntitiesPath, 'utf8', (error, fileData) => {
			if (error) return reject(error);

			const entities = JSON.parse(fileData);
			const entityInFile = entities.find((entity) => entity.fileName === fileName);
			return resolve(entityInFile && entityInFile.entities);
		});
	});
}

function getEntitiesFromDandelion(stringToBeAnalyzed) {
	// Overview of API Endpoints: https://dandelion.eu/docs/
	// Checkout Dandelion (https://dandelion.eu/) for a free key
	const apiKey = process.env.DANDELION_API_KEY;
	const urlKey = 'nex'; // 'nex' for entity extraction
	const includeValues = 'types,abstract';
	const url = `
		https://api.dandelion.eu/datatxt/${urlKey}/v1/?text=${stringToBeAnalyzed}&include=${includeValues}&token=${apiKey}&lang=en
	`.trim();

	return new Promise((resolve, reject) => {
		unirest.post(url).end((response) => {
			const { error, entities } = parseEntityDandelionResponse(response);

			if (error) return reject(error);
			return resolve(entities);
		});
	});
}

function getStringToBeAnalyzed(data) {
	const isDocument = isDocumentData(data);
	const { title } = data;
	let stringToBeAnalyzed = '';

	if (isDocument) {
		const {
			summary,
			source,
			recipient,
			publisher,
		} = data;

		stringToBeAnalyzed = [
			summary,
			source,
			recipient,
			publisher,
		].join(' ').trim();
	} else {
		const { description } = data;
		stringToBeAnalyzed = [title, description].join(' ').trim();
	}

	return stringToBeAnalyzed;
}

const hasSameId = (fileName) => (element) => element.fileName === fileName;

function parseEntityDandelionResponse(response) {
	const { body, error } = response;
	const { annotations } = body;
	// const unitsLeft = headers['x-dl-units-left'];

	return {
		entities: annotations,
		error,
	};
}

const saveEntity = ({ entities, dataItem, allDataItems }) => new Promise((resolve, reject) => {
	console.log(dataItem);

	const rawEntitiesPath = getPathByConstantName('RAW_ENTITIES');
	fs.readFile(rawEntitiesPath, 'utf8', (error, fileData) => {
		if (error) return reject(error);

		const allEntities = JSON.parse(fileData);

		const entityInFile = allEntities.find((entity) => entity.fileName === dataItem.fileName);
		if (entityInFile) return resolve({ entities, dataItem, allDataItems });

		allEntities.push({
			entities,
			fileName: dataItem.fileName,
		});

		return fs.writeFile(
			rawEntitiesPath,
			JSON.stringify(allEntities),
			'utf8',
			(err) => {
				if (err) return reject(err);
				return resolve({ entities, dataItem, allDataItems });
			},
		);
	});
});

function parseDandelionError(response) {
	const { body: error } = response;
	const { message, code } = error;

	if (code === 'error.invalidParameter') {
		const utf8Error = 'invalid UTF-8';
		const hasInvalidChar = message.includes(utf8Error);

		if (hasInvalidChar) return ERROR_TYPES.INVALID_CHARACTERS_IN_DANDELION_REQUEST;
	}
	return error;
}

function onEntitiesSaveError(err) {
	abortWithError(err);
}

function onEntitiesParseError(err) {
	abortWithError(err);
}

function collectEntitiesFromDataItem(dataItem, allDataItems) {
	return new Promise((resolve, reject) => getEntitiesFromFile(dataItem.fileName)
		.then((entities) => {
			if (!entities) {
				const stringToBeAnalyzed = getStringToBeAnalyzed(dataItem);
				console.log(stringToBeAnalyzed);
				return getEntitiesFromDandelion(stringToBeAnalyzed)
					.then(() => resolve({ entities, dataItem, allDataItems }))
					.catch((err) => reject(parseDandelionError(err), dataItem, allDataItems));
			}
			return resolve({ entities, dataItem, allDataItems });
		}));
}

function collectEntitiesForNextDataItem(dataItem, allDataItems) {
	const indexOfDataItem = allDataItems.findIndex(hasSameId(dataItem.fileName));
	const indexOfNextDataItem = indexOfDataItem + 1;
	const nextDataItem = allDataItems[indexOfNextDataItem];
	if (indexOfDataItem > allDataItems.length - 1) {
		return Promise.reject(ERROR_TYPES.NO_ENTITY_LEFT_TO_QUERY);
	}
	return getAndSaveEntitiesForDataItem(nextDataItem, allDataItems);
}

const getOnEntitiesCollectionErrorHandler = ({
	reject, resolve,
}) => function onEntitiesCollectionError(err) {
	if (err === ERROR_TYPES.NO_ENTITY_LEFT_TO_QUERY) {
		return resolve();
	}
	return reject(err);
};

const parseEntity = ({ entities, dataItem, allDataItems }) => new Promise((resolve) => {
	resolve({ entities, dataItem, allDataItems });
});

function getAndSaveEntitiesForDataItem(dataItem, allDataItems) {
	return new Promise((resolve, reject) => collectEntitiesFromDataItem(dataItem, allDataItems)
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

module.exports = getAndSaveEntitiesForDataItem;
