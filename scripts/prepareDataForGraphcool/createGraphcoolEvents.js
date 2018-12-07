const saveGraphcoolData = require('../utils/saveGraphcoolData');
const omitNullValues = require('../utils/omitNullValues');

const createTitleFallback = (title, description) => title
	|| (description ? `Untitled — ${description.substring(0, 50)}…` : 'Untitled');

const createGraphcoolEvent = ({
	startDate: eventStartDate,
	endDate: eventEndDate,
	title: eventTitle,
	description: eventDescription,
	fileName: id,
}) => omitNullValues({
	_typeName: 'Event',
	createdAt: new Date(),
	id,
	eventDescription,
	eventEndDate,
	eventStartDate,
	eventTitle: createTitleFallback(eventTitle, eventDescription),
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
