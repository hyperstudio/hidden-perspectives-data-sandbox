require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Util scripts
const parseDates = require('./scripts/utils/parseDates.js');
const writeFile = require('./scripts/utils/writeFile.js');
const appendToFile = require('./scripts/utils/appendToFile.js');
const extractEntitiesWithDandelion = require('./scripts/extractEntitiesWithDandelion.js');

// Data handling scripts
const convertExcelToJSON = require('./scripts/utils/convertExcelToJSON.js');
const createDocumentTagsJSON = require('./scripts/createDocumentTagsJSON.js');
const getClusteredDocumentStakeholders = require('./scripts/getClusteredDocumentStakeholders.js');
const getStakeholderMergedStrings = require('./scripts/getStakeholderMergedStrings.js');
const clusterExtractedEntities = require('./scripts/clusterExtractedEntities.js');

// Parse document and event sheets to json
const excelData = convertExcelToJSON(['documents', 'events']);

const rootPath = path.resolve(__dirname);
const dataPath = path.resolve(rootPath, '../hidden-perspective-data/');

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
        console.log();
        const kindsJSONPath = path.resolve(
            dataPath,
            './data/json/kind/tagsKind.json'
        );
        const kindsJSON = createDocumentTagsJSON('kind', data);
        writeFile(kindsJSONPath, kindsJSON);

        return data;
    })
    // Extract classification tags
    .then(data => {
        const classificationJSONPath = path.resolve(
            dataPath,
            './data/json/kind/classificationTags.json'
        );
        const classificationJSON = createDocumentTagsJSON(
            'classification',
            data
        );
        writeFile(classificationJSONPath, classificationJSON);

        return data;
    })
    // Cluster stakeholders from documents and events
    .then(data => {
        const clusteredDocumentStakeholders = getClusteredDocumentStakeholders(
            data
        );
        const clusteredDocumentStakeholdersPath = path.resolve(
            dataPath,
            './data/json/stakeholder/clusteredDocumentStakeholders.json'
        );
        writeFile(
            clusteredDocumentStakeholdersPath,
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
        const dataToBeAnalyzed = mergedData[entitiesFileLength];

        const shouldEntitiesBeExtracted =
            entitiesFileLength === mergedDataLength || dandelionUnitsLeft === 0;

        const extractEntiesPath = path.resolve(
            dataPath,
            './data/json/entities/extractedEntities.json'
        );

        // const writeEnties = extractedEntities => {
        //     return new Promise(resolve => {
        //         fs.readFile(
        //             extractEntiesPath,
        //             'utf8',
        //             (error, entityJSON) => {
        //                 if (error) {
        //                     console.log(`Read file error: ${error}`);
        //                     writeEnties();
        //                 } else {
        //                     const dataToBeAnalyzed =
        //                         mergedData[entitiesFileLength];
        //                     const entitiesObj = JSON.parse(entityJSON);
        //                     entitiesFileLength = entitiesObj.length;

        //                     console.log(
        //                         `dandelionUnitsLeft: ${dandelionUnitsLeft}, entitiesFileLength: ${entitiesFileLength}`
        //                     );

        //                     if (
        //                         !shouldEntitiesBeExtracted &&
        //                         extractedEntities !== 'initial'
        //                     ) {
        //                         // Safety measure: Dandelion API allows max. 50 requests per second
        //                         setTimeout(() => {
        //                             const extractedData = {
        //                                 entities: extractedEntities,
        //                                 fileName: dataToBeAnalyzed.fileName,
        //                                 originalString:
        //                                     dataToBeAnalyzed.mergedString
        //                             };

        //                             appendToFile(
        //                                 extractEntiesPath,
        //                                 extractedData,
        //                                 () => {
        //                                     console.log(
        //                                         'Extract next entities!'
        //                                     );
        //                                     extractEnties();
        //                                 }
        //                             );
        //                         }, 25);
        //                     } else if (
        //                         extractedEntities === 'initial' &&
        //                         !shouldEntitiesBeExtracted
        //                     ) {
        //                         console.log('Extract initial entities!');
        //                         extractEnties();
        //                     } else if (dandelionUnitsLeft === 0) {
        //                         console.log('No Dandelion Units left!');
        //                         resolve(entitiesObj);
        //                     } else if (
        //                         entitiesFileLength === mergedDataLength
        //                     ) {
        //                         console.log('Extracted all entities!');
        //                         resolve(entitiesObj);
        //                     }
        //                 }
        //             }
        //         );
        //     });
        // };

        // Promise.resolve(extractedEntitiesPromise).then(result => {
        //     console.log(result);
        //     // const { entities, unitsLeft } = result;
        //     // dandelionUnitsLeft =
        //     //     unitsLeft !== undefined
        //     //         ? unitsLeft
        //     //         : (dandelionUnitsLeft -= 1);
        // });

        // Get entities from Dandelion
        // const extractedEntitiesPromise = extractEntitiesWithDandelion(
        //     dataToBeAnalyzed
        // );

        // if (shouldEntitiesBeExtracted) {
        //     console.log('keep extracting entities');
        // } else {
        //     return extractedEntitiesPromise;
        // }
    })
    .then(() => {
        console.log('done');
    });
