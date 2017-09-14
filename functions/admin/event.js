const UrlCreator = require('../libs/url').UrlCreator


function getPublicEventData(eventData, usedUrls) {
  let urlCreator = new UrlCreator(eventData, usedUrls);
  return {
    name: eventData.name,
    url: urlCreator.getUrl(),
    subtitle: eventData.subtitle,
    dates: eventData.dates,
    description: eventData.description,
    venue: eventData.venue, // TODO
    chapters: eventData.chapters,
    organizers: eventData.organizers,
    links: eventData.links
  }

}

exports.saveEvent = function(eventData) {
  let eventRef = database.ref('events').push({});
  return eventRef.set(eventData)
}

exports.deleteEvent = function(eventId) {
  let eventRef = database.ref('events/' + eventId);
  return eventRef.remove()
}

exports.publishEvent = function(eventId) {
  var urlsPromise = getUsedUrls();
  var eventDataPromise = getEventData(eventId)

  return Promise.all([urlsPromise, eventDataPromise]).then(results => {
    var eventData = results[1].val()
    return getVenueInfo(eventData.venue).then(venueSnapshot => {
      eventData.venue = venueSnapshot.val()
      var publicData = getPublicEventData(eventData, results[0])
      let publishedEventRef = database.ref('publishedEvents').push();
      database.ref('events/' + eventId + '/publishedEventId').set(publishedEventRef.key)

      return publishedEventRef.set(publicData)
    })

  })
}

function getPublishedEventId(eventId) {
  return database.ref('events/' + eventId + '/publishedEventId').once('value')
}
function getEventData(eventId) {
  return database.ref('events/' + eventId).once('value')
}

exports.unpublishEvent = function(eventId) {
  // TODO - Refactor
  return getPublishedEventId(eventId).then(idSnapshot => database.ref('publishedEvents/' + idSnapshot.val()).remove().then(() => database.ref('events/' + eventId + '/publishedEventId').remove()))
}

function getVenueInfo(venueId) {
  return database.ref('chapterVenues/' + venueId).once('value');
}

function getUsedUrls() {
  return database.ref('publishedEvents').once('value').then(function (snapshot) {
    if (snapshot.val()) {
      return getUrlsFromSnapshot(snapshot)
    }
    else {
      return []
    }
  })
}

function getUrlsFromSnapshot(snapshot) {
  var usedUrls = []
  snapshot.forEach(function(itemSnapshot) {
    var itemVal = itemSnapshot.val().url;
    if (itemVal) {
      usedUrls.push(itemVal)

    }
  });
  return usedUrls
}


