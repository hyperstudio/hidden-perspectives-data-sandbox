const fs = require('fs');
const Excel = require('exceljs');

const documentAll = require('./json/briefing-book_documents--all.json');

const getDocumentByID = (originalID) => documentAll.find((document) => document.documentOriginalID === originalID);

// const relations = briefingBooks.map((documents, index) => {
//     const relationBB = {
//         _typeName: 'Document',
//         id: briefingBookIDs[index],
//         fieldName: 'mentionedDocuments'
//     };
//     return documents.map(document => {
//         const relationDocument = {
//             _typeName: 'Document',
//             id: getDocumentByID(document.documentOriginalID).id,
//             fieldName: 'documentDuplicates'
//         };

//         return [relationBB, relationDocument];
//     });
// });
// const mergedRelations = [].concat.apply([], relations);

const promises = [];
const duplicates = [];

function readSheet(sheetPath) {
	const workbook = new Excel.Workbook();
	const promise = new Promise((resolves) => {
		workbook.xlsx.readFile(sheetPath).then((book) => {
			const worksheet = workbook.getWorksheet(1);

			// Iterate over all rows (including empty rows) in a worksheet
			worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
				const duplicateID = row.getCell(4).value;
				const documentID = row.getCell(1).value;

				if (
					rowNumber > 1
                    && duplicateID
                    && getDocumentByID(duplicateID)
				) {
					const relationDocumentA = {
						_typeName: 'Document',
						id: getDocumentByID(duplicateID).id,
						fieldName: 'documentDuplicates',
					};
					const relationDocumentD = {
						_typeName: 'Document',
						id: getDocumentByID(documentID).id,
						fieldName: 'documentDuplicates',
					};
					duplicates.push([relationDocumentA, relationDocumentD]);
				}
			});
			resolves();
		});
	});
	promises.push(promise);
}

const briefingBooks = [1, 2, 3, 4];
briefingBooks.forEach((bookNumber) => {
	const filename = `briefing-book_documents--0${bookNumber}`;
	const pathToSheet = `./sheets/${filename}.xlsx`;
	readSheet(pathToSheet);
});

Promise.all(promises).then((result) => {
	console.log(duplicates);

	fs.writeFile(
		'./json/relations_document-duplicates.json',
		JSON.stringify(duplicates),
		'utf8',
		() => {
			console.log('Done!');
		},
	);
});
