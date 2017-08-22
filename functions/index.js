const functions = require('firebase-functions');
const organizerModule = require('./organizer')
const chapterModule = require('./chapter')
const eventModule = require('./event')

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const database = admin.database()

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
exports.saveAndPublishEvent = functions.https.onRequest((req, res) => {
    let idToken;
    console.log(req.get("authorization"))
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
        eventModule.saveAndPublishEvent(req, res, database);
    }).catch(error => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
    });


});