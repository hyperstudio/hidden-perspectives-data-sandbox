const FILE_PATHS = {
	RAW_KINDS: './data/json/kind/tagsKind.json',
	RAW_CLASSIFICATIONS: './data/json/kind/classificationTags.json',
	RAW_CLUSTERED_STAKEHOLDERS: './data/json/stakeholder/clusteredDocumentStakeholders.json',
	RAW_ENTITIES: './data/json/entities/extractedEntities.json',
	RAW_WORKBOOKS_DIRECTORY_PATH: './data/sheets/',
	ORIGINAL_DOCUMENT_DIRECTORY_PATH: './data/original_documents/',
	RAW_TEXT_FILES_DIRECTORY_PATH: './data/text_files/',
	DOCUMENTS_DATA_PATH: './data/json/documents/documentsWithEntitiesAndTextFiles.json',
	EVENTS_DATA_PATH: './data/json/events/eventsWithEntitiesAndTextFiles.json',
	FILE_OBJECTS_DATA_PATH: './data/json/files/fileObjects.json',
	LOCATIONS_DATA_PATH: './data/json/locations/locations.json',
	GRAPHCOOL_NODES_PATH: './graphcoolData/nodes/',
	GRAPHCOOL_RELATIONS_PATH: './graphcoolData/relations/',
	GRAPHCOOL_BRIEFINGBOOK_NODES: './graphcoolData/nodes/briefingBookNodes.json',
};

const ERROR_TYPES = {
	NO_DANDELION_UNITS_LEFT: 'NO_DANDELION_UNITS_LEFT',
	INVALID_CHARACTERS_IN_DANDELION_REQUEST: 'INVALID_CHARACTERS_IN_DANDELION_REQUEST',
	NO_ENTITY_LEFT_TO_QUERY: 'NO_ENTITY_LEFT_TO_QUERY',
};

module.exports = {
	FILE_PATHS,
	ERROR_TYPES,
};
