/****************************************************************
 * js_helper
 ****************************************************************/
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

function isInt(val) {
  return (val.toString().search(/^-?[0-9]+$/) == 0);
}



/*

activates / deactivates dedicated ss
-> use setActiveStyleSheet instead
 *
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
*/

// B
// select stylesheet by url - active stylessheets are NOT deactivated
// a link is added to the header -> autoloaded immediately??
// to be tested
function addStyle(url) {
  var _head = document.getElementsByTagName('head')[0];
  var _link = document.createElement('link');
  _link.type = 'text/css';
  _link.href = url; // form1.color.options[form1.color.selectedIndex].value;
  _link.rel = 'stylesheet';
  _head.appendChild(_link);
}

// implememts the - quite old - w3c recommendation for style selection:
// all stylesheets with title are processed;
// the ones with the correct title are enabled, the others are disabled
var __styleNames__;
function setActiveStyleSheet(title) {
  var i, a;
  if (isInt(title)) {
    if (!$defined(__styleNames__)) {
      __styleNames__ = getAlternateStyleSheetNames();
    }
    title = __styleNames__[title];
  }
  for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
      a.disabled = true;
      if(a.getAttribute("title") == title) {
        a.disabled = false;
      }
    }
  }
}

// get a list of titles:
function getAlternateStyleSheetNames() {
  var i, a, title, titles = [];
  for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
      title = a.getAttribute("title");
      if (!titles.contains(title)) {
        titles.push(title);
      }
    }
  }
  return titles;
}
