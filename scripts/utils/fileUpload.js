const fetch = require('node-fetch');
const FormData = require('form-data');

const uploadFile = (filename, file) => new Promise((resolve, reject) => {
	const data = new FormData();
	data.append('data', file, { filename });

	const url = `https://api.graph.cool/file/v1/${process.env.GRAPHCOOL_PROJECT_ID}`;
	fetch(url, {
		method: 'POST',
		body: data,
		headers: {
			...data.getHeaders(),
			Authorization: `Bearer ${process.env.GRAPHCOOL_AUTHORIZATION_TOKEN}`,
			'Access-Control-Allow-Origin': '*',
		},
	})
		.then((response) => response.json())
		.then(resolve)
		.catch(reject);
});

const uploadFiles = (files) => Promise.all(files.map(uploadFile));

module.exports = {
	uploadFile,
	uploadFiles,
};
