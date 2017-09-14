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

    event.dates = new EventDateFormatter().getDates(event.dates);

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




