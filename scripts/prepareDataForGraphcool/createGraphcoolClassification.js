function createGraphcoolClassification(data) {
	const { classifications } = data;
	console.log(classifications);

	const classificationNames = Object.keys(classifications);

	const classificationFields = {
		id: 'generated id with chronos',
		documentsWithClassification: [], // Document relations
		name: 'classification name',
	};

	return data;
}

module.exports = createGraphcoolClassification;
