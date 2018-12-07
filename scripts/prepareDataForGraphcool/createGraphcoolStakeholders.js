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
	const document = data.documents.find((doc) => doc.fileName === fileName);

	if (document) {
		const isAuthor = document.author && inRange(start, 0, document.author.length);

		if (isAuthor) return { stakeholder: 'documents', node: 'documentAuthors' };
		return { stakeholder: 'documentsMentionedIn', node: 'mentionedStakholders' };
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
			fileName: 'stakeholderNodes.json',
		}),
		saveGraphcoolData({
			data: relations,
			type: 'relations',
			fileName: 'stakeholderRelations.json',
		}),
	])
		.then(() => data)
		.catch((err) => {
			throw new Error(err);
		});
};

module.exports = createGraphcoolStakeholders;
