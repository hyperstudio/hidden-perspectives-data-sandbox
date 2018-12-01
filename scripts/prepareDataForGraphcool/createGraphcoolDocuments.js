const writeFile = require('../utils/writeFile');
const { getPathByConstantName } = require('../utils/pathUtil');
const saveGraphcoolData = require('../utils/saveGraphcoolData');

// const relationFields = {
// 	briefingBooksMentionedIn: [],
// 	documentAuthors: [],
// 	documentClassification: [],
// 	documentDuplicates: [],
// 	documentFiles: [],
// 	documentKind: [],
// 	mentionedEvents: [],
// 	mentionedLocations: [],
// 	mentionedStakeholders: [],
//	documentFiles: [documentOriginalFile],
// };

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

const createGraphcoolDocuments = (data) => {
	const documentNodes = data.documents.map(createDocumentNode);
	return saveGraphcoolData({
		data: documentNodes,
		type: 'nodes',
		fileName: 'documentsNodes.json',
	})
		.then(() => Promise.resolve(data))
		.catch((err) => {
			throw new Error(err);
		});
};

module.exports = createGraphcoolDocuments;