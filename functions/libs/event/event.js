const EventDateFormatter = require('../date/date-formatter')
const EventSection = require('./event-section')
var marked = require('marked');

exports.getEventDataInPublishFormat = function (eventData) {
  return {
    name: eventData.name,
    subtitle: eventData.subtitle || '',
    description: marked(eventData.description) || '',
    datesFilter: {start: eventData.dates.start, end: eventData.dates.end},
    dates: EventDateFormatter.getDates(eventData.dates),
    venue: eventData.venue || {name: 'Bez místa konání'},
    cover: eventData.cover || '',
    regFormLink: eventData.regFormLink || '',
    chaptersFilter: eventData.chapters || [],
    chapters: eventData.chapters || [],
    organizers: eventData.organizers || [],
    links: eventData.links || []
  };
}

exports.chapterArrayOfSnapshotsMap = chapterSnapshot => {
  return {
    name: chapterSnapshot.val().name,
    urlId: chapterSnapshot.key,
    logo: chapterSnapshot.val().logo || ''
  }
}

exports.organizerArrayOfSnapshotsMap = organizer => {
  return {
    name: organizer.val().name,
    profilePicture: organizer.val().profilePicture || ''
  }
}

exports.eventCardMap = event => ({
  name: event.name,
  cover: event.cover || '',
  subtitle: event.subtitle || '',
  urlId: event.urlId
})

exports.eventMarkerMap = event => ({
  name: event.name,
  section: EventSection.getEventSection(event.chapters) || '',
  date: EventDateFormatter.getDateWithoutYear(event.datesFilter) || '',
  coordinates: event.venue.coordinates || '',
  urlId: event.urlId
})


