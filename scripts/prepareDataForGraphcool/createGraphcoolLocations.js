const getRandomID = require('../utils/getRandomID');
const saveGraphcoolData = require('../utils/saveGraphcoolData');
const omitNullValues = require('../utils/omitNullValues');
const filterArrayForObjectsWithUniqueKey = require('../utils/filterArrayForObjectsWithUniqueKey');

const createGraphcoolLocationRelation = ({ fileName }, nodeId) => {
	const isDocument = fileName.startsWith('uir');
	const relationLocations = {
		_typeName: 'Location',
		id: nodeId,
		fieldName: isDocument ? 'documentsMentionedIn' : 'locationEvents',
	};
	const relationDocumentOrEvent = {
		_typeName: isDocument ? 'Document' : 'Event',
		id: fileName,
		fieldName: isDocument ? 'mentionedLocations' : 'eventLocations',
	};

	return [relationLocations, relationDocumentOrEvent];
};

const createGraphcoolLocationNode = ({
	uri: locationWikipediaUri,
	display_name: locationName,
	lat: locationLatitude,
	lon: locationLongitude,
	abstract: locationDescription,
	title,
}) => omitNullValues({
	_typeName: 'Location',
	id: getRandomID(),
	createdAt: new Date(),
	locationDescription,
	locationWikipediaUri,
	locationLatitude,
	locationLongitude,
	locationName: locationName || title,
});

const createGraphcoolLocations = (data) => {
	const { nodes, relations } = filterArrayForObjectsWithUniqueKey(data.locations, 'locationName')
		.reduce((acc, location) => {
			const node = createGraphcoolLocationNode(location);
			const relation = createGraphcoolLocationRelation(location, node.id);
			return {
				nodes: acc.nodes.concat(node),
				relations: [...acc.relations, relation],
			};
		}, { nodes: [], relations: [] });

	return Promise.all([
		saveGraphcoolData({
			data: nodes,
			type: 'nodes',
			fileName: 'locationNodes.json',
		}),
		saveGraphcoolData({
			data: relations,
			type: 'relations',
			fileName: 'locationRelations.json',
		}),
	])
		.then(() => Promise.resolve(data))
		.catch((err) => {
			throw new Error(err);
		});
};

module.exports = createGraphcoolLocations;
