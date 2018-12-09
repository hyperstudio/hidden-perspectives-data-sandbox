const getRandomID = require('../utils/getRandomID');
const saveGraphcoolData = require('../utils/saveGraphcoolData');
const filterArrayForObjectsWithUniqueKey = require('../utils/filterArrayForObjectsWithUniqueKey');

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

function createClassificationNode(name) {
	const classificationFields = {
		_typeName: 'Classification',
		id: getRandomID(),
		name,
	};

	return classificationFields;
}

function createClassificationRelation({ id }, documentID) {
	const relationClassification = {
		_typeName: 'Classification',
		id,
		fieldName: 'documentsWithClassification',
	};
	const relationDocument = {
		_typeName: 'Document',
		id: documentID,
		fieldName: 'documentClassification',
	};

	return [relationClassification, relationDocument];
}

function createGraphcoolClassifications(data) {
	const { classifications } = data;

	const classificationNames = Object.keys(classifications);
	const classificationNodes = classificationNames
		.filter((name) => name)
		.map((name) => createClassificationNode(name));

	const classificationRelations = classificationNodes.map((classificationNode) => {
		const { name } = classificationNode;
		const documentsWithClassification = classifications[name];

		return documentsWithClassification
			.filter((docId) => docId)
			.map((docId) => createClassificationRelation(classificationNode, docId));
	});

	const flattenedClassificationRelations = [].concat(...classificationRelations);

	return Promise.all([
		saveClassificationNode(classificationNodes),
		saveClassificationRelations(flattenedClassificationRelations),
	])
		.then(() => Promise.resolve(data))
		.catch((err) => {
			throw new Error(err);
		});
}

module.exports = createGraphcoolClassifications;
