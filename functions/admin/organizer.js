const EventDateComparator = require("../libs/date/date-comparator");


const database = require('../libs/database').database;

const firebaseArrayLib = require('../libs/firebase-array')

const chapterOrganizersKey = 'chapterOrganizers/';

function transformOrganizerIdArraySnapshotToArray(snapshot) {
  return firebaseArrayLib.getArrayFromIdList(snapshot.val())
}

function getOrganizers(chapterId) {
  return database.ref(chapterOrganizersKey + chapterId).once('value')
}

function generateStatsFromEvents(events) {
  return {
    count: events.length,
    attendeesCount: events.reduce((count, event) => count + (event.report.attendeesCount || 0), 0)
  }
}

exports.getInactiveOrganizers = function (req, resp) {

  // Config
  const numOfMonths = 12;
  const numOfEventsInMonthCount = 3;

  const chapterId = req.query.chapter;
  if (!chapterId) {
    resp.sendStatus(404)
  }

  getOrganizers(chapterId).then(snapshot => {
    let organizerIds = firebaseArrayLib.getArrayFromIdList(snapshot.val())


    let promises = organizerIds.map(organizerId => database.ref('events/').orderByChild('organizers/' + organizerId).equalTo(true).once('value'))

    Promise.all(promises).then(eventsResult => {
      let activityResults = eventsResult
        .map(eventsSnapshot => firebaseArrayLib.getArrayFromKeyValue(eventsSnapshot.val()).filter(event => EventDateComparator.isPastEventForMonthCountAdmin(event, numOfMonths)))
        .map(generateStatsFromEvents)
        .map(stats => stats.count >= numOfEventsInMonthCount)

      let activityArray = {}

      organizerIds.forEach(org => {
        activityArray[org] = activityResults[organizerIds.indexOf(org)]
      })

      resp.send(activityArray)
    })


  })


}


exports.getInactiveChapters = function (req, resp) {

  // Config
  const numOfMonths = 12;
  const numOfEventsInMonthCount = 3;

  const chapterId = req.query.chapter;
  if (!chapterId) {
    resp.sendStatus(404)
  }

  getOrganizers(chapterId).then(snapshot => {
    let organizerIds = firebaseArrayLib.getArrayFromIdList(snapshot.val())


    let promises = organizerIds.map(organizerId => database.ref('events/').orderByChild('chapters/' + organizerId).equalTo(true).once('value'))

    Promise.all(promises).then(eventsResult => {
      let activityResults = eventsResult
        .map(eventsSnapshot => firebaseArrayLib.getArrayFromKeyValue(eventsSnapshot.val()).filter(event => EventDateComparator.isPastEventForMonthCountAdmin(event, numOfMonths)))
        .map(generateStatsFromEvents)
        .map(stats => stats.count >= numOfEventsInMonthCount)

      let activityArray = {}

      organizerIds.forEach(org => {
        activityArray[org] = activityResults[organizerIds.indexOf(org)]
      })

      resp.send(activityArray)
    })


  })


}
