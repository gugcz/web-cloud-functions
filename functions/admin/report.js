const frontendEventModule = require('../frontend/event');
const slackPostingUrl = require('../config').slackPostingUrl;
const database = require('../libs/database').database;
const request = require('request')

exports.sendReportToSlack = function (snapshot, context) {
  const report = snapshot.val();

  let eventId = context.params.eventId;
  let deleteSlackBoolean = database.ref('events/' + eventId + '/report/sendToSlack').remove();

  if (report.sendToSlack) {
    return Promise.all([getEventDataAndPostReport(eventId, report), deleteSlackBoolean])
  }
  else {
    return deleteSlackBoolean
  }
}

function getFakeRequest(eventSnapshot) {
  return {query: {id: eventSnapshot.val().publishedEventId}};
}

function getSlackPostingResponse(report) {
  return {
    send: function (event) {
      return request.post(slackPostingUrl, {json: {text: getReportMessage(event, report)}});
    }
  };
}

function getEventDataAndPostReport(eventId, report) {
  return getEventPromise(eventId).then(eventSnapshot => {

    // TODO - Rewrite into normal promise with data
    let fakeRequest = getFakeRequest(eventSnapshot);
    let slackPostingResponse = getSlackPostingResponse(report);

    return frontendEventModule.getEvent(fakeRequest, slackPostingResponse)
  });
}


function getEventPromise(eventId) {
  return database.ref('events/' + eventId).once('value')
}

function getStringFromArray(item) {
  return item.map(item => item.name).join(', ');
}


function getReportMessage(event, report) {

  const ORGANIZERS_TITLE = '*Organizátoři:* ';
  const CHAPTERS_TITLE = '*Chaptery:* ';
  const ATTENDEES_TITLE = '*Počet účastníků:* ';
  const POSITIVES_TITLE = '\n*Co se povedlo:*\n';
  const NEGATIVES_TITLE = '\n*Co by se dalo zlepšit:*\n';
  const PHOTO_URL_TITLE = '\n*Odkaz na fotky:* ';
  const FEEDBACK_URL_TITLE = '\n*Odkaz na feedback:* ';

  let reportMessage = `*${event.name.toUpperCase()}*\n`;

  if (report.text) {
    reportMessage += report.text + '\n\n'
  }


  reportMessage += ORGANIZERS_TITLE + getStringFromArray(event.organizers) + '\n' +
    CHAPTERS_TITLE + getStringFromArray(event.chapters) + '\n' +
    ATTENDEES_TITLE + report.attendeesCount + '\n'
  ;

  if (report.positives) {
    reportMessage += POSITIVES_TITLE + report.positives + '\n'
  }

  if (report.negatives) {
    reportMessage += NEGATIVES_TITLE + report.negatives + '\n'
  }

  if (report.photoUrl) {
    reportMessage += PHOTO_URL_TITLE + report.photoUrl
  }

  if (report.feedbackUrl) {
    reportMessage += FEEDBACK_URL_TITLE + report.feedbackUrl
  }

  return reportMessage;

}
