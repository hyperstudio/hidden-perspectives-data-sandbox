const fs = require('fs');
const path = require('path');

const documentAuthors = require('./json/documents-authors.json');
const documentAll = require('./json/briefing-book_documents--all.json');

const folderPath = './json/authorEntities/';

const getDocumentByID = originalID =>
    documentAll.find(document => document.documentOriginalID === originalID);

const allFiles = [];
fs.readdirSync(folderPath).forEach(file => {
    const fileContent = fs.readFileSync(path.join(folderPath, file));
    const fileJSON = JSON.parse(fileContent);

    allFiles.push(fileJSON);
});

const mergedFiles = [].concat.apply([], allFiles);

const authorRelations = [];

mergedFiles.forEach((authors, index) => {
    // if (index > 2) {
    //     return;
    // }

    const documentsMentionedIn = documentAuthors[index].documentAuthor;
    // console.log(documentsMentionedIn);

    authors.filteredEntities.forEach(author => {
        // console.log(author);
        documentsMentionedIn.forEach((documentUir, j) => {
            console.log(documentAuthors[index].id);
            const relation = [
                {
                    _typeName: 'Stakeholder',
                    id: documentAuthors[index].id,
                    fieldName: 'documents'
                },
                {
                    _typeName: 'Document',
                    id: getDocumentByID(documentUir).id,
                    fieldName: 'documentAuthors'
                }
            ];

            authorRelations.push(relation);
        });
    });
});

fs.writeFile(
    `./json/author-relations.json`,
    JSON.stringify(authorRelations),
    'utf8',
    () => {
        console.log('Done!');
    }
);
