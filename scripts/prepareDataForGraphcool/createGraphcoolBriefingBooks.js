const getRandomID = require('../utils/getRandomID');
const saveGraphcoolData = require('../utils/saveGraphcoolData');

const extractBriefingBook = ({ fileName }) => {
	const briefingBookNumberAsString = fileName.substring(3, 6);
	const briefingBookNumber = parseInt(briefingBookNumberAsString, 10);

	return briefingBookNumber;
};

const uniqueArrayOfBriefingBookIDs = (documents) => [
	...new Set(documents.map(extractBriefingBook)),
];

const createGraphcoolBriefingBook = (briefingBookNumber) => ({
	id: getRandomID(),
	createdAt: new Date(),
	// briefingBookDescription: 'A description',
	briefingBookTitle: `Briefing Book ${briefingBookNumber}`,
});

const getBriefingBookFromDocuments = (documents) => (
	uniqueArrayOfBriefingBookIDs(documents)
		.map(createGraphcoolBriefingBook)
);

const createGraphcoolBriefingBooks = (data) => saveGraphcoolData({
	fileName: 'briefingBookNodes.json',
	type: 'nodes',
	data: getBriefingBookFromDocuments(data.documents),
})
	.then(() => Promise.resolve(data))
	.catch((err) => {
		throw new Error(err);
	});

module.exports = createGraphcoolBriefingBooks;
