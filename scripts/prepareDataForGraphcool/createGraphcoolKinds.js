const saveGraphcoolData = require('../utils/saveGraphcoolData');

function saveKindNode(nodes) {
	const dataOptions = {
		data: nodes,
		type: 'nodes',
		fileName: 'kindsNodes.json',
	};

	return saveGraphcoolData(dataOptions);
}

function saveKindRelations(relations) {
	const dataOptions = {
		data: relations,
		type: 'relations',
		fileName: 'kindsRelations.json',
	};

	return saveGraphcoolData(dataOptions);
}

const createKindNode = ({ id, name }) => ({
	_typeName: 'Kind',
	id,
	name,
});

const createKindRelation = (kind) => (documentId) => [
	{
		_typeName: 'Kind',
		id: kind.id,
		fieldName: 'documentsWithKind',
	},
	{
		_typeName: 'Document',
		id: documentId,
		fieldName: 'documentKinds',
	},
];

function createGraphcoolKinds(data) {
	const { kinds } = data;

	const kindNodes = kinds.map(createKindNode);

	const kindRelations = kinds.reduce((acc, kind) => [
		...acc,
		...kind.documentsWithTag.map(createKindRelation(kind)),
	], []);

	return Promise.all([
		saveKindNode(kindNodes),
		saveKindRelations(kindRelations),
	])
		.then(() => Promise.resolve(data))
		.catch((err) => {
			throw new Error(err);
		});
}

module.exports = createGraphcoolKinds;
