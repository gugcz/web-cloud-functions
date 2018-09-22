const moment = require('moment');

exports.isPastEvent = function (event) {
  return moment(event.datesFilter.start).isBefore()
}

exports.isPastEventForMonthCount = function (event, monthCount) {
  return moment(event.datesFilter.start).isBefore(moment().subtract(monthCount, 'months'))
}

exports.isFutureEvent = function (event) {
  return moment(event.datesFilter.start).isAfter()
}

exports.isPastEventAdmin = function (event) {
  return moment(event.dates.start).isBefore()
}

exports.isPastEventForMonthCountAdmin = function (event, monthCount) {
  const eventMoment = moment(event.dates.start);
  if (monthCount) {
    return eventMoment.isBefore() && eventMoment.isAfter(moment().subtract(monthCount, 'months'))
  }
  else {
    return eventMoment.isBefore()
  }
}

exports.isFutureEventAdmin = function (event) {
  return moment(event.dates.start).isAfter()
}

exports.sortEventsByDateFuture = function (b, a) {
  return new Date(b.datesFilter.start) - new Date(a.datesFilter.start);
}

exports.sortEventsByDatePast = function (a, b) {
  return new Date(b.datesFilter.start) - new Date(a.datesFilter.start);
}

exports.getDateObjectHalfYearAgo = function () {
  return moment().subtract(6, 'months');
}
