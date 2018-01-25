exports.formatChapterData = chapterData => ({
  name: chapterData.name || '',
  section: chapterData.section || '',
  description: chapterData.description || '',
  cover: chapterData.cover || '',
  email: chapterData.email || '',
  links: chapterData.links || []
})

exports.chapterButtonMap = chapterData => ({
    id: chapterData.urlId,
    name: chapterData.name,
    logo: chapterData.logo || ''
})
