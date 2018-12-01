const saveGraphcoolData = require('../utils/saveGraphcoolData');
const getRandomID = require('../utils/getRandomID');

const isPerson = (type) => type === 'person';
const isInstitution = (type) => type === 'organisation';

const isPersonOrInstitution = ({ relevantType }) => relevantType && (
	isInstitution(relevantType) || isPerson(relevantType)
);

const createStakeholdersNode = ({
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

const getStakeholdersRelationCreator => (documents) => (entity) => {
	return {

	};
};

const createGraphcoolStackeholders = (data) => Promise.all([
	saveGraphcoolData({
		data: data.entities
			.filter(isPersonOrInstitution)
			.map(createStakeholdersNode),
		type: 'nodes',
		fileName: 'stakeholdersNodes.json',
	}),
	saveGraphcoolData({
		data: data.entities.map(getStakeholdersRelationCreator(data.documents)),
		type: 'relations',
		fileName: 'stakeholdersRelations.json',
	}),
]).then(() => Promise.resolve(data));

module.exports = createGraphcoolStackeholders;
