const path = require('path');
const { FILE_PATHS } = require('../constants');

const rootPath = path.resolve(__dirname);
const dataPath = path.resolve(rootPath, '../../../hidden-perspective-data/');

const getAbsoluteDataPath = (relativePath) => path.resolve(dataPath, relativePath);
const getPathByConstantName = (constantName) => getAbsoluteDataPath(FILE_PATHS[constantName]);

module.exports = {
	getAbsoluteDataPath,
	getPathByConstantName,
};
