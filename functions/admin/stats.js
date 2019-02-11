const database = require('../libs/database').database

exports.getStatsForYear = function (req, resp) {
  const moment = require('moment');
  const firebaseArray = require('./libs/firebase-array')


  const year = req.query.year;
  const month = 1;

  if (!year) {
    resp.sendStatus(404)
  }

  const startDate = moment([year, month - 1]);
  const endDate = startDate.clone().add(12, 'month');

  let eventPromise = database.ref('events')
    .orderByChild('dates/start')
    .startAt(startDate.toISOString())
    .endAt(endDate.toISOString())
    .once('value')

  eventPromise.then(snapshot => {
    let events = firebaseArray.getArrayFromKeyValue(snapshot.val())
    const length = events.length;
    const attendees = events.filter(event => event.report).reduce(((attendees, event) => attendees + event.report.attendeesCount), 0);
    const organizers = [...new Set(events.map(events => firebaseArray.getArrayFromIdList(events.organizers)).reduce((result, orgArray) => result.concat(orgArray)))].length
    //resp.send(organizers)
    resp.send('Events: ' + length + '\nAttendees: ' + attendees + '\nOrganizers: ' + organizers);
  })
}
