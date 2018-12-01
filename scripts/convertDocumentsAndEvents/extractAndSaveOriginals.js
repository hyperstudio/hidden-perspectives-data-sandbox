const cliProgress = require('cli-progress');
const { getPathByConstantName } = require('../utils/pathUtil');
const { uploadFile } = require('../utils/fileUpload');
const readFile = require('../utils/readFile');
const writeFile = require('../utils/writeFile');
const getPathsInDir = require('../utils/getPathsInDir');
const logger = require('../utils/logger');
const abortWithError = require('../utils/abortWithError');

let progressBarProgess = 0;
const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

const getFileConnector = (files) => (document) => {
	const file = files.find(({ name }) => `${document.fileName}.pdf` === name);
	return {
		...document,
		documentOriginalFile: (file && file.id) || null,
	};
};

const connectDataToOriginals = (data, files) => {
	logger.logKeyValuePair({ key: 'Total files extracted', value: files.length });

	return {
		...data,
		documents: data.documents.map(getFileConnector(files)),
	};
};

const saveFile = (fileObject) => {
	const fileObjectsDataPath = getPathByConstantName('FILE_OBJECTS_DATA_PATH');
	return readFile(fileObjectsDataPath)
		.then(JSON.parse)
		.then((fileObjects) => {
			const fileObjectIsInFile = !!fileObjects
				.find(({ name }) => name === fileObject.name);

			if (fileObjectIsInFile) {
				logger.logKeyValuePair({
					key: 'Not saving the fileObject to the files json as it was already found',
					value: fileObject.name,
				});
			}

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
			return reject();
		});
});

const getUploadSequenceReducer = (originalsParentPath, files) => (
	previousPromise,
	fullFileName,
) => previousPromise.then(() => getFileObjectFromFile(fullFileName)
	.catch(
		() => readFile(
			`${originalsParentPath}/${fullFileName}`,
		).then((file) => uploadFile(fullFileName, file)),
	)
	.then((fileObject) => {
		files.push(fileObject);
		return fileObject;
	}))
	.then(saveFile)
	.then((fileObject) => {
		progressBarProgess += 1;
		progressBar.update(progressBarProgess);
		return fileObject;
	});

const uploadFilesInSequence = (originalsParentPath, paths) => new Promise((resolve, reject) => {
	const files = [];

	logger.logKeyValuePair({ key: 'Total paths read', value: paths.length });

	paths.reduce(getUploadSequenceReducer(originalsParentPath, files), Promise.resolve())
		.then(() => resolve(files))
		.catch(reject);
});

const extractAndSaveOriginals = (data) => {
	logger.logTitle('Extracting and saving the original document files');
	const originalsParentPath = getPathByConstantName('ORIGINAL_DOCUMENT_DIRECTORY_PATH');
	progressBar.start(data.documents.length + data.events.length, 0);
	return getPathsInDir(originalsParentPath)
		.then((paths) => uploadFilesInSequence(originalsParentPath, paths))
		.then((files) => connectDataToOriginals(data, files))
		.then((extendedData) => {
			progressBar.stop();
			return extendedData;
		})
		.catch(abortWithError);
};

module.exports = extractAndSaveOriginals;
