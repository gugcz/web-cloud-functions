const database = require('../libs/database').database // TODO Mock for test
const EventDateFormatter = require('../libs/date').EventDateFormatter

exports.getEvent = function (request, response) {
  let eventId = request.query.id;

  if (!eventId) {
    response.status(400).send("Event ID not found!");
  }

  let eventPromise = database.ref('publishedEvents').orderByChild('url').equalTo(eventId).once('value');

  eventPromise.then(eventSnapshot => sendEventInfo(eventSnapshot));

  function sendEventInfo(chapterSnapshot) {
    let event = getFirsItemInKeyValue(chapterSnapshot.val());

    event.dates = new EventDateFormatter(event.dates).getDates();

    console.log(event)
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
      response.send(event)
    })
  }
}

exports.getPastSixEvents = function (request, response) {

  let chapterId = request.query.chapter;
  if (!chapterId) {
    response.status(400).send("Chapter ID not found!");
  }

  let eventPromise = database.ref('events').orderByChild('chapters/' + chapterId).equalTo(true).once('value')

  eventPromise.then(function (eventsSnapshot) {

    let eventsArray = getArrayFromKeyValue(eventsSnapshot.val())
    response.send(sortEventsByDate(eventsArray).map(lastSixEventsMap).slice(0, 6))
  })
}

function lastSixEventsMap(event) {

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
    console.log(organizersInfo[0].val())
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
    console.log(chaptersInfo[0].val())
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




