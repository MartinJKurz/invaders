/*
function clone(obj) {
  if(obj == null || typeof(obj) != 'object') {
    return obj;
  }

  var temp = obj.constructor();

  for(var key in obj) {
    temp[key] = clone(obj[key]);
  }

  return temp;
}
*/

Object.prototype.keys = function () {
  var keys = [];
  for(var i in this) {
    if (this.hasOwnProperty(i)) {
      keys.push(i);
    }
  }
  return keys;
}


