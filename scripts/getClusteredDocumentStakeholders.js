const splitDocumentAuthors = require('./utils/splitDocumentAuthors.js');

function getClusteredDocumentStakeholders(data) {
    const [documents, events] = data;

    const documentStakeholders = {};
    documents.forEach((document, index) => {
        const { fileName, author, source, recipient, publisher } = document;

        const splittedAuthors = author ? splitDocumentAuthors(author) : null;

        const stakeholderValues = [
            splittedAuthors,
            source,
            recipient,
            publisher
        ];

        const addStakeholder = value => {
            const stakeholderKey = value || 'blank';
            const trimmedStakeholderKey = stakeholderKey.trim();

            const hasStakeholder = documentStakeholders.hasOwnProperty(
                trimmedStakeholderKey
            );

            if (!hasStakeholder) {
                documentStakeholders[trimmedStakeholderKey] = [fileName];
            } else {
                documentStakeholders[trimmedStakeholderKey].push(fileName);
            }
        };

        stakeholderValues.forEach(stakeholderValue => {
            if (stakeholderValue && stakeholderValue instanceof Array) {
                stakeholderValue.forEach(stakeholderValue => {
                    addStakeholder(stakeholderValue);
                });
            } else {
                addStakeholder(stakeholderValue);
            }
        });
    });

    return documentStakeholders;
}

module.exports = getClusteredDocumentStakeholders;
