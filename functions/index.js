const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

const database = require('./libs/database').database

exports.temporaryFunction = functions.https.onRequest(((req, resp) => {
  // published ma url a druhy ma url-city
  // chceme zachovat ten s obrázkem s kratší url a co je registrovan u rootu
  const firebaseArray = require('./libs/firebase-array')

  //database.ref('events').orderByChild('name').equalTo('Procesy všude, kam se podíváš').once('value').then(snapshot => resp.send(snapshot.val()))

  //database.ref('events/-LWuyHP7fwJnGsp5o-J4/published').set(false).then(() => resp.send('OK'))
  //database.ref('publishedEvents/procesy-vsude-kam-se-podivas').remove().then(() => resp.send('OK'))
}))

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
const adminReportModule = require('./admin/report');
const authModule = require('./libs/auth');
const adminOrganizerModule = require('./admin/organizer');


exports.saveEvent = functions.https.onRequest((req, resp) => {
  cors(req, resp, () => {
    authModule.validateFirebaseToken(req, resp, adminEventModule.saveEvent)
  });
});

exports.deleteEvent = functions.https.onRequest((req, resp) => {
  cors(req, resp, () => {
    authModule.validateFirebaseToken(req, resp, adminEventModule.deleteEvent)
  });
});

exports.publishEvent = functions.https.onRequest((req, resp) => {
  cors(req, resp, () => {
    authModule.validateFirebaseToken(req, resp, adminEventModule.publishEvent);
  })
});

exports.unpublishEvent = functions.https.onRequest((req, resp) => {
  cors(req, resp, () => {
    authModule.validateFirebaseToken(req, resp, adminEventModule.unpublishEvent);
  });
});


exports.updatePublishedEvent = functions.https.onRequest((req, resp) => {
  cors(req, resp, () => {
    authModule.validateFirebaseToken(req, resp, adminEventModule.updatePublishedEvent);
  });
});


//exports.getInactiveOrganizers = functions.https.onRequest(adminOrganizerModule.getInactiveOrganizers);

exports.sendReportToSlack = functions.database.ref('/events/{eventId}/report').onCreate(adminReportModule.sendReportToSlack);

exports.getStatsForYear = functions.https.onRequest(require('./admin/stats').getStatsForYear)

