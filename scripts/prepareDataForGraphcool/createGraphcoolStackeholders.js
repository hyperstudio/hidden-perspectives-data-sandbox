const saveGraphcoolData = require('../utils/saveGraphcoolData');

const createStakeholdersNode = (entity) => {
    console.log(entity);
    return entity;
};

const createStakeholdersRelation = () => { };

const createGraphcoolStackeholders = (data) => Promise.all([
    saveGraphcoolData({
        data: data.stakeholders.map(createStakeholdersNode),
        type: 'nodes',
        fileName: 'stakeholdersNodes.json',
    }),
    saveGraphcoolData({
        data: data.stakeholders.map(createStakeholdersRelation),
        type: 'relations',
        fileName: 'stakeholdersRelations.json',
    }),
]).then(() => Promise.resolve(data));

module.exports = createGraphcoolStackeholders;
