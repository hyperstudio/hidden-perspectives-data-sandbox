const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');
const logger = require('../utils/logger');

const { getPathByConstantName } = require('./pathUtil');

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
		dnsaUrl: data[29] || null,
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
		notes: data[11] || null,
	};
}

const readSheet = (sheetPath, workbookType) => {
	const workbook = new Excel.Workbook();

	const worksheetRows = [];
	return workbook.xlsx.readFile(sheetPath).then(() => {
		const worksheet = workbook.getWorksheet(1);

		worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > 1 && row.getCell(1).value) {
				const rowData = [];

				row.eachCell({ includeEmpty: true }, (cell) => {
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

		return worksheetRows;
	})
		.catch((err) => Promise.reject(err));
};

function convertExcelToJSON(workbookTypes) {
	return new Promise((resolveWholeConversion) => {
		logger.logTitle('Reading and converting CSV Spreadsheets');
		const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

		const workbookPaths = workbookTypes.map((workbookType) => {
			const workbookParentPath = getPathByConstantName('RAW_WORKBOOKS_DIRECTORY_PATH');
			const directoryPath = `${workbookParentPath}/${workbookType}`;
			const workbooksAll = fs.readdirSync(directoryPath).map((file) => path
				.join(directoryPath, file));
			return {
				type: workbookType,
				paths: workbooksAll,
			};
		});

		const totalLength = workbookPaths.reduce((acc, { paths }) => (
			acc + paths.length
		), 0);
		let progressbarSteps = 0;
		progressBar.start(totalLength, 0);

		const excelDataPromises = workbookPaths
			.map(({ type, paths }) => new Promise((resolveTypeConversion) => {
				const worksheetPromises = paths.map(
					(workbookPath) => {
						progressBar.update(progressbarSteps += 1);
						return readSheet(workbookPath, type);
					},
				);

				Promise.all(worksheetPromises)
					.then((arrayOfArrayResults) => {
						const combinedWorksheets = arrayOfArrayResults
							.reduce((acc, currentWorksheet) => [...acc, ...currentWorksheet], []);
						resolveTypeConversion(combinedWorksheets);
					}).catch(console.log);
			}));

		Promise.all(excelDataPromises)
			.then(([documents, events]) => {
				logger.logEnd();
				resolveWholeConversion({ documents, events });
			})
			.catch(console.log);
	});
}

module.exports = convertExcelToJSON;
