const fs = require('fs');
const { Promise } = require('es6-promise');
const unirest = require('unirest');
const crypto = require('crypto');

const API_KEY = process.env.API_KEY;

const events01 = require('./json/briefing-book_events--01--b.json');
const events02 = require('./json/briefing-book_events--02--b.json');
const events03 = require('./json/briefing-book_events--03--b.json');
const events04 = require('./json/briefing-book_events--04--b.json');

const eventsJSON = [].concat.apply(
	[],
	[events01, events02, events03, events04],
);

// Checkout Dandelion (https://dandelion.eu/) for a free key
const apiKey = API_KEY;

const worksheetType = 'events';

// Type of text analysis that should be applied.
// Overview of API Endpoints: https://dandelion.eu/docs/
const analysisTypes = {
	// https://dandelion.eu/docs/api/datatxt/nex/v1/
	entity: {
		urlKey: 'nex',
		resultKey: 'annotations',
		includedCells: ['Description', 'Title'],
		includeValues: 'types,abstract',
	},
	// https://dandelion.eu/docs/api/datatxt/sent/v1/
	sentiment: {
		urlKey: 'sent',
		resultKey: 'sentiment',
		includedCells: ['Summary'],
		includeValues: 'score_details',
	},
	// TODO: Train model for cl: https://dandelion.eu/docs/api/datatxt/cl/models/v1/
	// https://dandelion.eu/docs/api/datatxt/cl/v1/
	// categories: {
	//     urlKey: 'cl'
	// }
};

function analyzeText(analisysType, text, includeValues, model) {
	try {
		const url = `https://api.dandelion.eu/datatxt/${analisysType}/v1/?text=${text}&include=${includeValues}&token=${apiKey}&model=${model}&lang=en`;

		return new Promise((resolve) => {
			unirest.post(url).end((response, error) => {
				console.log(response.error);
				resolve(response.body);
			});
		});
	} catch (e) {
		console.log(e);
	}
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleEntities(entities) {
	// console.log(entities);

	return entities.map((entity) => {
		const {
			spot, title, uri, types,
		} = entity;

		const getType = (types) => {
			let entityType;
			// console.log(types);

			types.forEach((type) => {
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

			return entityType;
		};

		const type = getType(types);
		let entityObj;
		const id = crypto.randomBytes(20).toString('hex');
		const dateNow = new Date();

		if (type === 'location') {
			entityObj = {
				_typeName: type,
				id,
				createdAt: dateNow,
				locationDescription: '',
				locationName: title,
				wikipediaUri: uri,
			};
		} else if (type === 'person' || type === 'organisation') {
			entityObj = {
				_typeName: type,
				id,
				createdAt: dateNow,
				stakeholderFullName: title,
				wikipediaUri: uri,
			};
		} else if (type === 'event') {
			entityObj = {
				_typeName: type,
				id,
				createdAt: dateNow,
				name: title,
				wikipediaUri: uri,
			};
		}

		if (type) {
			return {
				bb,
				originalID,
				entityObj,
			};
		}
	});
}

const analyzedTextPromises = [];
const fromTo = [701, 702];

eventsJSON.forEach((event, index) => {
	const { eventDescription, eventTitle } = event;
	const textToBeAnalyzed = [eventDescription, eventTitle].join('');

	if (index >= fromTo[0] && index < fromTo[1]) {
		console.log(textToBeAnalyzed);

		// console.log(eventsJSON[index].documentOriginalID);
		// console.log(analysisTypes.entity.urlKey);
		// console.log(textToBeAnalyzed);
		// console.log(analysisTypes.entity.includeValues);
		// console.log('-------------------------');

		let analyzedTextPromise;
		try {
			analyzedTextPromise = analyzeText(
				analysisTypes.entity.urlKey,
				textToBeAnalyzed,
				analysisTypes.entity.includeValues,
			);
			analyzedTextPromises.push(analyzedTextPromise);
		} catch (e) {
			console.log(e);
		}
	}
});

Promise.all(analyzedTextPromises).then((results) => {
	const eventEntities = results.map((result, index) => {
		const entities = handleEntities(result.annotations);
		const filteredEntities = entities.filter((entity) => entity);

		return filteredEntities;
	});

	// console.log(eventEntities);

	try {
		fs.writeFile(
			`./json/eventEntities/${worksheetType}_entities__${fromTo[0]}-${
				fromTo[1]
			}.json`,
			JSON.stringify(eventEntities),
			'utf8',
			() => {
				console.log('Done!');
			},
		);
	} catch (e) {
		console.log(e);
	}
});
