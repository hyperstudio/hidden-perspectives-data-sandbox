require('dotenv').config();

// Util scripts
const parseDates = require('../utils/parseDates');
const writeFile = require('../utils/writeFile');
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');

// Data handling scripts
const collectEntitiesFromDataItem = require('./collectEntitiesFromDataItem');
const convertExcelToJSON = require('../utils/convertExcelToJSON');
const createDocumentTagsJSON = require('./createDocumentTagsJSON');
const getClusteredDocumentStakeholders = require('./getClusteredDocumentStakeholders');
const extractAndAddTranscripts = require('./extractAndAddTranscripts');

const startDate = new Date();

const logDataStats = (data) => {
	const { documents, events } = data;
	console.log('PROCESSING DATA:');
	console.log('————————————————————————————————————————————————————');
	console.log(`Documents: ${documents.length}`);
	console.log(`Events: ${events.length}`);
	console.log('————————————————————————————————————————————————————\n\n');

	return data;
};

function extractAndSaveKinds(data) {
	console.log('EXTRACTING AND SAVING RAW KINDS:');
	console.log('————————————————————————————————————————————————————');
	const kindsJSONPath = getPathByConstantName('RAW_KINDS');
	const kindsJSON = createDocumentTagsJSON('kind', data);

	console.log(`Kinds: ${Object.keys(kindsJSON).length}`);
	writeFile(kindsJSONPath, kindsJSON);
	console.log('————————————————————————————————————————————————————\n\n');

	return data;
}

function extractAndSaveClassifications(data) {
	console.log('EXTRACTING AND SAVING RAW CLASSIFICATIONS:');
	console.log('————————————————————————————————————————————————————');
	const classificationJSONPath = getPathByConstantName('RAW_CLASSIFICATIONS');
	const classificationJSON = createDocumentTagsJSON('classification', data);

	console.log(`Classifications: ${Object.keys(classificationJSON).length}`);
	writeFile(classificationJSONPath, classificationJSON);
	console.log('————————————————————————————————————————————————————\n\n');

	return data;
}

const extractAndSaveStakeholders = (data) => {
	console.log('EXTRACTING AND SAVING RAW STAKEHOLDERS:');
	console.log('————————————————————————————————————————————————————');
	const clusteredDocumentStakeholders = getClusteredDocumentStakeholders(data);
	const clusteredDocumentStakeholdersPath = getPathByConstantName('RAW_CLUSTERED_STAKEHOLDERS');
	console.log(`Raw Stakeholders: ${Object.keys(clusteredDocumentStakeholders).length}`);
	writeFile(clusteredDocumentStakeholdersPath, clusteredDocumentStakeholders);
	console.log('————————————————————————————————————————————————————\n\n');

	return data;
};

const saveDocumentsAndEvents = (data) => {
	const { documents, events } = data;
	console.log('SAVING DOCUMENTS AND EVENTS DATA:');
	console.log('————————————————————————————————————————————————————');
	console.log(`Documents: ${documents.length}`);
	console.log(`Events: ${events.length}`);

	// Save documents as JSON
	const documentsDataPath = getPathByConstantName('DOCUMENTS_DATA_PATH');
	writeFile(documentsDataPath, documents);
	// Save events as JSON
	const eventsDataPath = getPathByConstantName('EVENTS_DATA_PATH');
	writeFile(eventsDataPath, events);
	console.log('————————————————————————————————————————————————————\n\n');

	return data;
};

const extractAndSaveEntities = ({ documents, events }) => new Promise((resolve, reject) => {
	const data = [...documents, ...events];
	return collectEntitiesFromDataItem(data[0], data)
		.then(() => resolve({ documents, events }))
		.catch(reject);
});

const logSuccessMessage = () => {
	const endDate = new Date() - startDate;

	console.log('FINISHED EXECUTING SCRIPT:');
	console.log('————————————————————————————————————————————————————');
	console.info('Execution time: %dms', endDate);
	console.log('————————————————————————————————————————————————————\n\n');
};

convertExcelToJSON(['documents', 'events'])
	.then(logDataStats)
	.then(parseDates)
	.then(extractAndSaveKinds)
	.then(extractAndSaveClassifications)
	.then(extractAndSaveStakeholders)
	.then(extractAndSaveEntities)
	// .then(extractAndSaveOriginals) // Save files and check if already existing
	.then(extractAndAddTranscripts)
	.then(saveDocumentsAndEvents)
	.then(logSuccessMessage)
	.catch(abortWithError);
