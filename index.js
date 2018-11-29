require('dotenv').config();
const fs = require('fs');

// Util scripts
const parseDates = require('./scripts/utils/parseDates.js');
const writeFile = require('./scripts/utils/writeFile.js');
const appendToFile = require('./scripts/utils/appendToFile.js');
const extractEntitiesWithDandelion = require('./scripts/utils/extractEntitiesWithDandelion.js');

// Data handling scripts
const convertExcelToJSON = require('./scripts/convertExcelToJSON.js');
const createDocumentTagsJSON = require('./scripts/createDocumentTagsJSON.js');
const getClusteredDocumentStakeholders = require('./scripts/getClusteredDocumentStakeholders.js');
const getStakeholderMergedStrings = require('./scripts/getStakeholderMergedStrings.js');
const clusterExtractedEntities = require('./scripts/clusterExtractedEntities.js');

// Parse document and event sheets to json
const excelData = convertExcelToJSON(['documents', 'events']);

const allowDandelionExtraction = true;

Promise.resolve(excelData)
    // Merge documents and events data
    .then(data => {
        const [documents, events] = data.map(datum =>
            [].concat.apply([], datum)
        );

        console.log(`Documents: ${documents.length}`);
        console.log(`Events: ${events.length}`);

        return [documents, events];
    })
    .catch(error => console.log(error.message))
    // Parse documents and event dates
    .then(data => {
        const dataWithParsedDates = parseDates(data);
        return dataWithParsedDates;
    })
    // Extract kind tags
    .then(data => {
        const kindsJSON = createDocumentTagsJSON('kind', data);
        writeFile('./data/json/kind/tagsKind.json', kindsJSON);

        return data;
    })
    // Extract classification tags
    .then(data => {
        const classificationJSON = createDocumentTagsJSON(
            'classification',
            data
        );
        writeFile(
            './data/json/kind/classificationTags.json',
            classificationJSON
        );

        return data;
    })
    // Cluster stakeholders from documents and events
    .then(data => {
        const clusteredDocumentStakeholders = getClusteredDocumentStakeholders(
            data
        );
        writeFile(
            './data/json/stakeholder/clusteredDocumentStakeholders.json',
            clusteredDocumentStakeholders
        );

        return data;
    })
    // Get merged strings for stakeholder extraction with dandelion api
    .then(data => {
        const stakeholderStrings = getStakeholderMergedStrings(data);
        const { documentStrings, eventStrings } = stakeholderStrings;

        const mergedData = [].concat.apply([], [documentStrings, eventStrings]);
        return mergedData;
    })
    // TODO: Clean up functions
    .then(mergedData => {
        const mergedDataLength = mergedData.length;

        let dandelionUnitsLeft = 1;
        let entitiesFileLength = 0;

        // Get entities from Dandelion
        const getEntities = textToBeAnalyzed => {
            return new Promise(resolve => {
                // Extract entities from string with Dandelion API
                const extractedEntitiesPromise = extractEntitiesWithDandelion(
                    textToBeAnalyzed
                );
                Promise.resolve(extractedEntitiesPromise).then(result => {
                    resolve(result);
                });
            });
        };

        const writeEnties = extractedEntities => {
            return new Promise(resolve => {
                fs.readFile(
                    './data/json/entities/extractedEntities.json',
                    'utf8',
                    (error, entityJSON) => {
                        if (error) {
                            console.log(`Read file error: ${error}`);
                            writeEnties();
                        } else {
                            const currentString =
                                mergedData[entitiesFileLength];
                            const entitiesObj = JSON.parse(entityJSON);
                            entitiesFileLength = entitiesObj.length;

                            console.log(
                                `dandelionUnitsLeft: ${dandelionUnitsLeft}, entitiesFileLength: ${entitiesFileLength}`
                            );

                            if (
                                entitiesFileLength < mergedDataLength &&
                                dandelionUnitsLeft > 0 &&
                                allowDandelionExtraction &&
                                extractedEntities !== 'initial'
                            ) {
                                // Safety measure: Dandelion API allows max. 50 requests per second
                                setTimeout(() => {
                                    const extractedData = {
                                        entities: extractedEntities,
                                        fileName: currentString.fileName,
                                        originalString:
                                            currentString.mergedString
                                    };

                                    appendToFile(
                                        './data/json/document/extractedEntities.json',
                                        extractedData,
                                        () => {
                                            console.log(
                                                'Extract next entities!'
                                            );
                                            extractEnties();
                                        }
                                    );
                                }, 25);
                            } else if (
                                extractedEntities === 'initial' &&
                                entitiesFileLength < mergedDataLength &&
                                dandelionUnitsLeft > 0
                            ) {
                                console.log('Extract initial entities!');
                                extractEnties();
                            } else if (dandelionUnitsLeft === 0) {
                                console.log('No Dandelion Units left!');
                                resolve(entitiesObj);
                            } else if (
                                entitiesFileLength === mergedDataLength
                            ) {
                                console.log('Extracted all entities!');
                                resolve(entitiesObj);
                            }
                        }
                    }
                );
            });
        };

        const extractEnties = () => {
            const currentString = mergedData[entitiesFileLength];
            Promise.resolve(getEntities(currentString)).then(result => {
                const { entities, unitsLeft } = result;
                dandelionUnitsLeft =
                    unitsLeft !== undefined
                        ? unitsLeft
                        : (dandelionUnitsLeft -= 1);

                writeEnties(entities).then(entitiesFileData => {
                    clusterExtractedEntities(entitiesFileData);
                });
            });
        };

        writeEnties('initial');
    });
