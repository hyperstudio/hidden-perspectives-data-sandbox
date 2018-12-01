const fetch = require('node-fetch');

function importGraphcoolData({ valueType, values }) {
	return new Promise((resolve, reject) => {
		const graphcoolData = {
			valueType,
			values,
		};

		const headers = {
			'Content-Type': 'application/json',
			Authorization: process.env.DANDELION_AUTHORIZATION_BEARER,
		};
		const url = 'https://api.graph.cool/simple/v1/hiddenperspectives/import';

		const options = {
			method: 'POST',
			headers,
			body: JSON.stringify(graphcoolData),
		};

		fetch(url, options)
			.then((response) => response.json())
			.then(resolve)
			.catch(reject);
	});
}

module.exports = importGraphcoolData;
