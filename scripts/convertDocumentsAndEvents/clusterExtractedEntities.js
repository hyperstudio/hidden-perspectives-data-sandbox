function clusterExtractedEntities(data) {
	const clusteredExtractedEntities = {};

	const addEntity = (entity, fileName) => {
		// console.log(entity);
		const { title } = entity;
		const hasEntity = !!clusteredExtractedEntities[title];
		if (!hasEntity) {
			clusteredExtractedEntities[title] = [fileName];
		} else {
			clusteredExtractedEntities[title].push(fileName);
		}
	};

	data.forEach((datum) => {
		const { entities, fileName } = datum;

		if (entities && entities instanceof Array) {
			entities.forEach((entity) => {
				addEntity(entity, fileName);
			});
		} else {
			addEntity(entities, fileName);
		}
	});

	// console.log(clusteredExtractedEntities);
}

module.exports = clusterExtractedEntities;
