exports.getArrayFromKeyValue = function (keyValue) {
  keyValue = keyValue || {}
  return Object.keys(keyValue).map(function (key) {
    var keyValueObject = keyValue[key];
    keyValueObject.urlId = key
    return keyValueObject;
  });
}


exports.getArrayFromIdList = function (list) {
  list = list || {}
  return Object.keys(list).map(function(key) {
    if (list[key] === true) // Remove "id: false" items
      return key
  }).filter(id => id)
}
