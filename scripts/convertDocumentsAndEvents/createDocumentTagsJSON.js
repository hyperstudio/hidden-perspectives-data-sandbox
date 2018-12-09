function createDocumentTagsJSON(tagType, { documents }) {
	const documentTags = {};

	documents.forEach((document) => {
		const { fileName, kind, classification } = document;

		let tagName;
		if (kind && tagType === 'kind') {
			tagName = kind.trim().toLowerCase();
		} else if (classification && tagType === 'classification') {
			tagName = classification.trim().toLowerCase();
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
