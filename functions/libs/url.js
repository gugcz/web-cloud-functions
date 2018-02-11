exports.UrlCreator = function (event, usedUrls) {

    this.getUrl = function () {
        if (event.dates.isRepeatingEvent) {
            return getUrlForMultipleEvent()
        }
        else {
            return getUrlForSingleEvent()
        }
    }

    function getUrlForMultipleEvent() {
        if (event.name.toLowerCase().includes('vol.') || event.name.toLowerCase().includes('no.')) {
            event.name = event.name.replace('vol.', '#')
            event.name = event.name.replace('Vol.', '#')
            event.name = event.name.replace('no.', '#')
            event.name = event.name.replace('No.', '#')
        }

        return getUrlForSingleEvent()
    }

    function getUrlForSingleEvent() {
        var possibleUrl = removeSpacesAndSpecialChars(removeDiacritics(event.name).toLowerCase())
        if (urlHasDuplicates(possibleUrl)) {
            return repairUrlForNoDuplicates(possibleUrl, event.venue.city)
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
        return url + '-' + removeSpacesAndSpecialChars(removeDiacritics(city)).toLowerCase()
    }
}
