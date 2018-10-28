const frontendEventModule = require('../frontend/event');
const slackPostingUrl = require('../config').slackPostingUrl;
const database = require('../libs/database').database;
const request = require('request')

exports.sendReportToSlack = function (change, context) {
  const report = change.after.val();

  // TODO - How to pass report var to callback function
  function callFrontendGetEventWithSlackPostingCallback(snapshot) {

    let fakeRequest = {query: {id: snapshot.val().publishedEventId}}
    let fakeResponse = {
      send: function (event) {

        return request.post(slackPostingUrl, {json: {text: getReportMessage(event, report)}})
      }
    }

    return frontendEventModule.getEvent(fakeRequest, fakeResponse)
  }

  return getEventPromise(context.params.eventId).then(callFrontendGetEventWithSlackPostingCallback)
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
