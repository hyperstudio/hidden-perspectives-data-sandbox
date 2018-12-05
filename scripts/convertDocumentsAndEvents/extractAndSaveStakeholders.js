const logger = require('../utils/logger');
const writeFile = require('../utils/writeFile');
const getClusteredDocumentStakeholders = require('./getClusteredDocumentStakeholders');
const { getPathByConstantName } = require('../utils/pathUtil');

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

module.exports = extractAndSaveStakeholders;
