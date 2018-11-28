function clusterExtractedEntities(data) {
    const clusteredExtractedEnties = {};

    const addEntity = (entity, fileName) => {
        // console.log(entity);
        const { title } = entity;
        const hasEntity = clusteredExtractedEnties.hasOwnProperty(title);
        if (!hasEntity) {
            clusteredExtractedEnties[title] = [fileName];
        } else {
            clusteredExtractedEnties[title].push(fileName);
        }
    };

    data.forEach((datum, index) => {
        const { entities, fileName } = datum;

        if (entities && entities instanceof Array) {
            entities.forEach(entity => {
                addEntity(entity, fileName);
            });
        } else {
            addEntity(entities, fileName);
        }
    });

    // console.log(clusteredExtractedEnties);
}

module.exports = clusterExtractedEntities;
