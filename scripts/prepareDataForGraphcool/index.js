require('dotenv').config();
const fs = require('fs');
const cliProgress = require('cli-progress');

// Util scripts
const logger = require('../utils/logger');
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');
const graphcoolDataImport = require('../utils/graphcoolDataImport');

// Scripts
const createGraphcoolClassifications = require('./createGraphcoolClassifications');
const createGraphcoolDocuments = require('./createGraphcoolDocuments');
const createGraphcoolStakeholders = require('./createGraphcoolStakeholders');
const createGraphcoolKinds = require('./createGraphcoolKinds');
const createGraphcoolEvents = require('./createGraphcoolEvents');
const createGraphcoolBriefingBooks = require('./createGraphcoolBriefingBooks');
const createGraphcoolLocations = require('./createGraphcoolLocations');


function getNumberOfDataItems(data) {
	const isArray = Array.isArray(data);
	const dataLength = isArray ? data.length : Object.keys(data).length;

	return dataLength;
}

// TODO: Which entities are relevant?
function getRelevantEntityType(entityTypes) {
	let entityType;
	const relevantEntityTypes = ['person', 'location', 'organisation', 'event'];

	entityTypes.forEach((type) => {
		const regexPattern = '[^/]+$';
		const regex = new RegExp(regexPattern);
		const matchedReg = type.match(regex);
		const extractedType = matchedReg[0].toLowerCase();

		const isRelevantEntityType = relevantEntityTypes.includes(extractedType);

		if (isRelevantEntityType) {
			entityType = extractedType;
		}
	});

	return entityType || '';
}

function getRelevantDataFromFiles(dataPaths) {
	return new Promise((resolve) => {
		const dataPathsKeys = Object.keys(dataPaths);
		const data = {};

		logger.logTitle('Read data from files:');
		dataPathsKeys.forEach((dataPathKey) => {
			const dataPath = dataPaths[dataPathKey];
			try {
				const rawDataFromFile = fs.readFileSync(dataPath, 'utf8');
				const dataFromFile = JSON.parse(rawDataFromFile);

				logger.logKeyValuePair({ key: `${dataPathKey}`, value: '✓' });

				data[dataPathKey] = dataFromFile;
			} catch (error) {
				if (error.code === 'ENOENT') {
					console.log(`FILE NOT FOUND: ${dataPath}`);
				} else {
					throw error;
				}
			}
		});
		logger.logEnd();

		resolve(data);
	});
}

function clusterEntities(data) {
	const { rawEntities } = data;
	const clusteredEntities = {};
	const addEntity = (entity, fileName, originalString) => {
		const { title } = entity;
		const hasEntity = Object.prototype.hasOwnProperty.call(clusteredEntities, title);
		if (!hasEntity) {
			clusteredEntities[title] = {
				fileNames: [{ fileName, originalString }],
				...entity,
			};
		} else {
			const { fileNames } = clusteredEntities[title];
			fileNames.push({ fileName, originalString });
		}
	};

	rawEntities.forEach((datum) => {
		const { entities, fileName, originalString } = datum;

		if (entities && entities instanceof Array) {
			entities.forEach((entity) => {
				addEntity(entity, fileName, originalString);
			});
		} else {
			addEntity(entities, fileName, originalString);
		}
	});

	return { ...data, entities: Object.values(clusteredEntities) };
}

function splitEntityTypes(data) {
	const { rawEntities } = data;

	Object.keys(rawEntities).forEach((entityKey) => {
		const entity = rawEntities[entityKey];

		const { types } = entity;
		if (types && types.length > 0) {
			const relevantEntityType = getRelevantEntityType(types);
			entity.relevantType = relevantEntityType;

			// console.log(rawEntities[entityKey].fileNames.length);
			// console.log(entityKey);
			// console.log(types);
		}
	});

	return data;
}

function createTagsFromEntities() {

}

// function createGraphcoolStackeholders() {
// 	const stakeholderFields = {
// 		id: 'generated id with chronos',
// 		briefingBooksMentionedIn: [], // BB relations
// 		createdAt: new Date(),
// 		documents: [], // Documents authored
// 		documentsMentionedIn: [], // Document relations
// 		eventsInvolvedIn: [], // Event relations
// 		isStakeholderInstitution: false,
// 		stakeholderFullName: 'Hans Müller',
// 		locationWikipediaUri: 'http://',
// 	};
// }

function createGraphcoolFile() {

}

function createGraphcoolRelations() {
	// createStakeholdersRelations();
	// createTagsRelations();
	// createKindsRelations();
	// createClassificationsRelations();
	// createLocationsRelations();
}


const relevantDataPaths = {
	documents: getPathByConstantName('DOCUMENTS_DATA_PATH'),
	events: getPathByConstantName('EVENTS_DATA_PATH'),
	kinds: getPathByConstantName('RAW_KINDS'),
	classifications: getPathByConstantName('RAW_CLASSIFICATIONS'),
	rawEntities: getPathByConstantName('RAW_ENTITIES'),
	locations: getPathByConstantName('LOCATIONS_DATA_PATH'),
};

getRelevantDataFromFiles(relevantDataPaths)
	.then(clusterEntities)
	.then(splitEntityTypes)
	// Create Graphcool NODES
	.then(createGraphcoolClassifications)
	.then(createGraphcoolKinds)
	// Create main NODES
	.then(createGraphcoolEvents)
	.then(createGraphcoolDocuments)
	// Create entity-related NODES
	.then(createGraphcoolBriefingBooks)
	.then(createGraphcoolLocations)
	// .then(createGraphcoolTagsFromEntities)
	// .then(createGraphcoolStakeholders)
	// Create entity-related RELATIONS
	// .then(createEntityRelatedRealtions)
	// Import data into Graphcool
	// .then(graphcoolDataImport)
	// The End
	.then(logger.logSuccessMessage)
	.catch(abortWithError);
