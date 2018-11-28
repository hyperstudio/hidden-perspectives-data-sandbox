const fs = require('fs');
const Excel = require('exceljs');
const crypto = require('crypto');

function getTag(typeName, documentIDs, tagName) {
    const tag = {
        _typeName: typeName,
        id: crypto.randomBytes(10).toString('hex'),
        documentWithTag: documentIDs,
        name: tagName
    };
    return tag;
}

const documentClassifications = {};
const documentKinds = {};
const sheetPromises = [];

function readSheet(sheetPath) {
    const workbook = new Excel.Workbook();
    const sheetPromise = new Promise(resolve => {
        workbook.xlsx.readFile(sheetPath).then(book => {
            const worksheet = workbook.getWorksheet(1);
            const startRow = 0;
            const endRow = worksheet.rowCount;

            // Iterate over all rows (including empty rows) in a worksheet
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                // first row is the table header
                if (
                    rowNumber > startRow + 1 &&
                    rowNumber < endRow &&
                    row.getCell(1).value
                ) {
                    const filename = row.getCell(1).value;
                    const classification = row.getCell(11).value;
                    const kind = row.getCell(9).value;

                    const hasClassification = documentClassifications.hasOwnProperty(
                        classification
                    );
                    if (!hasClassification) {
                        documentClassifications[classification] = [filename];
                    } else {
                        documentClassifications[classification].push(filename);
                    }

                    const hasKind = documentKinds.hasOwnProperty(kind);
                    if (!hasKind) {
                        documentKinds[kind] = [filename];
                    } else {
                        documentKinds[kind].push(filename);
                    }
                }
            });
            resolve();
        });
    });

    sheetPromises.push(sheetPromise);
}

const worksheetType = 'documents';

const worksheetNumbers = [1, 2, 3, 4];
worksheetNumbers.forEach(number => {
    // Path to Briefing Book Worksheet
    const filename = `briefing-book_${worksheetType}--0${number}`;
    const pathToSheet = `./sheets/${filename}.xlsx`;
    readSheet(pathToSheet);
});

function writeFile(filename, data) {
    fs.writeFile(
        `./json/${worksheetType}-${filename}.json`,
        JSON.stringify(data),
        'utf8',
        () => {
            console.log(`Created ${filename} tag.`);
        }
    );
}

Promise.all(sheetPromises).then(() => {
    const classificationsData = Object.keys(documentClassifications).map(
        (key, index) => {
            const documentIDs = documentClassifications[key];
            return getTag('Classification', documentIDs, key);
        }
    );
    const kindsData = Object.keys(documentKinds).map((key, index) => {
        const documentIDs = documentKinds[key];
        return getTag('Kind', documentIDs, key);
    });
    // console.log(classificationsData);
    // console.log(kindsData);
    writeFile('classification', classificationsData);
    writeFile('kind', kindsData);
});
