const formatOrganizerItem = require('../libs/organizer').formatOrganizerItem

describe("A formatOrganizerItem -", function () {


  describe("return data object with name, profile picture and links", function () {
    it("copy same data to new object", function () {
      let org = {
        name: 'Matěj Horák',
        profilePicture: 'url',
        links: [{
          type: 'web',
          url: 'www.horm.cz'
        }]
      }

      let copiedOrg = formatOrganizerItem(org)

      expect(copiedOrg).toEqual({
        name: 'Matěj Horák',
        profilePicture: 'url',
        links: [{
          type: 'web',
          url: 'www.horm.cz'
        }]
      })
    })

    it("removes secret data and data whose are not necessary", function () {
      let org = {
        name: 'Matěj Horák',
        profilePicture: 'url',
        links: [{
          type: 'web',
          url: 'www.horm.cz'
        }],
        email: 'test@test.cz'
      }

      let copiedOrg = formatOrganizerItem(org)

      expect(copiedOrg).toEqual({
        name: 'Matěj Horák',
        profilePicture: 'url',
        links: [{
          type: 'web',
          url: 'www.horm.cz'
        }]
      })
    })

    it("in case of undefiend replace by empty data", function () {
      let org = {
        name: 'Matěj Horák',
        profilePicture: undefined,
        email: 'test@test.cz'
      }

      let copiedOrg = formatOrganizerItem(org)

      expect(copiedOrg).toEqual({
        name: 'Matěj Horák',
        profilePicture: '',
        links: []
      })
    })


  })
  it("in case of null replace by empty data", function () {
    let org = {
      name: 'Matěj Horák',
      profilePicture: null,
      links: null,
      email: 'test@test.cz'
    }

    let copiedOrg = formatOrganizerItem(org)

    expect(copiedOrg).toEqual({
      name: 'Matěj Horák',
      profilePicture: '',
      links: []
    })
  })


})
