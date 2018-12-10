const saveGraphcoolData = require('../utils/saveGraphcoolData');

function saveClassificationNode(nodes) {
	const dataOptions = {
		data: nodes,
		type: 'nodes',
		fileName: 'classificationNodes.json',
	};

	return saveGraphcoolData(dataOptions);
}

function saveClassificationRelations(relations) {
	const dataOptions = {
		data: relations,
		type: 'relations',
		fileName: 'classificationRelations.json',
	};

	return saveGraphcoolData(dataOptions);
}

const createClassificationNode = ({ id, name }) => ({
	_typeName: 'Classification',
	id,
	name,
});

const createClassificationRelation = (classification) => (documentId) => [
	{
		_typeName: 'Classification',
		id: classification.id,
		fieldName: 'documentsWithClassification',
	},
	{
		_typeName: 'Document',
		id: documentId,
		fieldName: 'documentClassification',
	},
];


function createGraphcoolClassifications(data) {
	const { classifications } = data;

	const classificationNodes = classifications.map(createClassificationNode);

	const classificationRelations = classifications.reduce((acc, classification) => [
		...acc,
		...classification.documentsWithTag.map(createClassificationRelation(classification)),
	], []);

	return Promise.all([
		saveClassificationNode(classificationNodes),
		saveClassificationRelations(classificationRelations),
	])
		.then(() => Promise.resolve(data))
		.catch((err) => {
			throw new Error(err);
		});
}

module.exports = createGraphcoolClassifications;
