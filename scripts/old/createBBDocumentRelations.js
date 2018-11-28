const fs = require('fs');

const document01 = require('./json/briefing-book_documents--01.json');
const document02 = require('./json/briefing-book_documents--02.json');
const document03 = require('./json/briefing-book_documents--03.json');
const document04 = require('./json/briefing-book_documents--04.json');
const documentAll = require('./json/briefing-book_documents--all.json');

const briefingBooks = [document01, document02, document03, document04];
const briefingBookIDs = [
    'cjod5kxmoi2cp0167x0mjjv6l',
    'cjod5lfuai2cz0167nl493oj0',
    'cjod5llt8i19h0183mrhjcld1',
    'cjod5lrfgi2d60167xx65fjza'
];

const getDocumentByID = originalID =>
    documentAll.find(document => document.documentOriginalID === originalID);

const relations = briefingBooks.map((documents, index) => {
    const relationBB = {
        _typeName: 'BriefingBook',
        id: briefingBookIDs[index],
        fieldName: 'mentionedDocuments'
    };
    return documents.map(document => {
        const relationDocument = {
            _typeName: 'Document',
            id: getDocumentByID(document.documentOriginalID).id,
            fieldName: 'briefingBooksMentionedIn'
        };

        return [relationBB, relationDocument];
    });
});

const mergedRelations = [].concat.apply([], relations);

fs.writeFile(
    `./json/relations_bb-documents.json`,
    JSON.stringify(mergedRelations),
    'utf8',
    () => {
        console.log('Done!');
    }
);
