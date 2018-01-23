const EventDateFormatter = require('date')
var marked = require('marked');

exports.getEventDataInPublishFormat = function (eventData) {
  return {
    name: eventData.name,
    subtitle: eventData.subtitle || '',
    description: marked(eventData.description) || '',
    datesFilter: {start: eventData.dates.start, end: eventData.dates.end},
    dates: new EventDateFormatter(eventData.dates).getDates(),
    venue: eventData.venue,
    cover: eventData.cover || '',
    regFormLink: eventData.regFormLink,
    chaptersFilter: eventData.chapters,
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
