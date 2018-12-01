const SOLID_LINE = 	'————————————————————————————————————————————————————————';
const DOTTED_LINE = '・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・';

const startDate = new Date();

const logTitle = (title) => console.log(`

${title.toUpperCase()}
${SOLID_LINE}
`);

const logKeyValuePair = ({ key, value, origin }) => console.log(`${DOTTED_LINE}
${key.toUpperCase()}: ${value} ${origin ? `from ${origin}` : ''}`);

const logEnd = () => console.log(`
${SOLID_LINE}
`);

const logSuccessMessage = () => {
	const duration = new Date() - startDate;

	logTitle('Finished executing script');
	logKeyValuePair({
		key: 'Execution time',
		value: duration,
	});
	logEnd();
	process.exit(0);
};

const logDataStats = (data) => {
	const { documents, events } = data;
	logTitle('Data found in spreadsheets');
	logKeyValuePair({ key: 'Documents', value: documents.length });
	logKeyValuePair({ key: 'Events', value: events.length });

	logEnd();

	return data;
};

module.exports = {
	logTitle,
	logKeyValuePair,
	logEnd,
	logSuccessMessage,
	logDataStats,
};
