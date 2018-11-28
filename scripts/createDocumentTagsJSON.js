function createDocumentTagsJSON(tagType, data) {
    const [documents, events] = data;

    const documentTags = {};

    documents.forEach(document => {
        const { fileName, kind, classification } = document;

        let tagName;
        if (tagType === 'kind') {
            tagName = kind;
        } else if (tagType === 'classification') {
            tagName = classification;
        }

        const hasTag = documentTags.hasOwnProperty(tagName);
        if (!hasTag) {
            documentTags[tagName] = [fileName];
        } else {
            documentTags[tagName].push(fileName);
        }
    });

    return documentTags;
}

module.exports = createDocumentTagsJSON;
