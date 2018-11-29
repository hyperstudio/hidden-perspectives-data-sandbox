const unirest = require('unirest');
const API_KEY = process.env.API_KEY;

function analyzeText(dataToBeAnalyzed, dandelionOptions) {
    const { apiKey, urlKey, includeValues } = dandelionOptions;
    const { mergedString } = dataToBeAnalyzed;

    try {
        const url = `https://api.dandelion.eu/datatxt/${urlKey}/v1/?text=${mergedString}&include=${includeValues}&token=${apiKey}&lang=en`;

        return new Promise(resolve => {
            unirest.post(url).end(response => {
                const { headers, body, error } = response;

                if (error) {
                    console.log('Dandelion API: Response error');
                    console.log(error);
                }

                const unitsLeft = headers['x-dl-units-left'];

                resolve({
                    entities: error ? 'error' : body.annotations,
                    unitsLeft
                });
            });
        });
    } catch (error) {
        console.log('Dandelion API: Catched');
        console.log(error);

        resolve({
            entities: 'error',
            unitsLeft
        });
    }
}

function extractEntitiesWithDandelion(dataToBeAnalyzed) {
    // Overview of API Endpoints: https://dandelion.eu/docs/
    const dandelionOptions = {
        // Checkout Dandelion (https://dandelion.eu/) for a free key
        apiKey: API_KEY,
        urlKey: 'nex', // 'nex' for entity extraction
        includeValues: 'types,abstract'
    };

    const analyzeTextPromise = analyzeText(dataToBeAnalyzed, dandelionOptions);

    return analyzeTextPromise;
}

module.exports = extractEntitiesWithDandelion;
