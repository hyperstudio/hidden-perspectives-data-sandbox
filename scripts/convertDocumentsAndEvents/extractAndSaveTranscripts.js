const fs = require('fs');
const path = require('path');

const { getPathByConstantName } = require('../utils/pathUtil');

function getTextFilePaths(directoryPath) {
	let allTextFilesPaths;

	try {
		allTextFilesPaths = fs.readdirSync(directoryPath).map((file) => {
			const filePath = path.join(directoryPath, file);
			return filePath;
		});
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log(`FILE NOT FOUND: ${directoryPath}`);
		} else {
			throw error;
		}
	}

	return allTextFilesPaths;
}

function getTextFileContent(textFilePath) {
	let textFileContent;
	try {
		textFileContent = fs.readFileSync(textFilePath, 'utf8');
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log(`FILE NOT FOUND: ${textFilePath}`);
		} else {
			throw error;
		}
	}

	return textFileContent;
}

function getUirFromFileName(filePath) {
	const fileName = path.basename(filePath);
	const fileExtension = path.extname(fileName);
	const fileBaseName = path.basename(fileName, fileExtension);

	return fileBaseName;
}
function extractAndSaveTranscripts(data) {
	const { documents } = data;

	const textFilesDirectoryPath = getPathByConstantName('RAW_TEXT_FILES_DIRECTORY_PATH');
	const textFilePaths = getTextFilePaths(textFilesDirectoryPath);

	console.log('ADD DOCUMENTS TEXT FILE CONTENT TO DOCUMENTS DATA:');
	console.log('————————————————————————————————————————————————————');
	console.log(`Total number of text files: ${textFilePaths.length}`);

	textFilePaths.forEach((textFilePath) => {
		const fileNameUir = getUirFromFileName(textFilePath);
		const textFileContent = getTextFileContent(textFilePath);

		const checkFileNameUir = (fileItem) => fileItem.fileName === fileNameUir;
		const documentItemDataIndex = documents.findIndex(checkFileNameUir);

		if (documentItemDataIndex >= 0) {
			documents[documentItemDataIndex].textFileContent = textFileContent;
		}
	});

	console.log('————————————————————————————————————————————————————\n\n');

	return data;
}

module.exports = extractAndSaveTranscripts;
