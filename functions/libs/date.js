exports.EventDateFormatter = function (dates) {
  dates.start = new Date(dates.start)
  dates.end = new Date(dates.end)

  function isMultiDayEvent(dates) {
    return false
  }

  function getDatesForSingleDayEvent(dates) {
    return {
      isMultiDay: false,
      date: getDate(dates.start),
      time: getTimeForSingleDayEvent(dates)
    }
  }

  function getDate(date) {
    console.log(date.toLocaleString())
    return date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
  }

  function getTime(date) {
    var moment = require('moment')
    return moment(date).format('HH:mm')
  }

  this.getTime = function () {
    if (isMultiDayEvent(dates)) {
      // TODO
    }
    else {
      return getTimeForSingleDayEvent(dates)
    }
  }

  this.getDate = function () {
    if (isMultiDayEvent(dates)) {
      // TODO
    }
    else {
      return getDate(dates.start)
    }
  }

  this.getDates = function() {
    dates.start = new Date(dates.start)
    dates.end = new Date(dates.end)
    if (isMultiDayEvent(dates)) {
      // TODO
    }
    else {
      return getDatesForSingleDayEvent(dates)
    }
  }

  function getTimeForSingleDayEvent(dates) {
    return getTime(dates.start) + ' - ' + getTime(dates.end)
  }
}
