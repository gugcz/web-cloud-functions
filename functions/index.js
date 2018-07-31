const functions = require('firebase-functions');

/*
exports.temporaryFunction = functions.https.onRequest(((req, resp) => {
  database.ref('chapters').once('value').then(chapters => {
    chapters.forEach(chapter => {
      database.ref('chapters/' + chapter.key + '/logo').set('https://storage.googleapis.com/gug-web.appspot.com/logos/chapter/' + chapter.key + '.png')
    })
    resp.send('OK')
  })
}))
*/

/**
 * Frontend functions
 */
const frontendEventModule = require('./frontend/event');
const organizerModule = require('./frontend/organizer');
const chapterModule = require('./frontend/chapter');
const sectionModule = require('./frontend/section');
const newsletterModule = require('./newsletter/newsletter');

// Organizers functions
exports.getOrganizers = functions.https.onRequest(organizerModule.getOrganizers);

// Chapter functions
exports.getChapter = functions.https.onRequest(chapterModule.getChapter);
exports.getChapters = functions.https.onRequest(chapterModule.getChapters);

// Sections functions
exports.getSections = functions.https.onRequest(sectionModule.getSections);
exports.getSection = functions.https.onRequest(sectionModule.getSection);

// Event functions
exports.getEvent = functions.https.onRequest(frontendEventModule.getEvent);
exports.getPastSixEvents = functions.https.onRequest(frontendEventModule.getPastSixEvents);
exports.getFutureEvents = functions.https.onRequest(frontendEventModule.getFutureEvents);
exports.getMapOfEvents = functions.https.onRequest(frontendEventModule.getMapOfEvents);

// Public data generators
exports.generateMapData = functions.database.ref('/publishedEvents/{eventId}').onWrite(frontendEventModule.savePublicMapOfEvents);
exports.generateOrganizersList = functions.database.ref('organizers/{organizerId}').onWrite(organizerModule.savePublicListOfOrganizers);

// Newsletter functions
exports.getNewsletterEvents = functions.https.onRequest(newsletterModule.getNewsletterEvents);


/**
 * Admin functions
 */
const adminEventModule = require('./admin/event');
const authModule = require('./libs/auth');


exports.saveEvent = functions.https.onRequest(((req, resp) => {
  authModule.validateFirebaseToken(req, resp, adminEventModule.saveEvent)
}));

exports.deleteEvent = functions.https.onRequest(((req, resp) => {
  authModule.validateFirebaseToken(req, resp, adminEventModule.deleteEvent)
}));

// Extract into admin event module
function publishedEventWasUpdated(eventSnapshot) {
  return eventSnapshot.val().published && eventSnapshot.val().publishedEventId;

}
function eventWasPublished(eventSnapshot) {
  return eventSnapshot.val().published && !eventSnapshot.val().publishedEventId;

}
function publishedEventWasUnpublished(eventSnapshot) {
  return !eventSnapshot.val().published && eventSnapshot.val().publishedEventId;

}
function eventWasDeleted(eventSnapshot) {
  return !eventSnapshot.exists();

}
function dataWasNotChangedByUser(after, before) {
  return !eventWasDeleted(after) && (after.child('publishedEventId').val() !== before.child('publishedEventId').val());

}
exports.publishEventAutoRunner = functions.database.ref('/events/{eventId}').onWrite((change, context) => {

  const afterSnapshot = change.after;
  const beforeSnapshot = change.before;

  if (dataWasNotChangedByUser(afterSnapshot, beforeSnapshot)) {
    return null;
  }

  if (eventWasDeleted(afterSnapshot)) {
    // Snapshot data are null
    return adminEventModule.deletePublishedEvent(change.before)
  } else if (eventWasPublished(afterSnapshot)) {
    return adminEventModule.publishEvent(afterSnapshot);
  } else if (publishedEventWasUnpublished(afterSnapshot)) {
    return adminEventModule.unpublishEvent(afterSnapshot);
  } else if (publishedEventWasUpdated(afterSnapshot)) {
    return adminEventModule.updatePublishedEvent(afterSnapshot)
  } else {
    return null;

  }

});

