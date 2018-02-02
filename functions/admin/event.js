const UrlCreator = require('../libs/url').UrlCreator;
const database = require('../libs/database').database;

const EventDataFormatter = require('../libs/event/event');
const file = require('../libs/file');



exports.saveEvent = function(eventData) {

  return database.ref('events').push(eventData)

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
    if (arraySnapshotIsNotEmpty(eventsSnapshot)) {

      Array.prototype.push.apply(usedUrls, Object.keys(eventsSnapshot.val())); // Merge arrays
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

function arraySnapshotIsNotEmpty(eventsSnapshot) {
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



