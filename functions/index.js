const functions = require('firebase-functions');
const organizerModule = require('./organizer')
const chapterModule = require('./chapter')
const eventModule = require('./event')

const database = require('./database').database

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
        eventModule.saveAndPublishEvent(req.body.eventData).then(resp.send('Event saved'));
    }).catch(error => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
    });


});

exports.saveEvent = functions.https.onRequest(((req, resp) => {
    // TODO Add authentication and authorization
    if (req.body.eventData) {
        eventModule.saveEvent(req.body.eventData).then(resp.send('Event saved'))
    }
    else {
        resp.sendStatus(404)
    }
}))
exports.publishEvent = functions.https.onRequest(((req, resp) => {
    // TODO Add authentication and authorization
    if (req.query.id) {
        eventModule.publishEvent(req.query.id).then(resp.send('Event published'))

    }
    else {
        resp.sendStatus(404)
    }
}))

exports.deleteEvent = functions.https.onRequest(((req, resp) => {
    // TODO Add authentication and authorization
    if (req.query.id) {
        eventModule.deleteEvent(req.query.id).then(resp.send('Event deleted'))
    }
    else {
        resp.sendStatus(404)
    }
}))
exports.unpublishEvent = functions.https.onRequest(((req, resp) => {
    // TODO Add authentication and authorization
    if (req.query.id) {
        eventModule.unpublishEvent(req.query.id).then(resp.send('Event unpublished'))
    }
    else {
        resp.sendStatus(404)
    }
}))
