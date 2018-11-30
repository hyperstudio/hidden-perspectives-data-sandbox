const fetch = require('node-fetch');
const FormData = require('form-data');

const uploadFile = (filename, file) => new Promise((resolve, reject) => {
	const form = new FormData();
	form.append('data', file, { filename });

	const url = `https://api.graph.cool/file/v1/${process.env.GRAPHCOOL_PROJECT_ID}`;
	fetch(url, {
		method: 'POST',
		body: form,
		headers: {
			...form.getHeaders(),
			Authorization: `Bearer ${process.env.GRAPHCOOL_AUTHORIZATION_TOKEN}`,
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
