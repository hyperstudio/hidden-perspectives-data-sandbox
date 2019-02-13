const cliProgress = require('cli-progress');
const { getPathByConstantName } = require('../utils/pathUtil');
const { uploadFile } = require('../utils/fileUpload');
const readFile = require('../utils/readFile');
const writeFile = require('../utils/writeFile');
const getPathsInDir = require('../utils/getPathsInDir');
const logger = require('../utils/logger');
const abortWithError = require('../utils/abortWithError');

const progressBar = new cliProgress.Bar({
	format: 'progress [{bar}] {percentage}% | {value}/{total} | Currently: {id}',
}, cliProgress.Presets.shades_classic);

const getFileConnector = (files) => (document) => {
	const file = files.find(({ name }) => `${document.fileName}.pdf` === name);
	return {
		...document,
		documentOriginalFile: (file && file.id) || null,
	};
};

const connectDataToOriginals = (data, files) => ({
	...data,
	documents: data.documents.map(getFileConnector(files)),
});

const saveFile = (fileObject) => {
	const fileObjectsDataPath = getPathByConstantName('FILE_OBJECTS_DATA_PATH');
	return readFile(fileObjectsDataPath)
		.then(JSON.parse)
		.then((fileObjects) => {
			fileObjects.push(fileObject);
			return writeFile(fileObjectsDataPath, fileObjects)
				.then(() => fileObject);
		});
};

const getFileObjectFromFile = (fullFileName) => new Promise((resolve, reject) => {
	const fileObjectsDataPath = getPathByConstantName('FILE_OBJECTS_DATA_PATH');
	readFile(fileObjectsDataPath)
		.then(JSON.parse)
		.then((fileObjects) => {
			const fileObject = fileObjects.find(({ name }) => name === fullFileName);
			if (fileObject) return resolve(fileObject);
			return resolve(undefined);
		})
		.catch(reject);
});

const getUploadSequenceReducer = (originalsParentPath, files) => (
	previousPromise,
	fullFileName,
	idx,
) => previousPromise.then(
	() => getFileObjectFromFile(fullFileName)
		.then((fileObject) => {
			if (fileObject) return fileObject;
			return readFile(`${originalsParentPath}/${fullFileName}`, null)
				.then((file) => uploadFile(fullFileName, file))
				.then(saveFile);
		})
		.then((fileObject) => {
			progressBar.update(idx + 1, {
				id: fileObject.name,
			});
			files.push(fileObject);
			return fileObject;
		}),
);

const uploadFilesInSequence = (originalsParentPath, paths) => new Promise((resolve, reject) => {
	const files = [];

	paths.reduce(getUploadSequenceReducer(originalsParentPath, files), Promise.resolve())
		.then(() => resolve(files))
		.catch(reject);
});

const extractAndSaveOriginals = (data) => {
	logger.logTitle('Extracting and saving the original document files');
	const originalsParentPath = getPathByConstantName('ORIGINAL_DOCUMENT_DIRECTORY_PATH');
	return getPathsInDir(originalsParentPath)
		.then((paths) => {
			const matches = paths.filter(
				(path) => data.documents.some(({ fileName }) => path.includes(fileName)),
			);
			progressBar.start(matches.length, 0);
			return matches;
		})
		.then((paths) => uploadFilesInSequence(originalsParentPath, paths))
		.then((files) => connectDataToOriginals(data, files))
		.then((extendedData) => {
			progressBar.stop();
			logger.logEnd();
			return extendedData;
		})
		.catch(abortWithError);
};

module.exports = extractAndSaveOriginals;
