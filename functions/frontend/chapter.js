exports.getChapter = function(request, response, database) {
    let chapterId = request.query.id;

    if (!chapterId) {
        response.status(400).send("Chapter ID not found!");
    }

    let chapterPromise = database.ref('chapters/' + chapterId).once('value');

    chapterPromise.then(chapterSnapshot => sendChapterInfo(chapterSnapshot));

    function sendChapterInfo(chapterSnapshot) {
        let chapter = chapterSnapshot.val();

        response.send({
            name: chapter.name,
            section: chapter.section,
            description: chapter.description,
            email: chapter.email,
            links: chapter.links
        })
    }
}

exports.getChapters = function(request, response, database) {
    let section = request.query.section;

    if (!section) {
        response.status(400).send("Section not found!");
    }

    let chapterPromise = database.ref('chapters').orderByChild('section').equalTo(section).once('value');

    chapterPromise.then(chapterSnapshot => sendChapterInfo(chapterSnapshot));

    function sendChapterInfo(chapterSnapshot) {
        let chapters = chapterSnapshot.val();
        console.log(chapters)
        var chaptersArray = Object.keys(chapters).map(function (k) {
            var chapter = chapters[k]
            chapter.id = k
            return chapter
        });

        var filteredChaptersArray = chaptersArray.map(function filterChaptersArray(chapter) {
            if (chapter.images) {
              return {
                id: chapter.id,
                name: chapter.name,
                logo: chapter.images.header
              }
            }

            return {
                id: chapter.id,
                name: chapter.name
            }
        })

        response.send(filteredChaptersArray)
    }
}
