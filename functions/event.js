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
    this.event = event
    this.usedUrls = usedUrls

    this.getUrl = function () {
        if (this.event.isMultipleEvent) {
            return getUrlForMultipleEvent()
        }
        else {
            return getUrlForSingleEvent(this.event)
        }
    }

    function getUrlForMultipleEvent(event) {
        return ''
    }

    function getUrlForSingleEvent(event) {
        return removeSpacesAndSpecialChars(toLowerCase(removeDiacritics(event.name)))
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

    function toLowerCase(string) {
        return string.toLowerCase()
    }

}
