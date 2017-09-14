

const database = require('./database').database // TODO Mock for test
const UrlCreator = require('./libs/url').UrlCreator

function isMultiDayEvent(dates) {
  return false
}

function getDatesForSingleDayEvent(dates) {
  return {
    isMultiDay: false,
    date: getDate(dates.start),
    time: getTime(dates.start) + ' - ' + getTime(dates.end)
  }
}

function getDate(date) {
  console.log(date.toLocaleString())
  return date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
}

function getTime(date) {
  return date.toLocaleTimeString()
}



function prepareDates(dates) {
  dates.start = new Date(dates.start)
  dates.end = new Date(dates.end)
  if (isMultiDayEvent(dates)) {

  }
  else {
    return getDatesForSingleDayEvent(dates)
  }
}

exports.getEvent = function (request, response) {
  let eventId = request.query.id;

  if (!eventId) {
    response.status(400).send("Event ID not found!");
  }

  let eventPromise = database.ref('publishedEvents').orderByChild('url').equalTo(eventId).once('value');

  eventPromise.then(eventSnapshot => sendEventInfo(eventSnapshot));

  function sendEventInfo(chapterSnapshot) {
    let event = getFirsItemInKeyValue(chapterSnapshot.val());

    event.dates = prepareDates(event.dates);

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
      console.log(event)
      response.send(event)
    })
  }
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


function getFirsItemInKeyValue(keyValue) {
  return Object.keys(keyValue).map(function(key) {
    return keyValue[key];
  })[0]
}




