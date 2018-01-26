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


  let publishedEvent = EventDataFormatter.getEventDataInPublishFormat(eventData);


  return Promise.all(promisesToAdd).then(() => {
    return getPublishedEventRef(publishedEventUrl).set(publishedEvent);
  })
}

function getPublishedEventIdPropertyInEventRef(eventId) {
  return database.ref('events/' + eventId + '/publishedEventId');
}





function getPublishedEventRef(publishedEventId) {
  return database.ref('publishedEvents/' + publishedEventId);
}



