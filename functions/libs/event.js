const EventDateFormatter = require('./date').EventDateFormatter
var marked = require('marked');

exports.getEventDataInPublishFormat = function (eventData) {
  console.log(eventData.dates)
  return {
    name: eventData.name,
    subtitle: eventData.subtitle || '',
    description: marked(eventData.description) || '',
    datesFilter: {start: eventData.dates.start, end: eventData.dates.end},
    dates: new EventDateFormatter(eventData.dates).getDates(),
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
