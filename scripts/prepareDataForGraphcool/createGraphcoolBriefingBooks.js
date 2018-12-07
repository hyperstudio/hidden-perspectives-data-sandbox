const getRandomID = require('../utils/getRandomID');
const saveGraphcoolData = require('../utils/saveGraphcoolData');

const extractBriefingBookFromDocument = ({ fileName }) => {
	const briefingBookNumberAsString = fileName.substring(3, 6);
	const briefingBookNumber = parseInt(briefingBookNumberAsString, 10);

	return briefingBookNumber;
};

const extractBriefingBookFromEvent = ({ fileName }) => {
	const [briefingBookNumberString] = fileName.split('-');
	return parseInt(briefingBookNumberString, 10);
};

const uniqueArrayOfBriefingBookIDs = (documents) => [
	...new Set(documents.map(extractBriefingBookFromDocument)),
];

const createGraphcoolBriefingBookNode = (briefingBookNumber) => ({
	id: getRandomID(),
	createdAt: new Date(),
	briefingBookTitle: `Briefing Book ${briefingBookNumber}`,
});

const createDocumentRelation = (briefingBookId) => (document) => [
	{
		_typeName: 'BriefingBook',
		id: briefingBookId,
		fieldName: 'mentionedDocuments',
	},
	{
		_typeName: 'Document',
		id: document.fileName,
		fieldName: 'briefingBooksMentionedIn',
	},
];

const createEventRelation = (briefingBookId) => (event) => [
	{
		_typeName: 'BriefingBook',
		id: briefingBookId,
		fieldName: 'mentionedEvents',
	},
	{
		_typeName: 'Event',
		id: event.fileName,
		fieldName: 'briefingBooksMentionedIn',
	},
];

const getDocumentsByBriefingBookNumber = (briefingBookNumber) => (document) => (
	briefingBookNumber === extractBriefingBookFromDocument(document)
);

const getEventsByBriefingBookNumber = (briefingBookNumber) => (event) => (
	briefingBookNumber === extractBriefingBookFromEvent(event)
);

const createGraphcoolBriefingBookRelation = (data, briefingBookNumber, briefingBookId) => {
	const { documents, events } = data;

	const documentRelations = documents
		.filter(getDocumentsByBriefingBookNumber(briefingBookNumber))
		.map(createDocumentRelation(briefingBookId));

	const eventRelations = events
		.filter(getEventsByBriefingBookNumber(briefingBookNumber))
		.map(createEventRelation(briefingBookId));

	return [...documentRelations, ...eventRelations];
};

const createGraphcoolBriefingBooks = (data) => {
	const { nodes, relations } = uniqueArrayOfBriefingBookIDs(data.documents)
		.reduce((acc, briefingBookNumber) => {
			const node = createGraphcoolBriefingBookNode(briefingBookNumber);
			const relation = createGraphcoolBriefingBookRelation(
				data,
				briefingBookNumber,
				node.id,
			);
			return {
				nodes: [...acc.nodes, node],
				relations: [...acc.relations, relation],
			};
		}, { nodes: [], relations: [] });

	return Promise.all([
		saveGraphcoolData({
			fileName: 'briefingBookNodes.json',
			type: 'nodes',
			data: nodes,
		}),
		saveGraphcoolData({
			type: 'relations',
			fileName: 'briefingBookRelations.json',
			data: relations,
		}),
	])
		.then(() => data)
		.catch((err) => {
			throw new Error(err);
		});
};


module.exports = createGraphcoolBriefingBooks;

