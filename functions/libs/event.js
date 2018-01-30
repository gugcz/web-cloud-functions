const EventDateFormatter = require('./date/date-formatter')
var marked = require('marked');

exports.getEventDataInPublishFormat = function (eventData) {
  console.log(eventData.dates)
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
  section: getEventSection(event.chapters) || 'gdg',
  date: EventDateFormatter.getDateWithoutYear(event.datesFilter) || '',
  coordinates: event.venue.coordinates || '',
  urlId: event.urlId
})

// TODO Extract and test
function getEventSection(chapters) {
  let chapterIds = Object.keys(chapters).reverse() // Reverse because of alphabet order
  var  counts = {};
  chapterIds.map(chapterId => chapterId.substring(0, 3)).forEach(function(i) { counts[i] = (counts[i]||0) + 1;});
  return Object.keys(counts).sort((firstId, secondId) => counts[firstId] - counts[secondId]).pop();
}
