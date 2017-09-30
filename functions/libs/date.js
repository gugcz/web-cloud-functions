const moment = require('moment');
exports.EventDateFormatter = function (dates) {
  dates.start = new Date(dates.start)

  dates.end = new Date(dates.end)

  function isMultiDayEvent(dates) {
    return !moment(dates.start).isSame(dates.end, 'day');
  }

  function getDatesForSingleDayEvent(dates) {
    return {
      isMultiDay: false,
      date: getDate(dates.start),
      time: getTimeForSingleDayEvent(dates)
    }
  }

  function getDate(date) {
    return date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
  }

  function getTime(date) {

    return moment(date).format('HH:mm')
  }

  this.getTime = function () {
    if (isMultiDayEvent(dates)) {
      // TODO is needed?
    }
    else {
      return getTimeForSingleDayEvent(dates)
    }
  }

  this.getDate = function () {
    if (isMultiDayEvent(dates)) {
      // TODO Is needed?
    }
    else {
      return getDate(dates.start)
    }
  }

  function getDatesForMultiDayEvent(dates) {
    return {
      isMultiDay: true,
      datesAndTimes: getDate(dates.start) + " (" + getTime(dates.start) + ") - " + getDate(dates.end) + " (" + getTime(dates.end) + ")"
    }
  }

  this.getDates = function() {
    dates.start = new Date(dates.start)
    dates.end = new Date(dates.end)
    if (isMultiDayEvent(dates)) {
      // TODO
      return getDatesForMultiDayEvent(dates)
    }
    else {
      return getDatesForSingleDayEvent(dates)
    }
  }

  function getTimeForSingleDayEvent(dates) {
    return getTime(dates.start) + ' - ' + getTime(dates.end)
  }
}

exports.EventDateComparator = function () {
  this.isPastEvent = function (event) {
    return moment(event.dates.start).isBefore()
  }
}
