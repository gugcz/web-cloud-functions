const functions = require('firebase-functions');
const admin = require('firebase-admin');
const storage = require('@google-cloud/storage')({keyFilename: './libs/service-account.json'});

admin.initializeApp(functions.config().firebase);

exports.database = admin.database();
exports.storage = storage;
exports.firestore = admin.firestore();

// Database paths and urls
exports.publicStorageUrl = 'https://storage.googleapis.com/gug-web.appspot.com';
