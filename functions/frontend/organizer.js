var firebaseArray = require('../libs/firebase-array')

exports.getOrganizers = function(request, response, database) {
    var organizersPromise;
    let chapter = request.query.chapter;
    let active = request.query.active;
    let organizersReference = database.ref('organizers');

    if (chapter) {
        organizersPromise = organizersReference.orderByChild('chapters/' + chapter).equalTo(true).once('value');
    }
    else if (active) {
        organizersPromise = organizersReference.orderByChild('active').equalTo(active === 'true').once('value');
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
        var filteredAndShuffledOrganizersArray = shuffle(organizersArray.map(function filterOrganizerArray(organizer) {
            return {
                name: organizer.name,
                profilePicture: organizer.profilePicture,
                links: organizer.links
            }
        }))

        response.send(filteredAndShuffledOrganizersArray)

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


}
