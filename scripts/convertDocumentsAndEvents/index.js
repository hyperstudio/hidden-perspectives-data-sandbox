require('dotenv').config();

// Util scripts
const parseDates = require('../utils/parseDates');
const writeFile = require('../utils/writeFile');
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');
const logger = require('../utils/logger');
const readFile = require('../utils/readFile');

// Data handling scripts
const collectEntitiesFromDataItem = require('./collectEntitiesFromDataItem');
const convertExcelToJSON = require('../utils/convertExcelToJSON');
const createDocumentTagsJSON = require('./createDocumentTagsJSON');
const getClusteredDocumentStakeholders = require('./getClusteredDocumentStakeholders');
const extractAndAddTranscripts = require('./extractAndAddTranscripts');
const extractAndSaveOriginals = require('./extractAndSaveOriginals');
const extractAndSaveLocations = require('./extractAndSaveLocations');

function extractAndSaveKinds(data) {
	logger.logTitle('Extracting and saving raw kinds');

	const kindsJSONPath = getPathByConstantName('RAW_KINDS');
	const kindsJSON = createDocumentTagsJSON('kind', data);

	logger.logKeyValuePair({
		key: 'Kinds',
		value: Object.keys(kindsJSON).length,
	});

	return writeFile(kindsJSONPath, kindsJSON)
		.then(() => data);
}

function extractAndSaveClassifications(data) {
	logger.logTitle('Extracting and saving raw classifications');

	const classificationJSONPath = getPathByConstantName('RAW_CLASSIFICATIONS');
	const classificationJSON = createDocumentTagsJSON('classification', data);

	logger.logKeyValuePair({
		key: 'Classifications',
		value: Object.keys(classificationJSON).length,
	});

	logger.logEnd();

	return writeFile(classificationJSONPath, classificationJSON)
		.then(() => data);
}

const extractAndSaveStakeholders = (data) => {
	logger.logTitle('Extracting and saving raw stakeholders');

	const clusteredDocumentStakeholders = getClusteredDocumentStakeholders(data);
	const clusteredDocumentStakeholdersPath = getPathByConstantName('RAW_CLUSTERED_STAKEHOLDERS');

	logger.logKeyValuePair({
		key: 'Raw Stakeholders',
		value: Object.keys(clusteredDocumentStakeholders).length,
	});

	return writeFile(clusteredDocumentStakeholdersPath, clusteredDocumentStakeholders)
		.then(() => data);
};

const saveDocumentsAndEvents = (data) => {
	const { documents, events } = data;

	logger.logTitle('Saving documents and events data');
	logger.logKeyValuePair({ key: 'Documents', value: documents.length });
	logger.logKeyValuePair({ key: 'Events', value: events.length });

	// Save documents as JSON
	const documentsDataPath = getPathByConstantName('DOCUMENTS_DATA_PATH');
	// Save events as JSON
	const eventsDataPath = getPathByConstantName('EVENTS_DATA_PATH');

	return Promise.all([
		writeFile(eventsDataPath, events),
		writeFile(documentsDataPath, documents),
	]).then(() => data);
};

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

convertExcelToJSON(['documents', 'events'])
	.then(logger.logDataStats)
	.then(parseDates)
	.then(extractAndSaveKinds)
	.then(extractAndSaveClassifications)
	.then(extractAndSaveStakeholders)
	.then(readAndAddEntites)
	// .then(extractAndSaveEntities)
	// .then(extractAndSaveOriginals) // Save files and check if already existing
	.then(extractAndAddTranscripts)
	.then(saveDocumentsAndEvents)
	.then(extractAndSaveLocations)
	.then(logger.logSuccessMessage)
	.catch(abortWithError);
