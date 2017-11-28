const UrlCreator = require('../libs/url').UrlCreator;
const storage = require('../libs/database').storage;
const database = require('../libs/database').database;
const publicStorageUrl = require('../libs/database').publicStorageUrl;
const file = require('../libs/file');


function getPublicEventData(eventData, usedUrls) {
  let urlCreator = new UrlCreator(eventData, usedUrls);
  return {
    name: eventData.name,
    urlId: urlCreator.getUrl(),
    subtitle: eventData.subtitle,
    dates: eventData.dates,
    description: eventData.description,
    venue: eventData.venue, // TODO
    chapters: eventData.chapters,
    organizers: eventData.organizers,
    links: eventData.links
  }

}

exports.saveEvent = function(eventData, coverImage) {

  // TODO - Remove OOP?
  let urlCreator = new UrlCreator(eventData, getUsedUrls());
  let eventUrlId = urlCreator.getUrl();

  let eventRef = database.ref('publishedEvents/' + eventUrlId).push({});

  if (coverImage) {
    let fileSuffix = file.getFileSuffix(coverImage.name);

    let eventCoversBucket = storage.bucket('covers').bucket('event');

    // TODO Extract path
    return uploadFileToCloudStorage(eventCoversBucket, coverImage, fileSuffix, eventUrlId).then(() => {
      eventData.cover = publicStorageUrl + '/logos/chapter/' + filename;
      return eventRef.set(eventData)
    });

  }
  // TODO Remove Else (not clean code practice) and return what?
  else {
    return eventRef.set(eventData);
  }


}

function uploadFileToCloudStorage(bucket, file, fileSuffix, urlId) {
  if(!file){
    reject("no file to upload, please choose a file.");
    return;
  }
  console.info("about to upload file as a json: " + file.type);
  var filePath = file.path;

  // TODO Extract to module and test it
  var fileName = urlId + fileSuffix;


  console.log('File path: ' + filePath);

  return bucket.upload(filePath, {
    destination: file.name, public: true
  });
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
  return database.ref('events').once('value').then(function (snapshot) {
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
    var itemVal = itemSnapshot.val().urlId;
    if (itemVal) {
      usedUrls.push(itemVal)

    }
  });
  return usedUrls
}


