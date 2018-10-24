const functions = require('firebase-functions');

const database = require('./libs/database').database
/*exports.temporaryFunction = functions.https.onRequest(((req, resp) => {
  database.ref('organizers').orderByChild('chapters_leader').startAt("").once('value').then(orgs => {

    let promises = [];
    orgs.forEach(org => {
      console.log(org.val().chapters_leader)
      promises.push(org.ref.child('chapters_leader').set({}))
    })

    Promise.all(promises).then(() =>resp.send('ok')).catch(err => resp.send(err))
  })
}))*/

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
//exports.getEventsStats = functions.https.onRequest(frontendEventModule.getEventsStats)

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
const adminOrganizerModule = require('./admin/organizer');


exports.saveEvent = functions.https.onRequest(((req, resp) => {
  authModule.validateFirebaseToken(req, resp, adminEventModule.saveEvent)
}));

exports.deleteEvent = functions.https.onRequest(((req, resp) => {
  authModule.validateFirebaseToken(req, resp, adminEventModule.deleteEvent)
}));

//exports.getInactiveOrganizers = functions.https.onRequest(adminOrganizerModule.getInactiveOrganizers);

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

const request = require('request')

function transformDataIntoReport(snaphsot) {
  let eventData = snaphsot.val()

  return `*${eventData.name.toUpperCase()}*\n` +
    `*Počet účastníků: ${eventData.report.attendeesCount}`
}

function getReportText(report, eventId) {

  return database.ref('events/' + eventId).once('value').then(transformDataIntoReport);
}

function getStringFromArray(item) {
  return item.map(item => item.name).join(', ');
}

exports.sendReportToSlack = functions.database.ref('/events/{eventId}/report').onWrite((change, context) => {

  const report = change.after.val();

  // TODO - Hide secret part of url
  //const text = getReportText(context.params.eventId);

  return database.ref('events/' + context.params.eventId).once('value').then(snapshot => {
    let fakeRequest = {query: {id: snapshot.val().publishedEventId}}
    let fakeResponse = {
      send: function (event) {
        let reportMessage = `*${event.name.toUpperCase()}*\n` +
          `*Počet účastníků:* ${report.attendeesCount}\n` +
          `*Organizátoři:* ${getStringFromArray(event.organizers)}\n` +
          `*Chaptery:* ${getStringFromArray(event.chapters)}\n`
        ;

        return request.post('https://hooks.slack.com/services/', {json: {text: reportMessage}})
      }
    }
    return frontendEventModule.getEvent(fakeRequest, fakeResponse)

  })



});

