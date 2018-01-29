const EventDateFormatter = require('../libs/date/date-formatter')
const EventDateComparator = require('../libs/date/date-comparator')

var dates;


describe("A EventDateFormatter for single-day event", function () {


  beforeEach(function() {
    dates = {
      start: "2017-09-03T16:00:00.000Z",
      end: "2017-09-03T18:00:00.000Z"
    }
  });


  it("transform date string to string in format DD.MM.YYYY", function () {
    expect(EventDateFormatter.getDate(dates)).toBe("3.9.2017")
  })

  it("transform date string to time range string in format HH:MM - HH:MM", function () {
    expect(EventDateFormatter.getTime(dates)).toBe("18:00 - 20:00")
  })

  it("returns object with time and date property", function () {
    var expectedDates = {
      isMultiDay: false,
      date: "3.9.2017",
      time: "18:00 - 20:00"
    }
    expect(EventDateFormatter.getDates(dates)).toEqual(expectedDates)
  })
});

describe("A EventDateFormatter for multiple-day event", function () {

  var formatter;

  beforeEach(function() {
    dates = {
      start: "2017-09-02T16:00:00.000Z",
      end: "2017-09-03T18:00:00.000Z"
    }
  });


  it("returns object with datesAndTimes property in format ", function () {
    var expectedDates = {
      isMultiDay: true,
      datesAndTimes: "2.9.2017 (18:00) - 3.9.2017 (20:00)"
    }
    expect(EventDateFormatter.getDates(dates)).toEqual(expectedDates)
  })
});

describe("A EventDateComparator -", function () {


  describe("isPastEvent", function () {
    it("compares event date and return true for past event", function () {
      var event = {
        datesFilter: {
          start: '2017-09-02T16:00:00.000Z'
        }
      }
      expect(EventDateComparator.isPastEvent(event)).toEqual(true)
    })

    it("compares event date and return false for future event", function () {
      var event = {
        datesFilter: {

          // TODO Generate date next year programmatically
          start: '2018-09-02T16:00:00.000Z' // Event date is next year
        }
      }
      expect(EventDateComparator.isPastEvent(event)).toEqual(false)
    })


  })

  describe("isFutureEvent", function () {

    it("compares event date and return false for past event", function () {
      var event = {
        datesFilter: {
          start: '2017-09-02T16:00:00.000Z'
        }
      }
      expect(EventDateComparator.isFutureEvent(event)).toEqual(false)
    })

    it("compares event date and return true for future event", function () {
      var event = {
        datesFilter: {
          // TODO Generate date next year programmatically
          start: '2018-09-02T16:00:00.000Z' // Event date is next year
        }
      }
      expect(EventDateComparator.isFutureEvent(event)).toEqual(true)
    })


  })

  describe('sortEventsByDate', function () {
    it("sort events for future events as nearest first", function () {
      let events = [
        {datesFilter: {start: '2018-09-02T16:00:00.000Z'}}, {datesFilter: {start: '2018-09-03T16:00:00.000Z'}}, {datesFilter: {start: '2018-09-04T16:00:00.000Z'}}, {datesFilter: {start: '2018-09-05T16:00:00.000Z'}}
      ]
      let sortedEvents = [
        {datesFilter: {start: '2018-09-02T16:00:00.000Z'}}, {datesFilter: {start: '2018-09-03T16:00:00.000Z'}}, {datesFilter: {start: '2018-09-04T16:00:00.000Z'}}, {datesFilter: {start: '2018-09-05T16:00:00.000Z'}}
      ]

      expect(events.sort(EventDateComparator.sortEventsByDateFuture)).toEqual(sortedEvents)
    })

    it("sort events for past events as youngest first", function () {
      let events = [
        {datesFilter: {start: '2016-09-02T16:00:00.000Z'}}, {datesFilter: {start: '2016-09-03T16:00:00.000Z'}}, {datesFilter: {start: '2016-09-04T16:00:00.000Z'}}, {datesFilter: {start: '2016-09-05T16:00:00.000Z'}}
      ]

      let sortedEvents = [
        {datesFilter: {start: '2016-09-05T16:00:00.000Z'}}, {datesFilter: {start: '2016-09-04T16:00:00.000Z'}}, {datesFilter: {start: '2016-09-03T16:00:00.000Z'}}, {datesFilter: {start: '2016-09-02T16:00:00.000Z'}}
      ]



      expect(events.sort(EventDateComparator.sortEventsByDatePast)).toEqual(sortedEvents)
    })
  })






});

