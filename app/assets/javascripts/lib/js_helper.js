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

function isNumber(v) {
  return !isNaN(v);
}


// A
// select stylesheet by title
// already loaded stylesheets are activated / deactivated
function activateStyleSheet(title, active) {
  if (!$defined(active)) {
    active = true;
  }
  var i;
  if(document.styleSheets) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].title === title) {
        document.styleSheets[i].disabled = !active;
      };
    };
  };
}

function changeActiveStyleSheet(previous, next) {
  activateStyleSheet(previous, false);
  activateStyleSheet(next, true);
}


// B
// select stylesheet by url
// a link is added to the header -> autoloaded immediately??
// to be tested
function changeStyle(url) {
  var _head = document.getElementsByTagName('head')[0];
  var _link = document.createElement('link');
  _link.type = 'text/css';
  _link.href = url; // form1.color.options[form1.color.selectedIndex].value;
  _link.rel = 'stylesheet';
  _head.appendChild(_link);
}

