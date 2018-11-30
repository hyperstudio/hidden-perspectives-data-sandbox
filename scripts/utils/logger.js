const SOLID_LINE = 	'————————————————————————————————————————————————————————';
const DOTTED_LINE = '・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・';

const logTitle = (title) => console.log(`

${title.toUpperCase()}
${SOLID_LINE}
`);

const logKeyValuePair = ({ key, value, origin }) => console.log(`
${DOTTED_LINE}
${key.toUpperCase()}: ${value} ${origin ? `from ${origin}` : ''}
`);

const logEnd = () => console.log(`
${SOLID_LINE}
`);

module.exports = {
	logTitle,
	logKeyValuePair,
	logEnd,
};
