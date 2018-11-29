const fs = require('fs');
const { Promise } = require('es6-promise');
const Excel = require('exceljs');
const unirest = require('unirest');
const chrono = require('chrono-node');
const crypto = require('crypto');
const API_KEY = process.env.API_KEY;

// Checkout Dandelion (https://dandelion.eu/) for a free key
const apiKey = API_KEY;

const worksheetType = 'documents'; // can be 'events' or 'documents'
const worksheetNumber = '03';

// Path to Briefing Book Worksheet
const filename = `briefing-book_${worksheetType}--${worksheetNumber}`;
const pathToSheet = `./sheets/${filename}.xlsx`;

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
    const url = `https://api.dandelion.eu/datatxt/${analisysType}/v1/?text=${text}&include=${includeValues}&token=${apiKey}&model=${model}&lang=en`;

    return new Promise(resolve => {
        unirest.post(url).end(response => {
            // console.log(response.status, response.headers, response.body);
            resolve(response.body);
        });
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getEntities(documentData) {
    let text;
    if (worksheetType === 'documents') {
        const {
            documentTitle,
            documentSubject,
            documentSummary
        } = documentData;
        text = [documentTitle, documentSubject, documentSummary].join(' ');
    } else {
        text = documentData.eventDescription;
    }

    const analyzedText = analyzeText(
        analysisTypes.entity.urlKey,
        text,
        analysisTypes.entity.includeValues
    );
    return analyzedText;
}

function DocumentData(data) {
    const dateNow = new Date();

    const isDate = data[12] instanceof Date;
    let documentCreationDate;
    if (isDate) {
        documentCreationDate = data[12];
    } else if (data[12] && !isDate) {
        documentCreationDate = chrono.parseDate(data[12]);
    } else {
        documentCreationDate = new Date(0);
    }

    let documentPublicationDate;
    if (isDate) {
        documentPublicationDate = data[17];
    } else if (data[17] && !isDate) {
        documentPublicationDate = chrono.parseDate(data[17]);
    } else {
        documentPublicationDate = new Date(0);
    }

    return {
        _typeName: 'Document',
        // briefingBooksMentionedIn: [],
        createdAt: dateNow,
        // documentAuthor: null, // data[4]
        // documentClassification: null, // data[10]
        documentCreationDate,
        documentDescription: data[13] || '',
        documentMediaType: 'RawText',
        // documentDuplicates: [], // data[3]
        // documentFiles: [],
        // documentKind: [], // data[8]
        documentOriginalID: data[0],
        documentPublicationDate,
        // documentPublisher: data[16],
        // documentRecipient: data[15],
        // documentSource: data[14],
        // documentSubject: data[6] || '',
        documentTitle: data[11] || '',
        id: crypto.randomBytes(10).toString('hex'),
        sessionNumber: data[2] || -1
    };
}

function EventData(data) {
    return {
        _typeName: 'Event',
        createdAt: new Date(),
        eventDescription: data[6],
        eventEndDate: data[4],
        // eventID: data[1],
        eventStartDate: data[3],
        eventTimeUnit: 'Day',
        eventTitle: data[5],
        id: crypto.randomBytes(10).toString('hex')
    };
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

function readSheet(sheetPath) {
    const workbook = new Excel.Workbook();
    const entitiesCollection = [];

    workbook.xlsx.readFile(sheetPath).then(book => {
        const worksheet = workbook.getWorksheet(1);
        const worksheetRows = [];
        const startRow = 9;
        // const endRow = worksheet.rowCount;
        const endRow = 12;

        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (
                rowNumber > startRow + 1 &&
                rowNumber < endRow &&
                row.getCell(1).value
            ) {
                const rowData = [];
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowData.push(cell.value);
                });

                let documentData;
                if (worksheetType === 'documents') {
                    documentData = DocumentData(rowData);
                } else {
                    documentData = EventData(rowData);
                }
                const entities = getEntities(documentData);

                worksheetRows.push(
                    // Promise.all([entities, sentiment]).then(result => {
                    Promise.all([entities]).then(result => {
                        const mentionedEntities = handleEntities(
                            documentData.id,
                            result[0].annotations
                        );
                        entitiesCollection.push(mentionedEntities);

                        // documentData.sentiment = result[1].sentiment.score;

                        return documentData;
                    })
                );
            }
        });

        Promise.all(worksheetRows).then(results => {
            const mergedEntities = [].concat.apply([], entitiesCollection);
            const filteredEntities = mergedEntities.filter(entity => {
                if (entity) {
                    entity['_typeName'] = capitalizeFirstLetter(
                        entity['_typeName']
                    );
                }
                return entity;
            });

            console.log(filteredEntities);

            fs.writeFile(
                `./json/${worksheetType}-${worksheetNumber}-entities.json`,
                JSON.stringify(filteredEntities),
                'utf8',
                () => {
                    console.log('Done!');
                }
            );
        });
    });
}

readSheet(pathToSheet);
