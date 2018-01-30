const EventSection = require('../libs/event/event-section')

describe('EventSection function getEventSection', function () {
  const getEventSection = EventSection.getEventSection

  it('returns section for single chapter event', function () {
    let chaptersAndSection = [
      {
        chapters: {
          'gdg-brno': true
        },
        section: 'gdg'
      },{
        chapters: {
          'gbg-brno': true
        },
        section: 'gbg'
      },{
        chapters: {
          'geg-brno': true
        },
        section: 'geg'
      },{
        chapters: {
          'gxg-brno': true
        },
        section: 'gxg'
      },
    ];

    chaptersAndSection.forEach(chapterAndSection => expect(getEventSection(chapterAndSection.chapters)).toBe(chapterAndSection.section))


  })

  it('returns section for event with chapters with same section', function () {
    let chaptersAndSection = [
      {
        chapters: {
          'gdg-brno': true,
          'gdg-jihlava': true
        },
        section: 'gdg'
      },{
        chapters: {
          'gbg-brno': true,
          'gbg-jihlava': true
        },
        section: 'gbg'
      },{
        chapters: {
          'geg-brno': true,
          'geg-jihlava': true
        },
        section: 'geg'
      },{
        chapters: {
          'gxg-brno': true,
          'gxg-jihlava': true
        },
        section: 'gxg'
      },
    ];

    chaptersAndSection.forEach(chapterAndSection => expect(getEventSection(chapterAndSection.chapters)).toBe(chapterAndSection.section))


  })

  it('returns section of most chapters for event with chapters with 2:1 sections', function () {
    let chaptersAndSection = [
      {
        chapters: {
          'gdg-brno': true,
          'gdg-jihlava': true,
          'gbg-jihlava': true,
        },
        section: 'gdg'
      },{
        chapters: {
          'gbg-brno': true,
          'gbg-jihlava': true,
          'gdg-jihlava': true,
        },
        section: 'gbg'
      },{
        chapters: {
          'geg-brno': true,
          'geg-jihlava': true,
          'gdg-jihlava': true,
        },
        section: 'geg'
      },{
        chapters: {
          'gxg-brno': true,
          'gxg-jihlava': true,
          'gdg-jihlava': true,
        },
        section: 'gxg'
      },
    ];

    chaptersAndSection.forEach(chapterAndSection => expect(getEventSection(chapterAndSection.chapters)).toBe(chapterAndSection.section))


  })

  it('returns section of alphabet order chapter for event with chapters with 1:1 sections', function () {

    // Firebase ordering keys by alphabet order
    let chaptersAndSection = [
      {
        chapters: {
          'gbg-jihlava': true,
          'gdg-brno': true,
          'geg-jihlava': true,
        },
        section: 'gbg'
      },{
        chapters: {
          'gbg-jihlava': true,
          'geg-jihlava': true,
          'gxg-brno': true,
        },
        section: 'gbg'
      },{
        chapters: {
          'geg-jihlava': true,
          'gxg-jihlava': true,
        },
        section: 'geg'
      },{
        chapters: {
          'gdg-jihlava': true,
          'geg-jihlava': true,
          'gxg-brno': true,
        },
        section: 'gdg'
      },
    ];

    chaptersAndSection.forEach(chapterAndSection => expect(getEventSection(chapterAndSection.chapters)).toBe(chapterAndSection.section))


  })
})
