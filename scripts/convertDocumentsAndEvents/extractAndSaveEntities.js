const logger = require('../utils/logger');
const readFile = require('../utils/readFile');
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');
const collectEntitiesFromDataItem = require('./collectEntitiesFromDataItem');

const extractAndSaveEntities = ({ documents, events }) => new Promise((resolve, reject) => {
	logger.logTitle('Extracting entities from Events and Documents');

	const data = [...documents, ...events];
	return collectEntitiesFromDataItem(data[0], data)
		.catch((err) => {
			if (Array.isArray(err)) resolve({ documents, events, entities: err });
			reject(err);
		});
});

const readAndAddEntites = (data) => {
	const entitiesPath = getPathByConstantName('RAW_ENTITIES');
	return readFile(entitiesPath)
		.then(JSON.parse)
		.then((entities) => ({ ...data, entities }))
		.catch(abortWithError);
};

module.exports = ({ skipRequests = false }) => (
	skipRequests ? readAndAddEntites : extractAndSaveEntities
);
