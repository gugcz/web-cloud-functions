const UrlCreator = require('../libs/url').UrlCreator;
const database = require('../libs/database').database;

const EventDataFormatter = require('../libs/event/event');
const firebaseArray = require('../libs/firebase-array')
const file = require('../libs/file');


exports.saveEvent = function (req, res) {

  // TODO - Update event with ID
  const eventData = req.body.eventData;
  //console.log('Event data', eventData)
  return database.ref('events').push(eventData).then(res.send('Event saved'))

};

exports.deleteEvent = function (req, res) {
  const eventId = req.query.id;
  if (!eventId) {
    res.sendStatus(404)
  }

  let eventRef = database.ref('events/' + eventId);
  return eventRef.remove()
};

exports.publishEvent = function (req, res) {
  let eventId = req.query.eventId;
  let usedUrls = [];

  database.ref('events/' + eventId).once('value').then(eventSnapshot => {
    let eventData = eventSnapshot.val();

    database.ref('publishedEvents').once('value').then(eventsSnapshot => {
      if (arraySnapshotIsNotEmpty(eventsSnapshot)) {

        Array.prototype.push.apply(usedUrls, Object.keys(eventsSnapshot.val())); // Merge arrays
      }

      let publishedEventUrl = new UrlCreator(eventData, usedUrls).getUrl();
      publishEventPromise(eventData, publishedEventUrl, [getPublishedEventIdPropertyInEventRef(eventId).set(publishedEventUrl)]).then(() => {
        res.send('Published')
      });

    })
  });

};

exports.unpublishEvent = function (req, res) {
  console.log("called");
  let eventId = req.query.eventId;

  database.ref('events/' + eventId).once('value').then(eventSnapshot => {
    let eventData = eventSnapshot.val();

    let publishedEventId = eventData.publishedEventId;
    Promise.all([getPublishedEventRef(publishedEventId).remove(), getPublishedEventIdPropertyInEventRef(eventId).remove()]).then(() => {
      res.send('Unpublished')
    })
  });
};

exports.updatePublishedEvent = function (req, res) {
  let eventId = req.query.eventId;

  database.ref('events/' + eventId).once('value').then(eventSnapshot => {
    let eventData = eventSnapshot.val();

    let publishedEventId = eventData.publishedEventId;
    publishEventPromise(eventData, publishedEventId, []).then(() => {
      res.send('Updated')
    })
  });
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



