const functions = require('firebase-functions');
const organizerModule = require('./organizer')
const chapterModule = require('./chapter')

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