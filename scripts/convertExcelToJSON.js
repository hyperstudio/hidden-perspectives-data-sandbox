const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');

function DocumentData(data) {
    return {
        fileName: data[0] || null,
        bbPage: data[1] || null,
        sessionNumber: data[2] || null,
        duplicateOf: data[3] || null,
        author: data[4] || null,
        contributor: data[5] || null,
        subject: data[6] || null,
        kindId: data[7] || null,
        kind: data[8] || null,
        classificationId: data[9] || null,
        classification: data[10] || null,
        title: data[11] || null,
        date: data[12] || null,
        summary: data[13] || null,
        source: data[14] || null,
        recipient: data[15] || null,
        publisher: data[16] || null,
        publicationDate: data[17] || null,
        bibliographicInfo: data[18] || null,
        dnsaCitation: data[20] || null,
        dnsaCollection: data[21] || null,
        dnsaItemNumber: data[22] || null,
        dnsaOrigin: data[23] || null,
        dnsaFrom: data[24] || null,
        dnsaTo: data[25] || null,
        dnsaIndividual: data[26] || null,
        dnsaSubject: data[27] || null,
        dnsaAbstract: data[28] || null,
        dnsaUrl: data[29] || null
    };
}

function EventData(data) {
    return {
        fileName: `${data[0]}-${data[1]}`,
        bb: data[0] || null,
        id: data[1] || null,
        originalDate: data[2] || null,
        startDate: data[3] || null,
        endDate: data[5] || null,
        title: data[6] || null,
        description: data[7] || null,
        location: data[8] || null,
        reference: data[9] || null,
        flag: data[10] || null,
        notes: data[11] || null
    };
}

const readSheet = (sheetPath, workbookType, cb) => {
    const workbook = new Excel.Workbook();

    const worksheetRows = [];
    workbook.xlsx.readFile(sheetPath).then(book => {
        const worksheet = workbook.getWorksheet(1);

        // Iterate over all rows (including empty rows) in a worksheet
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            // first row is the table header
            if (rowNumber > 1 && row.getCell(1).value) {
                const rowData = [];

                // Iterate over all cells in a row (including empty cells)
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowData.push(cell.value);
                });

                let documentData;
                if (workbookType === 'documents') {
                    documentData = DocumentData(rowData);
                } else if (workbookType === 'events') {
                    documentData = EventData(rowData);
                }

                worksheetRows.push(documentData);
            }
        });

        cb(worksheetRows);
    });
};

function convertExcelToJSON(workbookTypes) {
    const excelData = workbookTypes.map(workbookType => {
        const directoryPath = path.resolve(
            __dirname,
            `../../hidden-perspective-data/data/sheets/${workbookType}/`
        );

        console.log('directoryPath');
        console.log(directoryPath);

        const workbooksAll = fs.readdirSync(directoryPath).map(file => {
            const filePath = path.join(directoryPath, file);
            return filePath;
        });

        const worksheetPromises = workbooksAll.map(workbookPath => {
            const worksheetPromise = new Promise(resolve => {
                readSheet(workbookPath, workbookType, data => {
                    resolve(data);
                });
            });

            return worksheetPromise;
        });

        return worksheetPromises;
    });

    return Promise.all(
        excelData.map(excelPromise => {
            return Promise.all(excelPromise);
        })
    );
}

module.exports = convertExcelToJSON;
