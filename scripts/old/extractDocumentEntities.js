const fs = require('fs');
const { Promise } = require('es6-promise');
const unirest = require('unirest');
const crypto = require('crypto');
const API_KEY = process.env.API_TOKEN;

const documentsJSON = require('./json/briefing-book_documents--all.json');

// Checkout Dandelion (https://dandelion.eu/) for a free key
const apiKey = API_KEY;

const worksheetType = 'documents'; // can be 'events' or 'documents'

// Type of text analysis that should be applied.
// Overview of API Endpoints: https://dandelion.eu/docs/
const analysisTypes = {
    // https://dandelion.eu/docs/api/datatxt/nex/v1/
    entity: {
        urlKey: 'nex',
        resultKey: 'annotations',
        includedCells: ['Subject', 'Title', 'Summary'],
        includeValues: 'types,abstract'
    },
    // https://dandelion.eu/docs/api/datatxt/sent/v1/
    sentiment: {
        urlKey: 'sent',
        resultKey: 'sentiment',
        includedCells: ['Summary'],
        includeValues: 'score_details'
    }
    // TODO: Train model for cl: https://dandelion.eu/docs/api/datatxt/cl/models/v1/
    // https://dandelion.eu/docs/api/datatxt/cl/v1/
    // categories: {
    //     urlKey: 'cl'
    // }
};

function analyzeText(analisysType, text, includeValues, model) {
    try {
        const url = `https://api.dandelion.eu/datatxt/${analisysType}/v1/?text=${text}&include=${includeValues}&token=${apiKey}&model=${model}&lang=en`;

        return new Promise(resolve => {
            unirest.post(url).end((response, error) => {
                console.log(response.error);
                resolve(response.body);
            });
        });
    } catch (e) {
        console.log(text);
        console.log(e);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleEntities(mentionedIn, entities) {
    return entities.map(entity => {
        const { spot, title, uri, types } = entity;

        const getType = types => {
            let entityType;
            // console.log(types);

            types.forEach(type => {
                const regexPattern = '[^/]+$';
                const regex = new RegExp(regexPattern);
                const matchedReg = type.match(regex);
                const extractedType = matchedReg[0].toLowerCase();

                if (
                    extractedType === 'person' ||
                    extractedType === 'location' ||
                    extractedType === 'organisation' ||
                    extractedType === 'event'
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
                locationLatitude: null,
                locationLongitude: null,
                locationName: title,
                mentionedIn,
                wikipediaUri: uri
            };
        } else if (type === 'person' || type === 'organisation') {
            entityObj = {
                _typeName: type,
                id,
                createdAt: dateNow,
                mentionedIn,
                stakeholderFullName: title,
                wikipediaUri: uri
            };
        } else if (type === 'event') {
            entityObj = {
                _typeName: type,
                id,
                createdAt: dateNow,
                mentionedIn,
                name: title,
                wikipediaUri: uri
            };
        }

        if (type) {
            return entityObj;
        }
    });
}

const analyzedTextPromises = [];
const fromTo = [500, 558];

documentsJSON.forEach((document, index) => {
    const { documentDescription, documentTitle } = document;
    const textToBeAnalyzed = [documentDescription, documentTitle].join('');

    if (index >= fromTo[0] && index < fromTo[1]) {
        // console.log(documentsJSON[index].documentOriginalID);
        // console.log(analysisTypes.entity.urlKey);
        // console.log(textToBeAnalyzed);
        // console.log(analysisTypes.entity.includeValues);
        // console.log('-------------------------');

        let analyzedTextPromise;
        try {
            analyzedTextPromise = analyzeText(
                analysisTypes.entity.urlKey,
                textToBeAnalyzed,
                analysisTypes.entity.includeValues
            );
            analyzedTextPromises.push(analyzedTextPromise);
        } catch (e) {
            console.log(e);
        }
    }
});

Promise.all(analyzedTextPromises).then(results => {
    const documentEntities = results.map((result, index) => {
        const mentionedIn = documentsJSON[index + fromTo[0]].documentOriginalID;
        const entities = handleEntities(mentionedIn, result.annotations);
        const filteredEntities = entities.filter(entity => entity);

        return {
            mentionedIn,
            filteredEntities
        };
    });

    // console.log(documentEntities);

    try {
        fs.writeFile(
            `./json/${worksheetType}_entities__${fromTo[0]}-${fromTo[1]}.json`,
            JSON.stringify(documentEntities),
            'utf8',
            () => {
                console.log('Done!');
            }
        );
    } catch (e) {
        console.log(e);
    }
});
