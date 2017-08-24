const database = require('./database').database

exports.saveAndPublishEvent = function (eventData) {


    let publishedEventRef = database.ref('publishedEvents').push({});
    publishedEventRef.set(getPublicEventData(eventData))
    eventData.publishedEventId = publishedEventRef.key

    let eventRef = database.ref('events').push({});
    return eventRef.set(eventData)
}

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

function getPublicEventData(eventData) {
    var usedUrls = getUsedUrls()
    usedUrls.then(function (usedURlsArray) {

    })
    let urlCreator = new exports.UrlCreator(eventData, []);
    var venueInfo = getVenueInfo('gdg-brno/0')
    return {
        name: eventData.name,
        url: urlCreator.getUrl(),
        subtitle: eventData.subtitle,
        dates: eventData.dates,
        description: eventData.description,
        venue: venueInfo, // TODO
        chapters: eventData.chapters,
        organizers: eventData.organizers,
        links: eventData.links
    }

}

exports.saveEvent = function(eventData) {
    let eventRef = database.ref('events').push({});
    return eventRef.set(eventData)
}

exports.removeEvent = function(eventId) {
    let eventRef = database.ref('events/' + eventId);
    return eventRef.remove()
}

exports.publishEvent = function(eventId) {
    let publishedEventRef = database.ref('publishedEvents').push();
    let publicEventDataPromise = getEventData(eventId).then(eventDataSnapshot => getPublicEventData(eventDataSnapshot.val()))
    database.ref('events/' + eventId + '/publishedEventId').set(publishedEventRef.key)
    return publicEventDataPromise.then(function (publicEventData) {
        console.log('Event data', publicEventData)
        return publishedEventRef.set(publicEventData)
    })
}

function getPublishedEventId(eventId) {
    return getEventData(eventId).then(eventData => eventData.publishedEventId)
}
function getEventData(eventId) {
    return database.ref('events/' + eventId).once('value')
}

exports.unpublishEvent = function(eventId) {
    database.ref('publishedEvents/' + getPublishedEventId(eventId)).remove();
     return database.ref('events/' + eventId + '/publishedEventId').remove()
}

function getVenueInfo(venueId) {
    //return database.ref('chapterVenues' + venueId).once('value');
    return {
        name: 'VŠPJ',
        address: 'Tolstého 5',
        howTo: 'Zahni doleva',
        mapUrl: 'maps.google.com'
    }
}

function getUsedUrls() {
    return database.ref('publishedEvents').once('value').then(function (snapshot) {
        console.log(snapshot.val())
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
    snapshot.forEach(function(item) {
        var itemVal = item.val().url;
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

exports.UrlCreator = function (event, usedUrls) {

    this.getUrl = function () {
        if (event.isMultipleEvent) {
            return getUrlForMultipleEvent()
        }
        else {
            return getUrlForSingleEvent()
        }
    }

    function getUrlForMultipleEvent() {
        if (event.name.toLowerCase().includes('vol.')) {
            event.name = event.name.replace('vol.', '#')
            event.name = event.name.replace('Vol.', '#')
        }

        return getUrlForSingleEvent()
    }

    function getUrlForSingleEvent() {
        var possibleUrl = removeSpacesAndSpecialChars(removeDiacritics(event.name).toLowerCase())
        if (urlHasDuplicates(possibleUrl)) {
            return repairUrlForNoDuplicates(possibleUrl, event.venue)
        }
        return possibleUrl
    }

    function addNumberToUrl(url, number) {
        return url + '-' + number.toString()
    }

    function repairUrlForNoDuplicates(url, venue) {
        var possibleUrl = addCityToUrl(url, venue)
        if (urlHasDuplicates(possibleUrl)) {
            return addNumberToUrl(possibleUrl, getNumberOfDuplicates(possibleUrl) + 1)
        }
        return possibleUrl
    }

    function removeDiacritics(string) {
        var accentModule = require('diacritics')
        return accentModule.remove(string)
    }

    function removeSpacesAndSpecialChars(string) {
        return string.replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');
    }

    function urlHasDuplicates(possibleUrl) {
        console.log(usedUrls)
        return usedUrls.indexOf(possibleUrl) !== -1
    }

    function getNumberOfDuplicates(possibleUrl) {
        return usedUrls.filter(function (usedUrl) {
            return usedUrl.startsWith(possibleUrl)
        }).length
    }

    function addCityToUrl(url, city) {
        return url + '-' + removeDiacritics(city).toLowerCase()
    }



}
