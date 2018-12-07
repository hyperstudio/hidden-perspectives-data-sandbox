const cliProgress = require('cli-progress');
const pMinDelay = require('p-min-delay');
const fetch = require('node-fetch');
const { getPathByConstantName } = require('../utils/pathUtil');
const readFile = require('../utils/readFile');
const writeFile = require('../utils/writeFile');
const logger = require('../utils/logger');
const abortWithError = require('../utils/abortWithError');

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

const saveLocation = (location) => {
	const locationsDataPath = getPathByConstantName('LOCATIONS_DATA_PATH');
	return readFile(locationsDataPath)
		.then(JSON.parse)
		.then((locations) => {
			locations.push(location);
			return writeFile(locationsDataPath, locations)
				.then(() => location);
		});
};

const propEquals = (propName, value) => (obj) => obj[propName] === value;

const entityIsLocation = ({ types }) => types.includes(
	'http://dbpedia.org/ontology/Location',
);

const getLocationMapper = ({ fileName }) => (location) => ({
	...location,
	fileName,
});

const extractLocationFromEntity = (locations, entity) => locations.concat(
	entity.entities
		.filter(entityIsLocation)
		.map(getLocationMapper(entity)),
);

const entityHasEntitiesArray = ({ entities }) => Array.isArray(entities);

const extractLocations = (entities) => {
	const locations = entities
		.filter(entityHasEntitiesArray)
		.reduce(extractLocationFromEntity, []);
	return Promise.resolve(locations);
};

const reduceLocationToUniqueKeyValuePairObjectByUri = (locationsObj, location) => ({
	...locationsObj,
	[location.uri]: location,
});

const reduceLocationToUniqueKeyValuePairObjectByTitle = (locationsObj, location) => ({
	...locationsObj,
	[location.title]: location,
});

const makeLocationsUnique = (locations) => Object.values(
	Object.values(
		locations.reduce(reduceLocationToUniqueKeyValuePairObjectByUri, {}),
	).reduce(reduceLocationToUniqueKeyValuePairObjectByTitle, {}),
);

const composeUrl = (searchString) => [
	'https://eu1.locationiq.com/v1/search.php?key=',
	process.env.LOCATIONIQ_API_TOKEN,
	'&q=',
	escape(searchString),
	'&format=json',
].join('');

const augmentLocationWithGeocodedData = (location) => fetch(
	composeUrl(location.title),
)
	.then((response) => response.json())
	.then((augmentedLocation) => ({
		...location,
		...augmentedLocation[0],
	}))
	.catch((err) => {
		console.log(composeUrl(location.title));
		console.log(err);
	});

const getLocationFromFile = (location) => new Promise((resolve, reject) => {
	const locationsDataPath = getPathByConstantName('LOCATIONS_DATA_PATH');
	readFile(locationsDataPath)
		.then(JSON.parse)
		.then((locations) => {
			const locationInFile = locations.find(
				propEquals('title', location.title),
			);
			if (locationInFile) return resolve(locationInFile);
			return resolve(undefined);
		})
		.catch(reject);
});

const getLocationsAugmentationReducer = (augmentedLocations) => (
	previousPromise,
	location,
	idx,
) => previousPromise.then(
	() => getLocationFromFile(location)
		.then((augmentedLocation) => {
			if (augmentedLocation) return augmentedLocation;
			return pMinDelay(augmentLocationWithGeocodedData(location), 1000)
				.then(saveLocation);
		})
		.then((augmentedLocation) => {
			progressBar.update(idx + 1, {
				id: augmentedLocation.fileName,
			});
			augmentedLocations.push(augmentedLocation);
			return augmentedLocation;
		}),
);

const augmentLocationsWithGeocodedData = (locations) => new Promise((resolve, reject) => {
	const augmentedLocations = [];
	return locations.reduce(
		getLocationsAugmentationReducer(augmentedLocations),
		Promise.resolve(),
	)
		.then(() => resolve(augmentedLocations))
		.catch(reject);
});

const extractAndSaveLocations = (data) => {
	logger.logTitle('Extracting and saving the locations out of entities');
	return extractLocations(data.entities)
		.then(makeLocationsUnique)
		.then((locations) => {
			progressBar.start(locations.length, 0);
			return locations;
		})
		.then(augmentLocationsWithGeocodedData)
		.then((extendedData) => {
			progressBar.stop();
			logger.logEnd();
			return extendedData;
		})
		.catch(abortWithError);
};

module.exports = extractAndSaveLocations;
