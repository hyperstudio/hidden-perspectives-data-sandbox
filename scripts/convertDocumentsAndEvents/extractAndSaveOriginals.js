const fs = require('fs');
const { getPathByConstantName } = require('../utils/pathUtil');
const { uploadFile } = require('../utils/fileUpload');
const logger = require('../utils/logger');

const getFileConnector = (files) => (document) => {
	const { fileName } = document;
	const file = files.find(({ name }) => `${fileName}.pdf` === name);
	return {
		...document,
		documentOriginalFile: (file && file.id) || null,
	};
};

const connectDataToOriginals = (data, files) => ({
	...data,
	documents: data.documents.map(getFileConnector(files)),
});

const getUploadSequenceReducer = (
	originalsParentPath,
	files,
) => (previousPromise, fullFileName) => {
	const path = `${originalsParentPath}/${fullFileName}`;
	return new Promise((
		fileReadUploaded,
		fileReadUploadFailed,
	) => previousPromise.then(() => {
		fs.readFile(path, 'utf-8', (readErr, file) => {
			if (readErr) return fileReadUploadFailed(readErr);
			return uploadFile(fullFileName, file)
				.then((fileObject) => {
					logger.logKeyValuePair({
						key: 'File successfully uploaded',
						value: fileObject.id,
						origin: fullFileName,
					});
					files.push(fileObject);
					fileReadUploaded(fileObject);
				})
				.catch(fileReadUploadFailed);
		});
	}));
};

const uploadFilesInSequence = (originalsParentPath, paths) => new Promise((resolve, reject) => {
	const files = [];
	paths.reduce(getUploadSequenceReducer(originalsParentPath, files), Promise.resolve())
		.then(() => resolve(files))
		.catch(reject);
});

const extractAndSaveOriginals = (data) => new Promise((resolve, reject) => {
	logger.logTitle('Extracting and saving the original document files');
	const originalsParentPath = getPathByConstantName('ORIGINAL_DOCUMENT_DIRECTORY_PATH');
	fs.readdir(originalsParentPath, (err, paths) => {
		if (err) return reject(err);
		logger.logKeyValuePair({
			key: 'Total paths read',
			value: paths.length,
		});
		return uploadFilesInSequence(originalsParentPath, paths)
			.then((files) => {
				logger.logKeyValuePair({
					key: 'Total files extracted',
					value: files.length,
					origin: `\n${originalsParentPath}`,
				});
				return connectDataToOriginals(data, files);
			})
			.then((connectedData) => {
				logger.logEnd();
				return resolve(connectedData);
			})
			.catch(reject);
	});
});

module.exports = extractAndSaveOriginals;
