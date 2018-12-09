const saveGraphcoolData = require('../utils/saveGraphcoolData');
const getRandomID = require('../utils/getRandomID');
const omitNullValues = require('../utils/omitNullValues');
const filterArrayForObjectsWithUniqueKey = require('../utils/filterArrayForObjectsWithUniqueKey');

const entityIsLocation = ({ types }) => Boolean(
	types && types.length
	&& types.includes('http://dbpedia.org/ontology/Location'),
);

const entityIsStakeholder = ({ relevantType }) => !!relevantType;

const entityIsTag = (entity) => !entityIsLocation(entity) && !entityIsStakeholder(entity);

const last = (array) => array[array.length - 1];

const formatTagType = (types) => (
	!types || types.length === 0 ? null : last(types)
		.replace('http://dbpedia.org/ontology/', '')
);

const createGraphcoolTagNode = ({
	abstract: description,
	title: name,
	uri: tagWikipediaUri,
	types,
}) => omitNullValues({
	_typeName: 'Tag',
	id: getRandomID(),
	description,
	name: name || 'Unknown',
	tagWikipediaUri,
	type: formatTagType(types),
});

const createGraphcoolTagRelations = ({ fileNames }, { id }) => fileNames.map(({ fileName }) => {
	const isDocument = fileName.startsWith('uir');

	const tagRelation = {
		_typeName: 'Tag',
		id,
		fieldName: isDocument ? 'documentsWithTag' : 'eventsWithTag',
	};
	const sourceRelation = {
		_typeName: isDocument ? 'Document' : 'Event',
		id: fileName,
		fieldName: isDocument ? 'documentTags' : 'eventTags',
	};

	return [tagRelation, sourceRelation];
});

const createGraphcoolTags = (data) => {
	const tagEntities = data.entities.filter(entityIsTag);
	const tags = filterArrayForObjectsWithUniqueKey(tagEntities, 'title');
	const { nodes, relations } = tags
		.reduce((acc, entity) => {
			const node = createGraphcoolTagNode(entity);
			const fileNameRelations = createGraphcoolTagRelations(entity, node);
			return {
				nodes: acc.nodes.concat(node),
				relations: [...acc.relations, ...fileNameRelations],
			};
		}, { nodes: [], relations: [] });

	return Promise.all([
		saveGraphcoolData({
			data: nodes,
			type: 'nodes',
			fileName: 'tagNodes.json',
		}),
		saveGraphcoolData({
			data: relations,
			type: 'relations',
			fileName: 'tagRelations.json',
		}),
	])
		.then(() => data)
		.catch((err) => {
			throw new Error(err);
		});
};

module.exports = createGraphcoolTags;
