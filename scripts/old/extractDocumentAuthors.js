const fs = require('fs');
const Excel = require('exceljs');
const crypto = require('crypto');

const documents = require('./json/briefing-book_documents--all.json');

function getAuthorObject(documentIDs, authorName) {
	const tag = {
		_typeName: 'Author',
		id: crypto.randomBytes(10).toString('hex'),
		documentAuthor: documentIDs,
		name: authorName,
	};
	return tag;
}

const documentAuthors = {};
const sheetPromises = [];

const formatName = (authorName) => {
	const trimmedName = authorName.trim();

	return trimmedName.toLowerCase();
};

function readSheet(sheetPath) {
	const workbook = new Excel.Workbook();
	const sheetPromise = new Promise((resolve) => {
		workbook.xlsx.readFile(sheetPath).then((book) => {
			const worksheet = workbook.getWorksheet(1);
			const startRow = 0;
			const endRow = worksheet.rowCount;

			// Iterate over all rows (including empty rows) in a worksheet
			worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
				// first row is the table header
				if (
					rowNumber > startRow + 1
                    && rowNumber < endRow
                    && row.getCell(5).value
				) {
					const filename = row.getCell(1).value;
					const authorCell = formatName(row.getCell(5).value);

					const splittedAuthors = authorCell.split(', ');

					splittedAuthors.forEach((author) => {
						const hasAuthor = documentAuthors.hasOwnProperty(
							author,
						);
						if (!hasAuthor) {
							documentAuthors[author] = [filename];
						} else {
							documentAuthors[author].push(filename);
						}
					});
				}
			});
			resolve();
		});
	});

	sheetPromises.push(sheetPromise);
}

const worksheetType = 'documents';

const worksheetNumbers = [1, 2, 3, 4];
worksheetNumbers.forEach((number) => {
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
			console.log(`Extracted ${filename}.`);
		},
	);
}

Promise.all(sheetPromises).then(() => {
	const authorsData = Object.keys(documentAuthors).map((key, index) => {
		const documentIDs = documentAuthors[key];
		return getAuthorObject(documentIDs, key);
	});

	writeFile('authors', authorsData);
});
