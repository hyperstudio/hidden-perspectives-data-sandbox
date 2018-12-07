const saveGraphcoolData = require('../utils/saveGraphcoolData');

const createDocumentNode = ({
	fileName,
	sessionNumber,
	title,
	date,
	summary,
	publicationDate,
	dnsaCitation,
	dnsaCollection,
	dnsaItemNumber,
	dnsaOrigin,
	dnsaFrom,
	dnsaTo,
	dnsaIndividual,
	dnsaSubject,
	dnsaAbstract,
	dnsaUrl,
	textFileContent,
}) => ({
	_typeName: 'Document',
	id: fileName,
	createdAt: new Date(),
	dnsaAbstract,
	dnsaCitation,
	dnsaCollection,
	dnsaFrom,
	dnsaItemNumber,
	dnsaOrigin,
	dnsaStakeholder: dnsaIndividual,
	dnsaSubject,
	dnsaTo,
	dnsaUrl,
	documentCreationDate: date,
	documentDescription: summary,
	documentMediaType: 'RawText',
	documentOriginalID: fileName,
	documentPublicationDate: publicationDate,
	documentTitle: title,
	documentTranscript: textFileContent,
	sessionNumber,
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
