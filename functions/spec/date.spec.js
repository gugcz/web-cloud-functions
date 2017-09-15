const EventDateFormatter = require('../libs/date').EventDateFormatter

var dates = {
  start: "2017-09-03T16:00:00.000Z",
  end: "2017-09-03T18:00:00.000Z"
}


describe("A EventDateFormatter for single event", function () {

  var formatter;

  beforeEach(function() {
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
