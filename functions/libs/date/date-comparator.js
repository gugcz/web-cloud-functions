const moment = require('moment');

exports.isPastEvent = function (event) {
  return moment(event.datesFilter.start).isBefore()
}

exports.isFutureEvent = function (event) {
  return moment(event.datesFilter.start).isAfter()
}

exports.sortEventsByDateFuture = function (b, a) {
  return new Date(b.datesFilter.start) - new Date(a.datesFilter.start);
}

exports.sortEventsByDatePast = function (a, b) {
  return new Date(b.datesFilter.start) - new Date(a.datesFilter.start);
}
