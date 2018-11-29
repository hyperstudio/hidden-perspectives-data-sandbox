function getStakeholderMergedStrings({ documents, events }) {
	const stakeholdersDocuments = documents.map((document) => {
		const {
			fileName,
			title,
			summary,
			source,
			recipient,
			publisher,
		} = document;

		const starkeholdersString = [
			title,
			summary,
			source,
			recipient,
			publisher,
		]
			.join(' ')
			.trim();

		return {
			fileName,
			mergedString: starkeholdersString.trim(),
		};
	});

	const stakeholdersEvents = events.map((event) => {
		const { fileName, title, description } = event;
		const starkeholdersString = [title, description].join(' ').trim();

		return {
			fileName,
			mergedString: starkeholdersString,
		};
	});

	return {
		documentStrings: stakeholdersDocuments,
		eventStrings: stakeholdersEvents,
	};
}

module.exports = getStakeholderMergedStrings;
