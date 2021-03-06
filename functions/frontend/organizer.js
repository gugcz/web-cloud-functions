var firebaseArray = require('../libs/firebase-array')
const database = require('../libs/database').database
const formatOrganizerItem = require('../libs/organizer').formatOrganizerItem

// Do not use combination of query, e.g. active and profile picture
exports.getOrganizers = function (request, response) {
    var organizersPromise;
    let chapter = request.query.chapter;
    let active = request.query.active;
    let profilePicture = request.query.profilePicture;
    let organizersReference = database.ref('organizers');

    if (chapter) {
        organizersPromise = organizersReference.orderByChild('chapters/' + chapter).equalTo(true).once('value');
    }
    else if (active) {
        organizersPromise = organizersReference.orderByChild('active').equalTo(active === 'true').once('value');
    }
    else if (profilePicture) {
        organizersPromise = organizersReference.orderByChild('profilePicture').startAt("").once('value');
    }
    else {
        organizersPromise = organizersReference.once('value');
    }


    organizersPromise.then(organizerListSnapshot => sendOrganizerListWithName(organizerListSnapshot));


    function sendOrganizerListWithName(organizerListSnapshot) {
        var organizers = organizerListSnapshot.val()

        if (!organizers) {
          response.send([])
        }
        var organizersArray = firebaseArray.getArrayFromKeyValue(organizers)

        // TODO - Remove inactive
      var filteredAndShuffledOrganizersArray = shuffle(organizersArray.map(formatOrganizerItem))

        response.send(filteredAndShuffledOrganizersArray)

    }




}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


exports.savePublicListOfOrganizers = function () {
  return database.ref('organizers').orderByChild('profilePicture').startAt("").once('value').then(organizersSnapshot => {
    let organizers = organizersSnapshot.val()

    if (!organizers) {
      return database.ref('public/organizers').set([])
    }
    let organizersArray = firebaseArray.getArrayFromKeyValue(organizers);

    let filteredAndShuffledOrganizersArray = shuffle(organizersArray.map(formatOrganizerItem));

    return database.ref('public/organizers').set(filteredAndShuffledOrganizersArray)
  })
}
