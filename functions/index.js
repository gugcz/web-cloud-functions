const functions = require('firebase-functions');
const database = require('./libs/database').database
const firestore = require('./libs/database').firestore
/**
 * Frontend functions
 */
const frontendEventModule = require('./frontend/event')
const organizerModule = require('./frontend/organizer')
const chapterModule = require('./frontend/chapter')
const sectionModule = require('./frontend/section')

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


/**
 * Admin functions
 */
const adminEventModule = require('./admin/event')

// Events functions
// TODO POST function?
exports.saveAndPublishEvent = functions.https.onRequest((req, res) => {
    let idToken;
    if (req.get("authorization")) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.get("authorization")
    } else {
        res.status(403).send('Unauthorized');
    }
    admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
        console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        // TODO
    }).catch(error => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
    });


});

exports.saveEvent = functions.https.onRequest(((req, resp) => {
    // TODO Add authentication and authorization
    if (req.body.eventData) {
        adminEventModule.saveEvent(req.body.eventData).then(resp.send('Event saved'))
    }
    else {
        resp.sendStatus(404)
    }
}))
exports.publishEvent = functions.https.onRequest(((req, resp) => {
    // TODO Add authentication and authorization
    if (req.query.id) {
        adminEventModule.publishEvent(req.query.id).then(resp.send('Event published'))

    }
    else {
        resp.sendStatus(404)
    }
}))

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

