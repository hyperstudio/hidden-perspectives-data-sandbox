const splitDocumentAuthors = require('./splitDocumentAuthors.js');

function getClusteredDocumentStakeholders({ documents }) {
	const documentStakeholders = {};
	documents.forEach((document) => {
		const {
			fileName,
			author,
			source,
			recipient,
			publisher,
		} = document;

		const splittedAuthors = author ? splitDocumentAuthors(author) : null;

		const stakeholderValues = [
			splittedAuthors,
			source,
			recipient,
			publisher,
		];

		const addStakeholder = (value) => {
			const stakeholderKey = value || 'blank';
			const trimmedStakeholderKey = stakeholderKey.trim();

			const hasStakeholder = Object.prototype.hasOwnProperty.call(
				documentStakeholders,
				trimmedStakeholderKey,
			);

			if (!hasStakeholder) {
				documentStakeholders[trimmedStakeholderKey] = [fileName];
			} else {
				documentStakeholders[trimmedStakeholderKey].push(fileName);
			}
		};

		stakeholderValues.forEach((stakeholderValue) => {
			if (stakeholderValue && stakeholderValue instanceof Array) {
				stakeholderValue.forEach((currentStakeholderValue) => {
					addStakeholder(currentStakeholderValue);
				});
			} else {
				addStakeholder(stakeholderValue);
			}
		});
	});

	return documentStakeholders;
}

module.exports = getClusteredDocumentStakeholders;
