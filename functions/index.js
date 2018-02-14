const functions = require('firebase-functions');
const database = require('./libs/database').database
const admin = require('firebase-admin');


/**
 * Frontend functions
 */
const frontendEventModule = require('./frontend/event')
const organizerModule = require('./frontend/organizer')
const chapterModule = require('./frontend/chapter')
const sectionModule = require('./frontend/section')

/*exports.temporaryFunction = functions.https.onRequest(((req, resp) => {
  database.ref('chapters').once('value').then(chapters => {
    chapters.forEach(chapter => {
      database.ref('chapters/' + chapter.key + '/logo').set('https://storage.googleapis.com/gug-web.appspot.com/logos/chapter/' + chapter.key + '.png')
    })
    resp.send('OK')
  })
}))*/


// Organizers functions
exports.getOrganizers = functions.https.onRequest((req, res) => {
  organizerModule.getOrganizers(req, res, database);
});

// Chapter functions
exports.getChapter = functions.https.onRequest((req, res) => {
  chapterModule.getChapter(req, res, database);
});
exports.getChapters = functions.https.onRequest((req, res) => {
  chapterModule.getChapters(req, res, database);
});


// Sections functions
exports.getSections = functions.https.onRequest((req, res) => {
  sectionModule.getSections(req, res, database);
});

exports.getSection = functions.https.onRequest((req, res) => {
  sectionModule.getSection(req, res, database);
});

// Event functions
exports.getEvent = functions.https.onRequest((req, res) => {
  frontendEventModule.getEvent(req, res);
});

exports.getPastSixEvents = functions.https.onRequest((req, res) => {
  frontendEventModule.getPastSixEvents(req, res);
});

exports.getFutureEvents = functions.https.onRequest((req, res) => {
  frontendEventModule.getFutureEvents(req, res);
});

exports.getMapOfEvents = functions.https.onRequest((req, res) => {
  frontendEventModule.getMapOfEvents(req, res);
});


/**
 * Admin functions
 */
const adminEventModule = require('./admin/event')



exports.saveEvent = functions.https.onRequest(((req, resp) => {
  validateFirebaseIdToken(req, resp, adminEventModule.saveEvent).then(resp.send('Event saved'));
}))

function validateFirebaseIdToken(req, res, next) {
  console.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !req.cookies.__session) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  }
  return admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    return next(req, res);
  }).catch((error) => {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
  });
};


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

function dataWasNotChangedByUser(eventSnapshot) {
  return eventSnapshot.child('publishedEventId').changed();
}

exports.publishEventAutoRunner = functions.database.ref('/events/{eventId}').onWrite(writeEvent => {


  let eventSnapshot = writeEvent.data

  if (dataWasNotChangedByUser(eventSnapshot)) {
    return null;
  }

  if (eventWasDeleted(eventSnapshot)) {
    // Snapshot data are null
    return adminEventModule.deletePublishedEvent(eventSnapshot.previous)
  } else if (eventWasPublished(eventSnapshot)) {
    return adminEventModule.publishEvent(eventSnapshot);
  } else if (publishedEventWasUnpublished(eventSnapshot)) {
    return adminEventModule.unpublishEvent(eventSnapshot);
  } else if (publishedEventWasUpdated(eventSnapshot)) {
    return adminEventModule.updatePublishedEvent(eventSnapshot)
  } else {
    return null;
  }

})

exports.deleteEvent = functions.https.onRequest(((req, resp) => {
  // TODO Add authentication and authorization
  if (req.query.id) {
    adminEventModule.deleteEvent(req.query.id).then(resp.send('Event deleted'))
  }
  else {
    resp.sendStatus(404)
  }
}))
exports.unpublishEvent = functions.https.onRequest(((req, resp) => {
  // TODO Add authentication and authorization
  if (req.query.id) {
    adminEventModule.unpublishEvent(req.query.id).then(resp.send('Event unpublished'))
  }
  else {
    resp.sendStatus(404)
  }
}))

