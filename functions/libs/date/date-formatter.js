const moment = require('moment');
let EventDateFormatter = function (dates) {
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
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() // date.getMonth() + 1 cause of months are 0...11
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

  this.getDateWithoutYear = function () {
    return dates.start.getDate() + '.' + (dates.start.getMonth() + 1) + '.';
  }

  function getDatesForMultiDayEvent(dates) {
    return {
      isMultiDay: true,
      datesAndTimes: getDate(dates.start) + " (" + getTime(dates.start) + ") - " + getDate(dates.end) + " (" + getTime(dates.end) + ")"
    }
  }

  this.getDates = function () {
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
};

exports.getDates = function(dates) {
  let dateFormatter = new EventDateFormatter(dates);
  return dateFormatter.getDates();
}
exports.getDate = function(dates) {
  let dateFormatter = new EventDateFormatter(dates);
  return dateFormatter.getDate();
}

exports.getDateWithoutYear = function(dates) {
  let dateFormatter = new EventDateFormatter(dates);
  return dateFormatter.getDateWithoutYear();
}

exports.getTime = function(dates) {
  let dateFormatter = new EventDateFormatter(dates);
  return dateFormatter.getTime();
}

