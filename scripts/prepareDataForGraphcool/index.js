const fs = require('fs');

// Util scripts
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');

function getNumberOfDataItems(data) {
	const isArray = Array.isArray(data);
	const dataLength = isArray ? data.length : Object.keys(data).length;

	return dataLength;
}

function getRelevantEntityType(entityTypes) {
	let entityType;
	// console.log(entityTypes);

	entityTypes.forEach((type) => {
		const regexPattern = '[^/]+$';
		const regex = new RegExp(regexPattern);
		const matchedReg = type.match(regex);
		const extractedType = matchedReg[0].toLowerCase();

		if (
			extractedType === 'person'
			|| extractedType === 'location'
			|| extractedType === 'organisation'
			|| extractedType === 'event'
		) {
			entityType = extractedType;
		}
	});

	return entityType || 'NO RELEVANT ENTITY TYPE';
}

function getRelevantDataFromFiles(dataPaths) {
	return new Promise((resolve) => {
		const dataPathsKeys = Object.keys(dataPaths);
		const data = {};

		console.log('READ DATA FROM FILES:');
		console.log('————————————————————————————————————————————————————');

		dataPathsKeys.forEach((dataPathKey) => {
			const dataPath = dataPaths[dataPathKey];
			try {
				const rawDataFromFile = fs.readFileSync(dataPath, 'utf8');
				const dataFromFile = JSON.parse(rawDataFromFile);

				console.log(`✓ ${dataPathKey}`);

				data[dataPathKey] = dataFromFile;
			} catch (error) {
				if (error.code === 'ENOENT') {
					console.log(`FILE NOT FOUND: ${dataPath}`);
				} else {
					throw error;
				}
			}
		});

		console.log('————————————————————————————————————————————————————\n\n');

		resolve(data);
	});
}

function clusterEntities(data) {
	const { rawEntities } = data;
	const clusteredEntities = {};
	const addEntity = (entity, fileName) => {
		const { title } = entity;
		const hasEntity = Object.prototype.hasOwnProperty.call(clusteredEntities, title);
		if (!hasEntity) {
			clusteredEntities[title] = {
				fileNames: [fileName],
				...entity,
			};
		} else {
			const { fileNames } = clusteredEntities[title];
			fileNames.push(fileName);
		}
	};

	rawEntities.forEach((datum) => {
		const { entities, fileName } = datum;

		if (entities && entities instanceof Array) {
			entities.forEach((entity) => {
				addEntity(entity, fileName);
			});
		} else {
			addEntity(entities, fileName);
		}
	});

	return { ...data, rawEntities: clusteredEntities };
}

function splitEntitiesInCategories(data) {
	const { rawEntities } = data;

	// TODO: Use .filter()
	Object.keys(rawEntities).forEach((entityKey) => {
		const { types } = rawEntities[entityKey];
		if (types && types.length > 0) {
			console.log(entityKey);
			// console.log(rawEntities[entityKey]);

			const relevantEntityType = getRelevantEntityType(types);
			console.log(relevantEntityType);
		}
	});

	return data;
}

function createGraphcoolBriefingBook() {

}

function createGraphcoolClassification() {

}

function createGraphcoolDocument() {

}

function createGraphcoolEvent() {

}

function createGraphcoolKind() {

}

function createGraphcoolLocation() {

}

function createGraphcoolStackeholder() {

}

function createGraphcoolFile() {

}

function createGraphcoolRelations() {

}

const relevantDataPaths = {
	documents: getPathByConstantName('DOCUMENTS_DATA_PATH'),
	events: getPathByConstantName('EVENTS_DATA_PATH'),
	kinds: getPathByConstantName('RAW_KINDS'),
	classifications: getPathByConstantName('RAW_CLASSIFICATIONS'),
	rawEntities: getPathByConstantName('RAW_ENTITIES'),
};

getRelevantDataFromFiles(relevantDataPaths)
	.then(clusterEntities)
	.then(splitEntitiesInCategories)
	// // Create Graphcool NODES
	// .then(createGraphcoolBriefingBook)
	// .then(createGraphcoolClassification)
	// .then(createGraphcoolDocument)
	// .then(createGraphcoolEvent)
	// .then(createGraphcoolKind)
	// .then(createGraphcoolLocation)
	// .then(createGraphcoolStackeholder)
	// .then(createGraphcoolFile) // System?
	// // Create Graphcool RELATIONS
	// .then(createGraphcoolRelations)
	.then(() => console.log('done'))
	.catch(abortWithError);
