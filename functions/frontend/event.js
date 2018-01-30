const database = require('../libs/database').database // TODO Mock for test
const EventDateComparator = require('../libs/date/date-comparator')
const EventDataFormatter = require('../libs/event/event')
const firebaseArray = require('../libs/firebase-array')

const EVENTS_PATH = 'publishedEvents';

exports.getEvent = function (request, response) {
  let eventId = request.query.id;

  if (!eventId) {
    response.status(400).send("Event ID not found!");
  }

  let eventPromise = database.ref(EVENTS_PATH + '/' + eventId).once('value');

  eventPromise.then(eventSnapshot => {

    let event = eventSnapshot.val();
    let organizersIds = firebaseArray.getArrayFromIdList(event.organizers);
    let chaptersIds = firebaseArray.getArrayFromIdList(event.chapters);

    Promise.all([getChaptersInfo(chaptersIds), getOrganizersInfo(organizersIds)]).then(results => {
      event.chapters = results[0];
      event.organizers = results[1];
      response.send(event)
    })
  });

}

function getOrganizersInfo(organizersIds) {
  let promises = organizersIds.map(id => database.ref('organizers/' + id).once('value'));

  return Promise.all(promises).then(organizersInfo => organizersInfo.map(EventDataFormatter.organizerArrayOfSnapshotsMap))
}

exports.getMapOfEvents = function (request, response) {
  getEventsPromise().then(eventsSnapshot => {

    if (eventsSnapshot.numChildren() === 0) {
      response.send([])
    }
    let futureEventsArray = firebaseArray.getArrayFromKeyValue(eventsSnapshot.val()).filter(EventDateComparator.isFutureEvent)
    response.send(futureEventsArray.sort(EventDateComparator.sortEventsByDatePast).map(EventDataFormatter.eventMarkerMap))
  })
}


// TODO Use chapter module
function getChaptersInfo(chaptersIds) {
  let promises = chaptersIds.map(id => database.ref('chapters/' + id).once('value'));

  return Promise.all(promises).then(chaptersInfo => chaptersInfo.map(EventDataFormatter.chapterArrayOfSnapshotsMap))
}


exports.getPastSixEvents = function (request, response) {
  let chapterId = request.query.chapter;
  let sectionId = request.query.section;

  getEventsPromise(chapterId, sectionId).then(function (eventsSnapshot) {

    if (eventsSnapshot.numChildren() === 0) {
      response.send([])
    }
    let pastEventsArray = firebaseArray.getArrayFromKeyValue(eventsSnapshot.val()).filter(EventDateComparator.isPastEvent)
    response.send(pastEventsArray.sort(EventDateComparator.sortEventsByDatePast).map(EventDataFormatter.eventCardMap).slice(0, 6))
  })
}



function getEventsPromise(chapterId, eventRef, request, sectionId) {


  eventRef = database.ref(EVENTS_PATH);

  if (chapterId) {
    eventRef = eventRef.orderByChild('chaptersFilter/' + chapterId).equalTo(true);
  }
  else if (sectionId) {
    // TODO
  }

  return eventRef.once('value')
}

exports.getFutureEvents = function (request, response) {
  let chapterId = request.query.chapter;
  let sectionId = request.query.section;

  getEventsPromise(chapterId, sectionId).then(function (eventsSnapshot) {


    let futureEventsArray = firebaseArray.getArrayFromKeyValue(eventsSnapshot.val()).filter(EventDateComparator.isFutureEvent)


    if (futureEventsArray.length === 0) {
      response.send([])
    }
    else {
      let sortedFutureEventsArray = futureEventsArray.sort(EventDateComparator.sortEventsByDateFuture)
      console.log(sortedFutureEventsArray)
      response.send(sortedFutureEventsArray.slice(0, 1).concat(sortedFutureEventsArray.slice(1).map(EventDataFormatter.eventCardMap)))
    }
  })
}




