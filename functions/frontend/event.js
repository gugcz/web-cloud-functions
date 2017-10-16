const database = require('../libs/database').database // TODO Mock for test
const EventDateFormatter = require('../libs/date').EventDateFormatter
const EventDateComparator = require('../libs/date').EventDateComparator

exports.getEvent = function (request, response) {
  let eventId = request.query.id;

  console.log(response.req)
  if (!eventId) {
    response.status(400).send("Event ID not found!");
  }

  let eventPromise = database.ref('events').orderByChild('urlId').equalTo(eventId).once('value');

  eventPromise.then(eventSnapshot => sendEventInfo(getFirsItemInKeyValue(eventSnapshot.val()), sendEvent));

  function sendEvent(event) {
    response.send(event)
  }

}

// TODO Rename, refactor
function sendEventInfo(event, callback, response) {

  event.dates = new EventDateFormatter(event.dates).getDates();

  var organizersIds = Object.keys(event.organizers).map(function(key) {
    if (event.organizers[key])
      return key
  })

  var chaptersIds = Object.keys(event.chapters).map(function(key) {
    if (event.chapters[key])
      return key
  })

  Promise.all([getOrganizersInfo(organizersIds), getChaptersInfo(chaptersIds)]).then(result => {
    event.organizers = result[0]
    event.chapters = result[1]

    callback(event)
  })
}

function isPublishedEvent(event) {
  return event.published
}

exports.getPastSixEvents = function (request, response) {

  getChapterEventsPromise(request).then(function (eventsSnapshot) {

    if (eventsSnapshot.numChildren() === 0) {
      response.send([])
    }
    let dateComparator =  new EventDateComparator()
    let pastEventsArray = getPublishedEventArray(eventsSnapshot).filter(dateComparator.isPastEvent)
    response.send(sortEventsByDate(pastEventsArray).map(eventCardMap).slice(0, 6))
  })
}


function getPublishedEventArray(eventsSnapshot) {
  return getArrayFromKeyValue(eventsSnapshot.val()).filter(isPublishedEvent);
}

exports.getFutureEvents = function (request, response) {

  getChapterEventsPromise(request).then(function (eventsSnapshot) {

    let dateComparator =  new EventDateComparator()
    let futureEventsArray = getPublishedEventArray(eventsSnapshot).filter(dateComparator.isFutureEvent)


    if (futureEventsArray.length === 0) {
      response.send([])
    }
    else {
      sendEventInfo(futureEventsArray[0], sendConcatEventArray)
    }


    // TODO Better naming
    function sendConcatEventArray(event) {
      futureEventsArray = futureEventsArray.map(eventCardMap)
      futureEventsArray[0] = event
      response.send(futureEventsArray)
    }
  })
}


function getChapterEventsPromise(request) {
  let chapterId = request.query.chapter;
  if (!chapterId) {
    response.status(400).send("Chapter ID not found!");
  }

  return database.ref('events').orderByChild('chapters/' + chapterId).equalTo(true).once('value')

}

function eventCardMap(event) {

  if (event.cover) {
    return {
      name: event.name,
      cover: event.cover,
      subtitle: event.subtitle,
      urlId: event.urlId
    }
  }
  return {
    name: event.name,
    subtitle: event.subtitle,
    urlId: event.urlId
  }
}

function sortEventsByDate(events) {
  return events.sort(function(a,b){
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.dates.start) - new Date(a.dates.start);
  });
}

function getOrganizersInfo(organizersIds) {
  var promises = organizersIds.map(function (id) {
    return database.ref('organizers/' + id).once('value');
  })

  return Promise.all(promises).then(organizersInfo => {
    return organizersInfo.map(organizer => {
        return {
          name: organizer.val().name,
          profilePicture: ""
        }
      }
    )
  })
}

function getChaptersInfo(chaptersIds) {
  var promises = chaptersIds.map(function (id) {
    return database.ref('chapters/' + id).once('value');
  })

  return Promise.all(promises).then(chaptersInfo => {
    return chaptersInfo.map(chapter => {
        return {
          name: chapter.val().name,
          key: chapter.key,
          logo: ""
        }
      }
    )
  })
}


function getArrayFromKeyValue(keyValue) {
  return Object.keys(keyValue).map(function (key) {
    return keyValue[key];
  });
}

function getFirsItemInKeyValue(keyValue) {
  return getArrayFromKeyValue(keyValue)[0]
}




