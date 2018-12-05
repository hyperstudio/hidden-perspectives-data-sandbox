const logger = require('../utils/logger');
const { getPathByConstantName } = require('../utils/pathUtil');
const writeFile = require('../utils/writeFile');

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

module.exports = saveDocumentsAndEvents;
