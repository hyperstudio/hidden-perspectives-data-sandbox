const path = require('path');

const writeFile = require('./writeFile');
const { getPathByConstantName } = require('./pathUtil');

function saveGraphcoolData({ data, type, fileName }) {
	const pathContantName = type === 'nodes' ? 'GRAPHCOOL_NODES_PATH' : 'GRAPHCOOL_RELATIONS_PATH';
	const graphcoolDataPath = getPathByConstantName(pathContantName);
	const graphcoolDataFilePath = path.resolve(graphcoolDataPath, fileName);

	return writeFile(graphcoolDataFilePath, data);
}

module.exports = saveGraphcoolData;
