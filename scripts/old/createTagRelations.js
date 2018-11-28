const fs = require('fs');

const documents = require('./json/briefing-book_documents--all.json');
const classifications = require('./json/documents-classification.json');
const kinds = require('./json/documents-kind.json');

const getDocumentByID = originalID =>
    documents.find(document => document.documentOriginalID === originalID);

const kindsRelations = kinds.map((tag, index) => {
    const tagName = tag.name;
    const typeName = tag['_typeName'];
    const documentURIs = tag.documentWithTag;
    const tagID = tag.id;

    const relationTag = {
        _typeName: typeName,
        id: tagID,
        fieldName: 'documentsWithKind'
    };

    const relation = documentURIs.map(uri => {
        const relationDocument = {
            _typeName: 'Document',
            id: getDocumentByID(uri).id,
            fieldName: 'documentKind'
        };

        return [relationTag, relationDocument];
    });

    return relation;
});
const classificationRelations = classifications.map((tag, index) => {
    const tagName = tag.name;
    const typeName = tag['_typeName'];
    const documentURIs = tag.documentWithTag;
    const tagID = tag.id;

    const relationTag = {
        _typeName: typeName,
        id: tagID,
        fieldName: 'documentsWithClassification'
    };

    const relation = documentURIs.map(uri => {
        const relationDocument = {
            _typeName: 'Document',
            id: getDocumentByID(uri).id,
            fieldName: 'documentClassification'
        };

        return [relationTag, relationDocument];
    });

    return relation;
});

const mergedKindRelations = [].concat.apply([], kindsRelations);
const mergedClassificationRelations = [].concat.apply(
    [],
    classificationRelations
);

fs.writeFile(
    `./json/relations_kind.json`,
    JSON.stringify(mergedKindRelations),
    'utf8',
    () => {
        console.log('Done!');
    }
);
fs.writeFile(
    `./json/relations_classification.json`,
    JSON.stringify(mergedClassificationRelations),
    'utf8',
    () => {
        console.log('Done!');
    }
);
