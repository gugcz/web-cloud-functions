//const database = require('./database').database
const UrlCreator = require('./url').UrlCreator

// Expecting parent id in changed data
function saveTerm(parentId, changedData) {
    let eventRef = database.ref('events').push({});
    eventRef.set(changedData)

    let parentEventRef = database.ref('events/' + parentId + '/terms').push(eventRef.key);
}

function publishTerm(term, parent) {
    let eventData = Object.assign(parent, term);

    eventData = getPublicEventData(eventData)

    let publishedEventRef = database.ref('publishedEvents').push({});
    publishedEventRef.set(eventData);

    term.publishedEventId = publishedEventRef.key;
    let eventRef = database.ref('events/' + eventId);
    eventRef.set(eventData)
}

function getPublicEventData(eventData, usedUrls) {
    let urlCreator = new UrlCreator(eventData, usedUrls);
    return {
        name: eventData.name,
        url: urlCreator.getUrl(),
        subtitle: eventData.subtitle,
        dates: eventData.dates,
        description: eventData.description,
        venue: eventData.venue, // TODO
        chapters: eventData.chapters,
        organizers: eventData.organizers,
        links: eventData.links
    }

}

exports.saveEvent = function(eventData) {
    let eventRef = database.ref('events').push({});
    return eventRef.set(eventData)
}

exports.deleteEvent = function(eventId) {
    let eventRef = database.ref('events/' + eventId);
    return eventRef.remove()
}

exports.publishEvent = function(eventId) {
    var urlsPromise = getUsedUrls();
    var eventDataPromise = getEventData(eventId)

    return Promise.all([urlsPromise, eventDataPromise]).then(results => {
        var eventData = results[1].val()
        return getVenueInfo(eventData.venue).then(venueSnapshot => {
            eventData.venue = venueSnapshot.val()
            var publicData = getPublicEventData(eventData, results[0])
            let publishedEventRef = database.ref('publishedEvents').push();
            database.ref('events/' + eventId + '/publishedEventId').set(publishedEventRef.key)

            return publishedEventRef.set(publicData)
        })

    })
}

function getPublishedEventId(eventId) {
    return database.ref('events/' + eventId + '/publishedEventId').once('value')
}
function getEventData(eventId) {
    return database.ref('events/' + eventId).once('value')
}

exports.unpublishEvent = function(eventId) {
    // TODO - Refactor
    return getPublishedEventId(eventId).then(idSnapshot => database.ref('publishedEvents/' + idSnapshot.val()).remove().then(() => database.ref('events/' + eventId + '/publishedEventId').remove()))
}

function getVenueInfo(venueId) {
    return database.ref('chapterVenues/' + venueId).once('value');
}

function getUsedUrls() {
    return database.ref('publishedEvents').once('value').then(function (snapshot) {
        if (snapshot.val()) {
            return getUrlsFromSnapshot(snapshot)
        }
        else {
            return []
        }
    })
}

function getUrlsFromSnapshot(snapshot) {
    var usedUrls = []
    snapshot.forEach(function(itemSnapshot) {
        var itemVal = itemSnapshot.val().url;
        if (itemVal) {
            usedUrls.push(itemVal)

        }
    });
    return usedUrls
}

function getOrganizers() {
    return [{
        name: "Matěj Horák",
        imageUrl: "http://www.horm.cz/images/profilepic.jpg",
        id: "-Kq-U7--b_XqZmhYoy3v"
    }]
}

function pushEventToFirebase(event, publicEvent, database) {
    var eventRef = database.ref('events').push({})
    eventRef.set(event)

    var publishedEventRef = database.ref('publishedEvents').push({})
    publishedEventRef.set(publicEvent)
}

function isMultiDayEvent(dates) {
    return false
}

function getDatesForSingleDayEvent(dates) {
    return {
        isMultiDay: false,
        date: getDate(dates.start),
        time: getTime(dates.start) + ' - ' + getTime(dates.end)
    }
}

function getDate(date) {
    console.log(date.toLocaleString())
    return date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
}

function getTime(date) {
    return date.toLocaleTimeString()
}



function prepareDates(dates) {
    dates.start = new Date(dates.start)
    dates.end = new Date(dates.end)
    if (isMultiDayEvent(dates)) {

    }
    else {
        return getDatesForSingleDayEvent(dates)
    }
}

exports.getPublishedEvent = function (request, response) {
    let eventId = request.query.id;

    if (!eventId) {
        response.status(400).send("Event ID not found!");
    }

    let eventPromise = database.ref('publishedEvents').orderByChild('url').equalTo(eventId).once('value');

    eventPromise.then(eventSnapshot => sendEventInfo(eventSnapshot));

    function sendEventInfo(chapterSnapshot) {
        let event = getFirsItemInKeyValue(chapterSnapshot.val());

        event.dates = prepareDates(event.dates);

        console.log(event)
        var organizersIds = Object.keys(event.organizers).map(function(key) {
            if (event.organizers[key])
                return key
        })

        var chaptersIds = Object.keys(event.chapters).map(function(key) {
            if (event.chapters[key])
                return key
        })

        Promise.all([getOrganizersInfo(organizersIds), getChaptersInfo(chaptersIds)]).then(result => {
            event.organizers = result[0]
            event.chapters = result[1]
            console.log(event)
            response.send(event)
        })
    }
}

function getOrganizersInfo(organizersIds) {
    var promises = organizersIds.map(function (id) {
        return database.ref('organizers/' + id).once('value');
    })

    return Promise.all(promises).then(organizersInfo => {
        console.log(organizersInfo[0].val())
        return organizersInfo.map(organizer => {
            return {
                name: organizer.val().name,
                profilePicture: ""
            }
        }
        )
    })
}

function getChaptersInfo(chaptersIds) {
    var promises = chaptersIds.map(function (id) {
        return database.ref('chapters/' + id).once('value');
    })

    return Promise.all(promises).then(chaptersInfo => {
        console.log(chaptersInfo[0].val())
        return chaptersInfo.map(chapter => {
            return {
                name: chapter.val().name,
                key: chapter.key,
                logo: ""
            }
        }
        )
    })
}


function getFirsItemInKeyValue(keyValue) {
    return Object.keys(keyValue).map(function(key) {
        return keyValue[key];
    })[0]
}

