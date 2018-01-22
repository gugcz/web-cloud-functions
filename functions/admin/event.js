const UrlCreator = require('../libs/url').UrlCreator;
const storage = require('../libs/database').storage;
const database = require('../libs/database').database;
const publicStorageUrl = require('../libs/database').publicStorageUrl;

const EventDateFormatter = require('../libs/date').EventDateFormatter
const EventDateComparator = require('../libs/date').EventDateComparator
const firebaseArray = require('../libs/firebase-array')
const file = require('../libs/file');
var marked = require('marked');


exports.saveEvent = function(eventData, coverImage) {

  // TODO

}

exports.deleteEvent = function(eventId) {
  let eventRef = database.ref('events/' + eventId);
  return eventRef.remove()
}


function copyEventData(eventData) {
  return {
    name: eventData.name,
    subtitle: eventData.subtitle || '',
    description: marked(eventData.description) || '',
    datesFilter: {start: eventData.dates.start, end: eventData.dates.end},
    dates: new EventDateFormatter(eventData.dates).getDates(),
    venue: eventData.venue,
    cover: eventData.cover || '',
    regFormLink: eventData.regFormLink,
    chaptersFilter: eventData.chapters,
    links: eventData.links || []
  };
}

exports.publishEvent = function(eventSnapshot) {
  let eventData = eventSnapshot.val()
  let eventId = eventSnapshot.key
  var usedUrls = []

  return database.ref('publishedEvents').once('value').then(eventsSnapshot => {
    if (eventsSnapshot.val() !== null) {
      usedUrls = Object.keys(eventsSnapshot.val())
    }

    let publishedEventUrl = new UrlCreator(eventData, usedUrls).getUrl()
    var organizersIds = firebaseArray.getArrayFromIdList(eventData.organizers)
    var chaptersIds = firebaseArray.getArrayFromIdList(eventData.chapters)

    let publishedEvent = copyEventData(eventData)



    return Promise.all([getOrganizersInfo(organizersIds), getChaptersInfo(chaptersIds), database.ref('events/' + eventId + '/publishedEventId').set(publishedEventUrl)]).then(result => {
      publishedEvent.organizers = result[0]
      publishedEvent.chapters = result[1]

      return database.ref('publishedEvents/' + publishedEventUrl).set(publishedEvent);
    })

  })



}

exports.updatePublishedEvent = function(eventSnapshot) {
  let eventData = eventSnapshot.val()
  let eventId = eventSnapshot.key
  var publishedEventUrl = eventData.publishedEventId;

  var organizersIds = firebaseArray.getArrayFromIdList(eventData.organizers)
  var chaptersIds = firebaseArray.getArrayFromIdList(eventData.chapters)

  let publishedEvent = copyEventData(eventData)



  return Promise.all([getOrganizersInfo(organizersIds), getChaptersInfo(chaptersIds)]).then(result => {
    publishedEvent.organizers = result[0]
    publishedEvent.chapters = result[1]

    return database.ref('publishedEvents/' + publishedEventUrl).set(publishedEvent);
  })



}

function getOrganizersInfo(organizersIds) {
  var promises = organizersIds.map(function (id) {
    return database.ref('organizers/' + id).once('value');
  })

  return Promise.all(promises).then(organizersInfo => {
    return organizersInfo.map(organizer => {
        return {
          name: organizer.val().name,
          profilePicture: organizer.val().profilePicture || ''
        }
      }
    )
  })
}

// TODO Use chapter module
function getChaptersInfo(chaptersIds) {
  var promises = chaptersIds.map(function (id) {
    return database.ref('chapters/' + id).once('value');
  })

  return Promise.all(promises).then(chaptersInfo => {
    return chaptersInfo.map(chapter => {
        return {
          name: chapter.val().name,
          urlId: chapter.key,
          logo: chapter.val().logo || ''
        }
      }
    )
  })
}


exports.unpublishEvent = function(eventSnapshot) {
  // TODO - Refactor
  let publishedEventId = eventSnapshot.val().publishedEventId
  let eventId = eventSnapshot.key
  return Promise.all([database.ref('publishedEvents/' + publishedEventId).remove(), database.ref('events/' + eventId + '/publishedEventId').remove()])
}
exports.deletePublishedEvent = function(eventSnapshot) {
  // TODO - Refactor
  let publishedEventId = eventSnapshot.val().publishedEventId
  return database.ref('publishedEvents/' + publishedEventId).remove()
}



