const UrlCreator = require('../libs/url').UrlCreator;
const storage = require('../libs/database').storage;
const database = require('../libs/database').database;
const publicStorageUrl = require('../libs/database').publicStorageUrl;

const EventDateFormatter = require('../libs/date').EventDateFormatter
const EventDateComparator = require('../libs/date').EventDateComparator
const firebaseArray = require('../libs/firebase-array')
const file = require('../libs/file');
var marked = require('marked');


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




exports.publishEvent = function(eventSnapshot) {
  let eventData = eventSnapshot.val()
  let eventId = eventSnapshot.key
  var usedUrls = []

  return database.ref('publishedEvents').once('value').then(eventsSnapshot => {
    if (eventsSnapshot.val() !== null) {
      usedUrls = Object.keys(eventsSnapshot.val())
    }

    let publishedEventUrl = new UrlCreator(eventData, usedUrls).getUrl()
    var organizersIds = firebaseArray.getArrayFromIdList(eventData.organizers)
    var chaptersIds = firebaseArray.getArrayFromIdList(eventData.chapters)

    let publishedEvent = {
      name: eventData.name,
      subtitle: eventData.subtitle,
      description: marked(eventData.description),
      dates: new EventDateFormatter(eventData.dates).getDates(),
      venue: eventData.venue,
      cover: eventData.cover || '',
      regFormLink: eventData.regFormLink,
      links: eventData.links
    }



    return Promise.all([getOrganizersInfo(organizersIds), getChaptersInfo(chaptersIds), database.ref('events/' + eventId + '/publishedEventId').set(publishedEventUrl)]).then(result => {
      publishedEvent.organizers = result[0]
      publishedEvent.chapters = result[1]

      return database.ref('publishedEvents/' + publishedEventUrl).set(publishedEvent);
    })

  })



}

function getOrganizersInfo(organizersIds) {
  var promises = organizersIds.map(function (id) {
    return database.ref('organizers/' + id).once('value');
  })

  return Promise.all(promises).then(organizersInfo => {
    return organizersInfo.map(organizer => {
        return {
          name: organizer.val().name,
          profilePicture: organizer.val().profilePicture || ''
        }
      }
    )
  })
}

// TODO Use chapter module
function getChaptersInfo(chaptersIds) {
  var promises = chaptersIds.map(function (id) {
    return database.ref('chapters/' + id).once('value');
  })

  return Promise.all(promises).then(chaptersInfo => {
    return chaptersInfo.map(chapter => {
        return {
          name: chapter.val().name,
          urlId: chapter.key,
          logo: chapter.val().logo || ''
        }
      }
    )
  })
}


function getPublishedEventId(eventId) {
  return database.ref('events/' + eventId + '/publishedEventId').once('value')
}
function getEventData(eventId) {
  return database.ref('events/' + eventId).once('value')
}

exports.unpublishEvent = function(eventSnapshot) {
  // TODO - Refactor
  let publishedEventId = eventSnapshot.val().publishedEventId
  let eventId = eventSnapshot.key
  return Promise.all([database.ref('publishedEvents/' + publishedEventId).remove(), database.ref('events/' + eventId + '/publishedEventId').remove()])
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


