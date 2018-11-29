function isDocumentData(data) {
	const { fileName } = data;
	const fileNameStartChars = fileName.substring(0, 3);

	return fileNameStartChars === 'uir';
}

module.exports = isDocumentData;
