const file = require('../libs/file')

describe("A getFileSuffix", function () {



  it("remove file name and return only suffix", function () {
    expect(file.getFileSuffix('cover.jpg')).toBe('.jpg');
    expect(file.getFileSuffix('cover2.png')).toBe('.png');
    expect(file.getFileSuffix('cover3')).nothing();
  })

});
