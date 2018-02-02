describe("Firebase array", function () {

  var firebaseArray = require('../libs/firebase-array')

  describe("function getArrayFromKeyValue", function () {


    it("returns array of firebase objects", function () {
      var keyValue = {'1': {name: 'a'}, '2': {name: 'b'}}
      expect(firebaseArray.getArrayFromKeyValue(keyValue)).toEqual([{urlId: '1', name: 'a'}, {urlId: '2', name: 'b'}])
    })


  });

  describe("function getArrayFromIdList", function () {


    it("returns array of IDs", function () {
      var idList = {'gdg-brno': true, 'gdg-jihlava': true}
      expect(firebaseArray.getArrayFromIdList(idList)).toEqual(['gdg-brno', 'gdg-jihlava'])
    })

    it("remove 'id: false' items", function () {
      var idList = {'gdg-brno': true, 'gdg-jihlava': false}
      expect(firebaseArray.getArrayFromIdList(idList)).toEqual(['gdg-brno'])
    })

    it("skip strange items", function () {
      var idList = {'gdg-brno': true, 'a2-workshop': {name: 'A2 Workshop'}}
      expect(firebaseArray.getArrayFromIdList(idList)).toEqual(['gdg-brno'])
    })


  });
});
