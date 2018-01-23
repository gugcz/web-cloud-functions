const UrlCreator = require('../libs/url').UrlCreator;
const database = require('../libs/database').database;

const EventDataFormatter = require('../libs/event');
const firebaseArray = require('../libs/firebase-array');
const file = require('../libs/file');



exports.saveEvent = function(eventData) {

  // TODO

};

exports.deleteEvent = function(eventId) {
  let eventRef = database.ref('events/' + eventId);
  return eventRef.remove()
};

exports.publishEvent = function(eventSnapshot) {
  let eventData = eventSnapshot.val();
  let eventId = eventSnapshot.key;
  let usedUrls = [];

  return database.ref('publishedEvents').once('value').then(eventsSnapshot => {
    if (arraySnapshotIsEmpty(eventsSnapshot)) {
      usedUrls.concat(Object.keys(eventsSnapshot.val()))
    }

    let publishedEventUrl = new UrlCreator(eventData, usedUrls).getUrl();
    return publishEventPromise(eventData, publishedEventUrl, [getPublishedEventIdPropertyInEventRef(eventId).set(publishedEventUrl)]);

  })

};

exports.unpublishEvent = function(eventSnapshot) {
  let publishedEventId = eventSnapshot.val().publishedEventId;
  let eventId = eventSnapshot.key;
  return Promise.all([getPublishedEventRef(publishedEventId).remove(), getPublishedEventIdPropertyInEventRef(eventId).remove()])
};

exports.updatePublishedEvent = function(eventSnapshot) {
  let eventData = eventSnapshot.val();
  let publishedEventUrl = eventData.publishedEventId;

  return publishEventPromise(eventData, publishedEventUrl, []);
};


exports.deletePublishedEvent = function(eventSnapshot) {
  let publishedEventId = eventSnapshot.val().publishedEventId;
  return getPublishedEventRef(publishedEventId).remove()
};

function arraySnapshotIsEmpty(eventsSnapshot) {
  return eventsSnapshot.val() !== null;
}



function publishEventPromise(eventData, publishedEventUrl, promisesToAdd) {
  let organizersIds = firebaseArray.getArrayFromIdList(eventData.organizers);
  let chaptersIds = firebaseArray.getArrayFromIdList(eventData.chapters);

  let publishedEvent = EventDataFormatter.getEventDataInPublishFormat(eventData);


  return Promise.all([getOrganizersInfo(organizersIds), getChaptersInfo(chaptersIds)].concat(promisesToAdd)).then(result => {
    publishedEvent.organizers = result[0];
    publishedEvent.chapters = result[1];

    return getPublishedEventRef(publishedEventUrl).set(publishedEvent);
  })
}

function getPublishedEventIdPropertyInEventRef(eventId) {
  return database.ref('events/' + eventId + '/publishedEventId');
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



function getPublishedEventRef(publishedEventId) {
  return database.ref('publishedEvents/' + publishedEventId);
}



