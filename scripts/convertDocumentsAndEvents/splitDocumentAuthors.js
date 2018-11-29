function splitDocumentAuthors(authorString) {
	const authors = {
		separatedAuthorsComma: authorString.split(', '),
		separatedAuthorsAnd: authorString.split(' and '),
	};

	const { separatedAuthorsComma, separatedAuthorsAnd } = authors;

	let separatedAuthors;
	if (separatedAuthorsComma.length > 1) {
		separatedAuthors = separatedAuthorsComma;
	} else if (separatedAuthorsAnd.length > 1) {
		separatedAuthors = separatedAuthorsAnd;
	}

	const documentAuthor = separatedAuthors || authorString;
	return documentAuthor;
}

module.exports = splitDocumentAuthors;
