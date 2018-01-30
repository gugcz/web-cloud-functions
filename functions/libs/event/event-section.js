exports.getEventSection = function (chapters) {
  let chapterIds = Object.keys(chapters).reverse() // Reverse because of alphabet order
  let counts = {};
  chapterIds.map(chapterId => chapterId.substring(0, 3)).forEach(function(i) { counts[i] = (counts[i]||0) + 1;});
  return Object.keys(counts).sort((firstId, secondId) => counts[firstId] - counts[secondId]).pop();
}
