const chrono = require('chrono-node');
const cliProgress = require('cli-progress');
const logger = require('../utils/logger');

const isDateFormat = (testDate) => testDate instanceof Date;
const parseDate = (date) => {
	const dateString = `${date}`;
	const dateForParsing = dateString.length === 4 ? `1/1/${dateString}` : dateString;
	return chrono.parseDate(dateForParsing);
};

function parsedDates({ documents, events }) {
	logger.logTitle('Parsing dates in data');

	let currentlyProcessed = 0;
	const totalLength = documents.length + events.length;
	const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
	progressBar.start(totalLength, 0);

	const documentsWithParsedDates = documents.map((document) => {
		const { date, publicationDate } = document;

		const parsedDate = isDateFormat(date) ? date : parseDate(date);
		const parsedPublicationDate = isDateFormat(publicationDate)
			? publicationDate
			: parseDate(publicationDate);

		progressBar.update(currentlyProcessed += 1, {
			id: document.fileName,
		});
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
			: parseDate(startDate);
		const parsedEndDate = isDateFormat(endDate)
			? endDate
			: parseDate(endDate);

		progressBar.update(currentlyProcessed += 1, {
			id: event.fileName,
		});
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
