exports.saveAndPublishEvent = function (req, res, database) {
    var eventData = {
        "name": "A2 Workshop",
        "subtitle": "Přijď si A2 vyzkoušet v praxi!",
        "isMultipleEvent": false,
        "dates": {
            "start": "2017-09-03T16:00:00.000Z",
            "end": "2017-09-03T18:00:00.000Z"
        },
        "description": "...",
        "venue": null,
        "chapters": [
            "gdg-brno"
        ],
        "guarantee": "-Kq-U7--b_XqZmhYoy3v",
        "organizers": {
            "-Kq-Tz6KoT_RyM7MF_qZ": true,
            "-Kq-U7--b_XqZmhYoy3v": true
        },
        "links": [
            {
                "url": "plus.google.com",
                "type": "google-plus"
            },
            {
                "url": "facebook.com",
                "type": "facebook"
            },
            {
                "url": ""
            }
        ]
    }

    pushEventToFirebase(eventData, database)
    res.sendStatus(200)
}

function pushEventToFirebase(event, database) {
    var eventRef = database.ref('events/a2-workshop').set(event)
    eventRef.set(event)
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
        return ''
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
