const fetch = require('node-fetch');
const pMinDelay = require('p-min-delay');
const getPathsInDir = require('./getPathsInDir');
const { getPathByConstantName } = require('./pathUtil');
const readFile = require('../utils/readFile');

function importDataToGraphcool(graphcoolData) {
	return new Promise((resolve, reject) => {
		console.log(graphcoolData.valueType);

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.GRAPHCOOL_AUTHORIZATION_TOKEN}`,
		};
		const projectID = process.env.GRAPHCOOL_PROJECT_ID;
		const url = `https://api.graph.cool/simple/v1/${projectID}/import`;

		const options = {
			method: 'POST',
			headers,
			body: JSON.stringify(graphcoolData),
		};

		pMinDelay(fetch(url, options), 1000)
			.then((response) => response.json())
			.then((response) => {
				console.log(response);
				return response;
			})
			.then(resolve)
			.catch(reject);
	});
}

const readFileAndImportToGraphcool = (valueType) => (path) => readFile(path)
	.then(JSON.parse)
	.then((values) => ({ valueType, values }))
	.then(importDataToGraphcool)
	.then(() => {
		console.log('PATH IMPORTED TO GRAPHCOOL:', path);
	})
	.catch((err) => {
		throw new Error(err);
	});

const importGraphcoolData = () => {
	const relationsPath = getPathByConstantName('GRAPHCOOL_RELATIONS_PATH');
	const nodesPath = getPathByConstantName('GRAPHCOOL_NODES_PATH');

	return getPathsInDir(nodesPath)
		// .then((nodesPaths) => Promise.all(
		// 	nodesPaths
		// 		.map((path) => `${nodesPath}/${path}`)
		// 		.map(readFileAndImportToGraphcool('nodes')),
		// ))
		.then(() => getPathsInDir(relationsPath))
		.then((relationPaths) => Promise.all(
			relationPaths
				.map((path) => `${relationsPath}/${path}`)
				.map(readFileAndImportToGraphcool('relations')),
		))
		.catch((err) => {
			throw new Error(err);
		});
};

module.exports = importGraphcoolData;
