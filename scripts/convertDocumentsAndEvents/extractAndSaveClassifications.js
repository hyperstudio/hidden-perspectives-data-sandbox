const logger = require('../utils/logger');
const writeFile = require('../utils/writeFile');
const createDocumentTagsJSON = require('./createDocumentTagsJSON');
const { getPathByConstantName } = require('../utils/pathUtil');

const extractAndSaveClassifications = (data) => {
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
};

module.exports = extractAndSaveClassifications;
