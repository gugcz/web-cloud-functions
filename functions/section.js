exports.getSections = function (request, response, database) {


    let sectionsPromise = database.ref('sections').once('value');

    sectionsPromise.then(sectionsSnapshot => sendOrderedSectionsInfo(sectionsSnapshot));

    function sendOrderedSectionsInfo(sectionsSnapshot) {
        let sections = sectionsSnapshot.val();


        response.send(sections)
    }
}