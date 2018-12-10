const getRandomId = require('../utils/getRandomID');

const hasTag = (key, val) => (obj) => (obj[key] || '').trim().toLowerCase() === val.trim().toLowerCase();
const prop = (key) => (obj) => obj[key];
const existsAndIsUnique = (val, idx, arr) => val && arr.indexOf(val) === idx;

const createTagByName = (name, tagType, documents) => ({
	id: getRandomId(),
	documentsWithTag: documents
		.filter(hasTag(tagType, name))
		.map(prop('fileName')),
	name: name.trim(),
});

const createTagForProp = (key, documents) => (name) => createTagByName(name, key, documents);

const createJSONFromKey = (tagType, { documents }) => documents
	.map(prop(tagType))
	.filter(existsAndIsUnique)
	.map(createTagForProp(tagType, documents));

module.exports = createJSONFromKey;

