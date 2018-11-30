// Util scripts
const abortWithError = require('../utils/abortWithError');
const { getPathByConstantName } = require('../utils/pathUtil');

getRelevantData()
	.then(clusterEntities)
	.then(splitEntitiesInCategories)
	// Create Graphcool NODES
	.then(createGraphcoolBriefingBook)
	.then(createGraphcoolClassification)
	.then(createGraphcoolDocument)
	.then(createGraphcoolEvent)
	.then(createGraphcoolKind)
	.then(createGraphcoolLocation)
	.then(createGraphcoolStackeholder)
	.then(createGraphcoolFile) // System?
	// Create Graphcool RELATIONS
	.then(createGraphcoolRelations)
