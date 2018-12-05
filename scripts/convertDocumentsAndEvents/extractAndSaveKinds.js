const logger = require('../utils/logger');
const writeFile = require('../utils/writeFile');
const createDocumentTagsJSON = require('./createDocumentTagsJSON');
const { getPathByConstantName } = require('../utils/pathUtil');

const extractAndSaveKinds = (data) => {
	logger.logTitle('Extracting and saving raw kinds');

	const kindsJSONPath = getPathByConstantName('RAW_KINDS');
	const kindsJSON = createDocumentTagsJSON('kind', data);

	logger.logKeyValuePair({
		key: 'Kinds',
		value: Object.keys(kindsJSON).length,
	});

	return writeFile(kindsJSONPath, kindsJSON)
		.then(() => data);
};

module.exports = extractAndSaveKinds;
