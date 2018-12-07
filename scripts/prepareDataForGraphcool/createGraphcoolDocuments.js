const saveGraphcoolData = require('../utils/saveGraphcoolData');
const omitNullValues = require('../utils/omitNullValues');

const createTitleFallback = (title, summary) => title
	|| (summary ? `Untitled — ${summary.substring(0, 50)}…` : 'Untitled');

const createDocumentNode = ({
	fileName,
	title,
	date,
	summary,
	publicationDate,
	textFileContent,
}) => omitNullValues({
	_typeName: 'Document',
	id: fileName,
	createdAt: new Date(),
	documentCreationDate: date,
	documentDescription: summary,
	documentMediaType: 'RawText',
	documentOriginalID: fileName,
	documentPublicationDate: publicationDate,
	documentTitle: createTitleFallback(title, summary),
	documentTranscript: textFileContent,
});

const createDocumentFileRelation = ({
	documentOriginalFile,
	fileName,
}) => documentOriginalFile && [
	{
		_typeName: 'Document',
		id: fileName,
		fieldName: 'documentFiles',
	},
	{
		_typeName: 'File',
		id: documentOriginalFile,
		fieldName: 'documentsIncludedIn',
	},
];

const createGraphcoolDocuments = (data) => Promise.all([
	saveGraphcoolData({
		data: data.documents.map(createDocumentNode),
		type: 'nodes',
		fileName: 'documentsNodes.json',
	}),
	saveGraphcoolData({
		data: data.documents
			.map(createDocumentFileRelation)
			.filter(Array.isArray),
		type: 'relations',
		fileName: 'documentsRelations.json',
	}),
])
	.then(() => Promise.resolve(data))
	.catch((err) => {
		throw new Error(err);
	});

module.exports = createGraphcoolDocuments;
