const getRandomID = require('../utils/getRandomID');
const saveGraphcoolData = require('../utils/saveGraphcoolData');

const createGraphcoolEvent = ({
	startDate,
	endDate,
	title,
	description,
}) => ({
	_typeName: 'Event',
	id: getRandomID(),
	createdAt: new Date(),
	eventDescription: description,
	eventEndDate: endDate,
	eventStartDate: startDate,
	eventTitle: title,
});

const createGraphcoolEvents = (data) => saveGraphcoolData({
	data: data.events.map(createGraphcoolEvent),
	type: 'nodes',
	fileName: 'eventNodes.json',
})
	.then(() => Promise.resolve(data))
	.catch((err) => {
		throw new Error(err);
	});

module.exports = createGraphcoolEvents;
