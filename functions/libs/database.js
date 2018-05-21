const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.database = admin.database();
exports.firestore = admin.firestore();

// Database paths and urls
exports.publicStorageUrl = 'https://storage.googleapis.com/gug-web.appspot.com';
