describe("Firebase array", function () {

  var firebaseArray = require('../libs/firebase-array')

  describe("function getArrayFromKeyValue", function () {


    it("returns array of firebase objects", function () {
      var keyValue = {'1': {name: 'a'}, '2': {name: 'b'}}
      expect(firebaseArray.getArrayFromKeyValue(keyValue)).toEqual([{name: 'a'}, {name: 'b'}])
    })


  });
});
