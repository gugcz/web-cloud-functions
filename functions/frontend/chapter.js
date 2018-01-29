const chapterLib = require('../libs/chapter')
const firebaseArrayLib = require('../libs/firebase-array')
const database = require('../libs/database').database;

exports.getChapter = function (request, response, database) {
  let chapterId = request.query.id;

  if (!chapterId) {
    response.status(400).send("Chapter ID not found!");
  }

  getChapterRef(chapterId).once('value').then(chapterSnapshot => response.send(
    chapterLib.formatChapterData(chapterSnapshot.val()))
  );
}

exports.getChapters = function (request, response, database) {
  let section = request.query.section;

    if (!section) {
        response.status(400).send("Section not found!");
    }


    getChaptersFromSectionRef(section).once('value').then(chaptersSnapshot => response.send(
      firebaseArrayLib.getArrayFromKeyValue(chaptersSnapshot.val()).map(chapterLib.chapterButtonMap))
    );
}

function getChaptersFromSectionRef(sectionId) {
  return database.ref('chapters').orderByChild('section').equalTo(sectionId);
}

function getChapterRef(chapterId) {
  return database.ref('chapters/' + chapterId);
}



