const EventDateFormatter = require('../libs/date').EventDateFormatter

var dates;
var formatter;

describe("A EventDateFormatter for single-day event", function () {



  beforeEach(function() {
    dates = {
      start: "2017-09-03T16:00:00.000Z",
      end: "2017-09-03T18:00:00.000Z"
    }
    formatter = new EventDateFormatter(dates)
  });


  it("transform date string to string in format DD.MM.YYYY", function () {
    expect(formatter.getDate()).toBe("3.8.2017")
  })

  it("transform date string to time range string in format HH:MM - HH:MM", function () {
    expect(formatter.getTime()).toBe("18:00 - 20:00")
  })

  it("returns object with time and date property", function () {
    var expectedDates = {
      isMultiDay: false,
      date: "3.8.2017",
      time: "18:00 - 20:00"
    }
    expect(formatter.getDates()).toEqual(expectedDates)
  })
});

describe("A EventDateFormatter for multiple-day event", function () {

  var formatter;

  beforeEach(function() {
    dates = {
      start: "2017-09-02T16:00:00.000Z",
      end: "2017-09-03T18:00:00.000Z"
    }
    formatter = new EventDateFormatter(dates)
  });


  it("returns object with datesAndTimes property in format ", function () {
    var expectedDates = {
      isMultiDay: true,
      datesAndTimes: "2.8.2017 (18:00) - 3.8.2017 (20:00)"
    }
    expect(formatter.getDates()).toEqual(expectedDates)
  })
});
