exports.getArrayFromKeyValue = function (keyValue) {
  return Object.keys(keyValue).map(function (key) {
    return keyValue[key];
  });
}
