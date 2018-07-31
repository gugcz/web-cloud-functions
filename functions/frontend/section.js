const database = require('../libs/database').database // TODO Mock for test

exports.getSections = function (request, response) {


  let sectionsPromise = database.ref('sections').once('value');

  sectionsPromise.then(sectionsSnapshot => response.send(sectionsSnapshot.val()));

}

exports.getSection = function (request, response) {
  let sectionId = request.query.id;
  if (!sectionId) {
    response.status(400).send("Section ID not found!");
  }

  let sectionPromise = database.ref('sections/' + sectionId).once('value');

  sectionPromise.then(sectionSnapshot => response.send(sectionSnapshot.val()))
}
