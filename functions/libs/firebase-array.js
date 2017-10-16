exports.getArrayFromKeyValue = function (keyValue) {
  return Object.keys(keyValue).map(function (key) {
    return keyValue[key];
  });
}

exports.getArrayFromIdList = function (list) {
  return Object.keys(list).map(function(key) {
    if (list[key] === true) // Remove "id: false" items
      return key
  }).filter(id => id)
}
