const fs = require('fs');

// Util scripts
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');

// const isArray = Array.isArray(dataFromFile);
// const dataLength = isArray ? dataFromFile.length : Object.keys(dataFromFile).length;

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
			clusteredEntities[title] = [fileName];
		} else {
			clusteredEntities[title].push(fileName);
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
	console.log(Object.keys(data.rawEntities).length);
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
