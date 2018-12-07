const getRandomID = require('../utils/getRandomID');
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


function createKindNode(name) {
	const kindsFields = {
		_typeName: 'Kind',
		id: getRandomID(),
		name,
	};

	return kindsFields;
}

function createKindRelation({ id }, documentID) {
	const relationKinds = {
		_typeName: 'Kind',
		id,
		fieldName: 'documentsWithKind',
	};
	const relationDocument = {
		_typeName: 'Document',
		id: documentID,
		fieldName: 'documentKinds',
	};

	return [relationKinds, relationDocument];
}

function createGraphcoolKinds(data) {
	const { kinds } = data;

	const kindNames = Object.keys(kinds);
	const kindNodes = kindNames
		.filter((name) => name)
		.map((name) => createKindNode(name));

	const kindRelations = kindNodes.map((kindNode) => {
		const { name } = kindNode;
		const documentsWithKind = kinds[name];

		return documentsWithKind
			.filter((docId) => docId)
			.map((docId) => createKindRelation(kindNode, docId));
	});

	const flattenedKindRelations = [].concat(...kindRelations);

	return Promise.all([
		saveKindNode(kindNodes),
		saveKindRelations(flattenedKindRelations),
	])
		.then(() => Promise.resolve(data))
		.catch((err) => {
			throw new Error(err);
		});
}

module.exports = createGraphcoolKinds;
