require('dotenv').config();

// Util scripts
const parseDates = require('../utils/parseDates');
const abortWithError = require('../utils/abortWithError');
const logger = require('../utils/logger');

// Data handling scripts
const convertExcelToJSON = require('../utils/convertExcelToJSON');
const extractAndAddTranscripts = require('./extractAndAddTranscripts');
const extractAndSaveOriginals = require('./extractAndSaveOriginals');
const saveDocumentsAndEvents = require('./saveDocumentsAndEvents');
const extractAndSaveKinds = require('./extractAndSaveKinds');
const extractAndSaveClassifications = require('./extractAndSaveClassifications');
const extractAndSaveStakeholders = require('./extractAndSaveStakeholders');
const extractAndSaveLocations = require('./extractAndSaveLocations');
const extractAndSaveEntities = require('./extractAndSaveEntities');

convertExcelToJSON(['documents', 'events'])
	.then(logger.logDataStats)
	.then(parseDates)
	.then(extractAndSaveKinds)
	.then(extractAndSaveClassifications)
	.then(extractAndSaveStakeholders)
	.then(extractAndSaveEntities({ skipRequests: true }))
	.then(extractAndSaveOriginals)
	.then(extractAndAddTranscripts)
	.then(saveDocumentsAndEvents)
	.then(extractAndSaveLocations)
	.then(logger.logSuccessMessage)
	.catch(abortWithError);
