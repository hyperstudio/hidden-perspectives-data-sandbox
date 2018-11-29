function createDocumentTagsJSON(tagType, { documents }) {
	const documentTags = {};

	documents.forEach((document) => {
		const { fileName, kind, classification } = document;

		let tagName;
		if (tagType === 'kind') {
			tagName = kind;
		} else if (tagType === 'classification') {
			tagName = classification;
		}

		const hasTag = Object.prototype.hasOwnProperty.call(documentTags, tagName);
		if (!hasTag) {
			documentTags[tagName] = [fileName];
		} else {
			documentTags[tagName].push(fileName);
		}
	});

	return documentTags;
}

module.exports = createDocumentTagsJSON;
