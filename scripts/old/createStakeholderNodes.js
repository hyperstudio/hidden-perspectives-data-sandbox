const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const documentAll = require('./json/briefing-book_documents--all.json');
const authorNodes = require('./json/author-nodes.json');

const folderPath = './json/documentEntities/';

const getDocumentByID = originalID =>
    documentAll.find(document => document.documentOriginalID === originalID);

const allFiles = [];
fs.readdirSync(folderPath).forEach(file => {
    const fileContent = fs.readFileSync(path.join(folderPath, file));
    const fileJSON = JSON.parse(fileContent);

    allFiles.push(fileJSON);
});

const mergedFiles = [].concat.apply([], allFiles);
const uniqueStakeholder = [];
mergedFiles.forEach((stakeholder, index) => {
    const { filteredEntities } = stakeholder;
    filteredEntities.forEach((entity, entityIndex) => {
        console.log(entity);

        const isDuplicate = uniqueStakeholder.findIndex(element => {
            return entity.wikipediaUri === element.wikipediaUri;
        });
        if (isDuplicate >= 0) {
            if (Array.isArray(uniqueStakeholder[isDuplicate].mentionedIn)) {
                uniqueStakeholder[isDuplicate].mentionedIn.push(
                    entity.mentionedIn
                );
            } else {
                uniqueStakeholder[isDuplicate].mentionedIn = [
                    uniqueStakeholder[isDuplicate].mentionedIn,
                    entity.mentionedIn
                ];
            }
        } else {
            entity.mentionedIn = [entity.mentionedIn];
            uniqueStakeholder.push(entity);
        }
    });
});

// fs.writeFile(
//     `./json/test.json`,
//     JSON.stringify(uniqueStakeholder),
//     'utf8',
//     () => {
//         console.log('Done!');
//     }
// );

// console.log(uniqueStakeholder);

const entityNodes = [];
const entityRelations = [];

uniqueStakeholder.forEach((stakeholder, index) => {
    // if (true) {
    //     return;
    // }
    stakeholder.mentionedIn.forEach(documentID => {
        const type = stakeholder['_typeName'];
        const mentionedIn = getDocumentByID(documentID);
        let entityNode;
        let entityRelation;
        let documentRelation;
        if (type === 'location') {
            const id = crypto.randomBytes(10).toString('hex');
            const typeName = 'Location';
            entityRelation = {
                _typeName: typeName,
                id,
                fieldName: 'documentsMentionedIn'
            };
            documentRelation = {
                _typeName: 'Document',
                id: mentionedIn.id,
                fieldName: 'mentionedLocations'
            };

            entityNode = {
                _typeName: 'Location',
                createdAt: new Date(),
                id,
                locationName: stakeholder.locationName,
                locationWikipediaUri: stakeholder.wikipediaUri
            };

            entityRelations.push([entityRelation, documentRelation]);
            entityNodes.push(entityNode);
        } else if (type === 'person' || type === 'organisation') {
            const id = crypto.randomBytes(10).toString('hex');
            const typeName = 'Stakeholder';
            entityRelation = {
                _typeName: typeName,
                id,
                fieldName: 'documentsMentionedIn'
            };
            documentRelation = {
                _typeName: 'Document',
                id: mentionedIn.id,
                fieldName: 'mentionedStakeholders'
            };

            entityNode = {
                _typeName: 'Stakeholder',
                createdAt: new Date(),
                id,
                isStakeholderInstitution: true,
                stakeholderFullName: stakeholder.stakeholderFullName,
                stakeholderWikipediaUri: stakeholder.wikipediaUri
            };

            entityRelations.push([entityRelation, documentRelation]);
            entityNodes.push(entityNode);
        } else if (type === 'event') {
            const id = crypto.randomBytes(10).toString('hex');
            const typeName = 'Event';
            entityRelation = {
                _typeName: typeName,
                id,
                fieldName: 'documentsMentionedIn'
            };
            documentRelation = {
                _typeName: 'Document',
                id: mentionedIn.id,
                fieldName: 'mentionedEvents'
            };

            entityNode = {
                _typeName: 'Event',
                createdAt: new Date(),
                id,
                eventTitle: stakeholder.name,
                wikipediaUri: stakeholder.wikipediaUri
            };
        }
    });
});

// console.log(authorNodes);

// fs.writeFile(
//     `./json/stakeholder-relations.json`,
//     JSON.stringify(entityRelations),
//     'utf8',
//     () => {
//         console.log('Done!');
//     }
// );
// fs.writeFile(
//     `./json/stakeholder-nodes.json`,
//     JSON.stringify(entityNodes),
//     'utf8',
//     () => {
//         console.log('Done!');
//     }
// );
