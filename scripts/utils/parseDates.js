const chrono = require('chrono-node');
const cliProgress = require('cli-progress');
const logger = require('../utils/logger');

const isDateFormat = (testDate) => testDate instanceof Date;

function parsedDates({ documents, events }) {
	logger.logTitle('Parsing dates in data');

	let currentlyProcessed = 0;
	const totalLength = documents.length + events.length;
	const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
	progressBar.start(totalLength, 0);

	const documentsWithParsedDates = documents.map((document) => {
		const { date, publicationDate } = document;

		const parsedDate = isDateFormat(date) ? date : chrono.parseDate(date);
		const parsedPublicationDate = isDateFormat(publicationDate)
			? publicationDate
			: chrono.parseDate(publicationDate);

		progressBar.update(currentlyProcessed += 1);
		return {
			...document,
			date: parsedDate,
			publicationDate: parsedPublicationDate,
		};
	});

	const eventsWithParsedDates = events.map((event) => {
		const { startDate, endDate } = event;

		const parsedStartDate = isDateFormat(startDate)
			? startDate
			: chrono.parseDate(startDate);
		const parsedEndDate = isDateFormat(endDate)
			? endDate
			: chrono.parseDate(endDate);

		progressBar.update(currentlyProcessed += 1);
		return {
			...event,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
		};
	});

	progressBar.stop();
	logger.logEnd();
	return {
		documents: documentsWithParsedDates,
		events: eventsWithParsedDates,
	};
}

module.exports = parsedDates;
