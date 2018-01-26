const database = require('../libs/database').database // TODO Mock for test
const EventDateFormatter = require('../libs/date').EventDateFormatter
const EventDateComparator = require('../libs/date').EventDateComparator
const EventDataFormatter = require('../libs/event')
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
    let dateComparator =  new EventDateComparator()
    let pastEventsArray = firebaseArray.getArrayFromKeyValue(eventsSnapshot.val()).filter(dateComparator.isPastEvent)
    response.send(sortEventsByDate(pastEventsArray).map(eventCardMap).slice(0, 6))
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

    let dateComparator =  new EventDateComparator()
    let futureEventsArray = firebaseArray.getArrayFromKeyValue(eventsSnapshot.val()).filter(dateComparator.isFutureEvent)


    if (futureEventsArray.length === 0) {
      response.send([])
    }
    else {
      let sortedFutureEventsArray = futureEventsArray.sort((a, b) => {return new Date(a.datesFilter.start) - new Date(b.datesFilter.start)})
      console.log(sortedFutureEventsArray)
      response.send(sortedFutureEventsArray.slice(0, 1).concat(sortedFutureEventsArray.slice(1).map(eventCardMap)))
    }
  })
}


function eventCardMap(event) {

  return {
    name: event.name,
    cover: event.cover || '',
    subtitle: event.subtitle || '',
    urlId: event.urlId
  }
}

function sortEventsByDate(events) {
  return events.sort(function(a,b){
    // Turn your strings into datesFilter, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.datesFilter.start) - new Date(a.datesFilter.start);
  });
}

function getFirsItemInKeyValue(keyValue) {
  return firebaseArray.getArrayFromKeyValue(keyValue)[0]
}




