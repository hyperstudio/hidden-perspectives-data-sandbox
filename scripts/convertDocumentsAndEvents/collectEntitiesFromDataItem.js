const unirest = require('unirest');
const cliProgress = require('cli-progress');

const { ERROR_TYPES } = require('../constants');
const { getPathByConstantName } = require('../utils/pathUtil');
const isDocumentData = require('../utils/isDocumentData');
const abortWithError = require('../utils/abortWithError');
const logger = require('../utils/logger');
const readFile = require('../utils/readFile');
const writeFile = require('../utils/writeFile');

function getEntitiesFromFile(fileName) {
	return new Promise((resolve, reject) => {
		const rawEntitiesPath = getPathByConstantName('RAW_ENTITIES');
		return readFile(rawEntitiesPath)
			.then((fileData) => {
				const entities = JSON.parse(fileData);

				const entityInFile = entities.find((entity) => entity.fileName === fileName);
				return resolve(entityInFile && entityInFile.entities);
			})
			.catch(reject);
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

	if (body.error) {
		const { message, code } = body;
		return {
			entities: [],
			error: {
				message,
				stack: error.stack,
				code,
			},
		};
	}

	return {
		entities: annotations,
	};
}

const saveEntity = ({ entities, dataItem, allDataItems }) => new Promise((resolve, reject) => {
	const rawEntitiesPath = getPathByConstantName('RAW_ENTITIES');
	readFile(rawEntitiesPath)
		.then((fileData) => {
			const allEntities = JSON.parse(fileData);

			const entityInFile = allEntities
				.find((entity) => entity.fileName === dataItem.fileName);

			if (entityInFile) return resolve({ entities, dataItem, allDataItems });

			allEntities.push({
				entities,
				fileName: dataItem.fileName,
			});

			return allEntities;
		})
		.then((allEntities) => writeFile(rawEntitiesPath, allEntities))
		.then(() => resolve({ entities, dataItem, allDataItems }))
		.catch(reject);
});

function parseDandelionError(error) {
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

function collectEntitiesFromDataItem(dataItem, allDataItems) {
	return new Promise((resolve, reject) => getEntitiesFromFile(dataItem.fileName)
		.then((entities) => {
			if (!entities) {
				const stringToBeAnalyzed = getStringToBeAnalyzed(dataItem);
				return getEntitiesFromDandelion(stringToBeAnalyzed)
					.then((requestedEntities) => saveEntity({
						entities: requestedEntities,
						dataItem,
						allDataItems,
					}))
					.catch(onEntitiesSaveError)
					.then((resolvedEntities) => resolve({
						entities: resolvedEntities, dataItem, allDataItems,
					}))
					.catch((err) => reject(parseDandelionError(err), dataItem, allDataItems));
			}

			return resolve({ entities, dataItem, allDataItems });
		}));
}

function collectEntitiesForNextDataItem({ dataItem, allDataItems }) {
	const indexOfDataItem = allDataItems.findIndex(hasSameId(dataItem.fileName));
	const indexOfNextDataItem = indexOfDataItem + 1;
	const nextDataItem = allDataItems[indexOfNextDataItem];
	if (indexOfDataItem === allDataItems.length - 1) {
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

let progressBarProgess = 0;
const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
function getAndSaveEntitiesForDataItem(dataItem, allDataItems) {
	if (progressBarProgess === 0) {
		progressBar.start(allDataItems.length, 0);
	}
	return new Promise((resolve, reject) => collectEntitiesFromDataItem(dataItem, allDataItems)
		.then((data) => {
			progressBarProgess += 1;
			progressBar.update(progressBarProgess);
			return data;
		})
		.then(collectEntitiesForNextDataItem)
		.catch(getOnEntitiesCollectionErrorHandler({
			reject,
			resolve: () => {
				progressBar.stop();
				logger.logEnd();
				return reject(allDataItems);
			},
		})));
}

module.exports = getAndSaveEntitiesForDataItem;
