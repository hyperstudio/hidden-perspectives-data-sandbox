const fs = require('fs');
const Excel = require('exceljs');
const unirest = require('unirest');
const chrono = require('chrono-node');
const crypto = require('crypto');

const worksheetType = 'events'; // can be 'events' or 'documents'
const worksheetNumber = '04';

// Path to Briefing Book Worksheet
const filename = `briefing-book_${worksheetType}--${worksheetNumber}`;
const pathToSheet = `./sheets/${filename}.xlsx`;

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
        bb: worksheetNumber,
        originalID: data[1],
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

function readSheet(sheetPath) {
    const workbook = new Excel.Workbook();

    workbook.xlsx.readFile(sheetPath).then(book => {
        const worksheet = workbook.getWorksheet(1);
        const worksheetRows = [];
        const startRow = 0;
        // const endRow = 2;
        const endRow = worksheet.rowCount;

        // Iterate over all rows (including empty rows) in a worksheet
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            // first row is the table header

            if (
                rowNumber > startRow + 1 &&
                rowNumber < endRow &&
                row.getCell(1).value
            ) {
                const rowData = [];

                console.log(rowNumber);

                // Iterate over all cells in a row (including empty cells)
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowData.push(cell.value);
                });

                let documentData;
                if (worksheetType === 'documents') {
                    documentData = DocumentData(rowData);
                } else {
                    documentData = EventData(rowData);
                }

                worksheetRows.push(documentData);
            }
        });

        // Promise.all(worksheetRows).then(result => console.log(result));

        fs.writeFile(
            `./json/${filename}--b.json`,
            JSON.stringify(worksheetRows),
            'utf8',
            () => {
                console.log('Done!');
            }
        );
    });
}

readSheet(pathToSheet);
