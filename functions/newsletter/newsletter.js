const moment = require('moment');
const database = require('../libs/database').database;
const firebaseArray = require('../libs/firebase-array');
const EventDateFormatter = require('../libs/date/date-formatter');

const EVENT_LINK_PREFIX = "https://gug.cz/event/";

exports.getNewsletterEvents = function (request, response) {
  const year = parseInt(request.query.year);
  const month = parseInt(request.query.month);

  if (!year || !month) {
    response.status(400).send('year and month parameters are required');
    return;
  }

  const startDate = moment([year, month - 1]);
  const endDate = startDate.clone().add(1, 'month');

  const eventsPromise = getEventsPromise(startDate, endDate);
  const chaptersPromise = getChaptersPromise();

  Promise.all([eventsPromise, chaptersPromise])
    .then(result => {
      const events = firebaseArray.getArrayFromKeyValue(result[0].val());
      const chapters = firebaseArray.getArrayFromKeyValue(result[1].val());
      response.send(createNewsletterEventsList(events, chapters));
    })
};

function createNewsletterEventsList(events, chapters) {
  return events.map(event => createNewsletterEvent(event, chapters));
}

function createNewsletterEvent(event, chapters) {
  const chapter = getMainChapterForEvent(event, chapters);

  return {
    name: event.name,
    date: EventDateFormatter.getStartDate(event.datesFilter),
    time: EventDateFormatter.getTime(event.datesFilter),
    multiDayDateAndTime: event.dates.datesAndTimes,
    url: EVENT_LINK_PREFIX + event.urlId,
    groupShortcut: chapter.section,
    city: chapter.location
  };
}

function getMainChapterForEvent(event, chapters) {
  const firstChapterId = firebaseArray.getArrayFromIdList(event.chapters)[0];
  const chapter = chapters.find(chapter => chapter.urlId === firstChapterId);
  return chapter || {groupShortcut: "NOT FOUND", city: "NOT FOUND"};
}

function getEventsPromise(startDate, endDate) {
  return database
    .ref('publishedEvents')
    .orderByChild('datesFilter/start')
    .startAt(startDate.toISOString())
    .endAt(endDate.toISOString())
    .once('value');
}

function getChaptersPromise() {
  return database
    .ref('chapters')
    .once('value');
}
