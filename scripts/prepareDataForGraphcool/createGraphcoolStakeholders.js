const saveGraphcoolData = require('../utils/saveGraphcoolData');
const getRandomID = require('../utils/getRandomID');

const isPerson = (type) => type === 'person';
const isInstitution = (type) => type === 'organisation';

const isPersonOrInstitution = ({ relevantType }) => relevantType && (
	isInstitution(relevantType) || isPerson(relevantType)
);

const createGraphcoolStakeholderNode = ({
	title,
	uri,
	abstract,
	relevantType,
}) => ({
	_typeName: 'Stakeholder',
	id: getRandomID(),
	stakeholderFullName: title,
	stakeholderDescription: abstract,
	isInstitution: relevantType === 'organisation',
	...(uri ? { uri } : {}),
});

const isDocument = (fileName) => fileName.startsWith('uir');

const inRange = (val, min, max) => val >= min && val <= max;

const getRelationFieldName = (fileName, entity, data) => {
	const { start } = entity;
	if (isDocument(fileName)) {
		const document = data.documents.find((doc) => doc.fileName === fileName);
		const { author = '' } = document || {};

		if (!document) {
			console.log(fileName);
		}

		const isAuthor = inRange(start, 0, author.length);
		const isMentionedIn = inRange(start, author.length, entity.orinalString);

		if (isAuthor) return { stakeholder: 'documents', node: 'documentAuthors' };
		if (isMentionedIn) return { stakeholder: 'documentsMentionedIn', node: 'mentionedStakholders' };
	}
	return { stakeholder: 'eventsInvolvedIn', node: 'eventStakeholders' };
};

const createGraphcoolStakeholderRelations = (entity, { id }, data) => entity.fileNames
	.map(({ fileName }) => {
		const fieldName = getRelationFieldName(fileName, entity, data);
		const stakeholderRelation = {
			_typeName: 'Stakeholder',
			fieldName: fieldName.stakeholder,
			id,
		};
		const documentOrEventRelation = {
			_typeName: isDocument ? 'Document' : 'Event',
			id: fileName,
			fieldName: fieldName.node,
		};
		return [stakeholderRelation, documentOrEventRelation];
	});

const createGraphcoolStakeholders = (data) => {
	const { nodes, relations } = data.entities
		.filter(isPersonOrInstitution)
		.reduce((acc, entity) => {
			const node = createGraphcoolStakeholderNode(entity);
			const fileNameRelations = createGraphcoolStakeholderRelations(entity, node, data);
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

module.exports = createGraphcoolStakeholders;
