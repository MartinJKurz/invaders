/****************************************************************
 * menu_test2
 ****************************************************************/

//= require lib/mootools-core-1.4.0-full-compat
//= require lib/log
//= require lib/js_helper
//= require lib/menus

/*
 * testing a hierarchy of menus,
 *
 *
 * settings
 *  style
 * texts
 *  political
 *  controvery
 * recipies
 *  meat
 *    chicken
 *    beef
 *    pig
 *  vegetarian
 *    apples
 *    oranges
 * music
 *  classical
 *  ballads
 *  loud
 *  punk
 * applications
 *  invaders
 *  pong
 *
 *
 * 1. 
 */

var App = new Class({

  // standard callback method for menus
  menuSelection: function(type, menu) {
    var idx = menu.selectedId;
    var it = menu.items[idx];
    Logger.log('Selected: ' + idx + ' ' + it.text);
    if ($defined(it.check)) {
      Logger.log('CHECKBOX: ' + it.checked);
    }
    if (it.action) {
      if (it.args) {
        it.action.apply(this, it.args);
      } else {
        it.action();
      }
    }
  },
  
  initialize: function() {
    // main menu
    var items = [
      {text: 'Main Menu', caption: true},
      {text: 'Settings', submenu: 'settings'},
      {text: 'Texts', submenu: 'texts'},
      {text: 'Recipies', submenu: 'recipies'},
      {text: 'Music', submenu: 'music'},
      {text: 'Applications', submenu: 'applications'},
    ];
    var options = {fixedFontSize: 30};
    this.textLoader = new TextLoader();

    this.mainMenu = Pages.createSplashMenu(null, 'main', items, options, {obj:this, method:'menuSelection'});

    this._createSettingsMenu(this.mainMenu);

    Pages.showPage(this.mainMenu);

    this.textLoader.loadArticleList(this.receiveArticleList.bind(this));
  },

  _createSettingsMenu: function(parentMenu) {
    var items = [
      {text: 'Settings Menu', caption: true},
      {text: 'Styles', submenu: 'styles'},
    ];
    var options = {};
    this.settingsMenu = Pages.createSplashMenu(parentMenu, 'settings', items, options, {obj:this, method:'menuSelection'});

    this._createStylesMenu(this.settingsMenu);
  },

  _createStylesMenu: function(parentMenu) {
    var i, n, sn;
    items = [
      {text: 'Styles Menu', caption: true},
    ];
    this.styles = getAlternateStyleSheetNames();
    n = this.styles.length;
    for (i=0; i<n; i++) {
      sn = this.styles[i];
      items.push({text: sn, action: setActiveStyleSheet, args: [i]});
    }
    var options = {};
    this.stylesMenu = Pages.createSplashMenu(parentMenu, 'styles', items, options, {obj:this, method:'menuSelection'});
  },

  _createTextsMenu: function(parentMenu) {
    var key;
    var items = [
      {text: 'Texts Menu', caption: true},
    ];
    var i;
    for (key in this.theTexts) {
      if (this.theTexts.hasOwnProperty(key)) {
        //items.push({text: this.theTexts[key].title, action: this.showText, args: [this.theTexts[key]]});
        items.push({text: this.theTexts[key].title, action: this.showText, args: [key]});
      }
    }
    var options = {};
    this.textsMenu = Pages.createSplashMenu(parentMenu, 'texts', items, options, {obj:this, method:'menuSelection'});
  },

  /*
   * TODO:
   * 1. store as json data            - todo: create editor
   * 1.b store sample as json         - ok
   * 2. get json                      - ok
   * 3. create html from data         - ok
   * 4. prepare for mobile scrolling  - ok
   * 5. method for mobile scrolling   - ok
   * 6. use text style                - ok
   */
  receiveTextObject: function(obj) {
    this.theTexts[obj.id] = obj;
    this.showText(obj.id);
  },
  showText: function(key) {
    var obj = this.theTexts[key];
    console.log('showText');
    if (!obj.content) {
      console.log('showText - no content');
      this.textLoader.loadArticle(key, this.receiveTextObject.bind(this));
      return;
    }

    if (!obj.page) {
      console.log('showText - no page');
      obj.page = Pages.createTextPage(
        this.textsMenu,
        obj.title,
        obj.content,
        {});
      // this.theTexts[obj.id] = obj;
      this.theTexts[obj.id].page = obj.page;
    }

    this.displayText(obj);
  },

  displayText: function(obj) {
    Pages.showSubMenu(obj.page);
  },
  // new: load texts from database
  theTexts: {}, // each element: {id, title, content}

  receiveArticleList: function(list) {
    for (i=0; i<list.length; i++) {
      this.theTexts[list[i].id] = list[i];
    }
    this._createTextsMenu(this.mainMenu);
  },
});


/*
var EditTextApp = new Class({
  initialize: function(key) {
    TextLoader.loadArticle(key, this.receiveTextObject.bind(this));
    
    this.leftSide = new Element('div');
    this.leftSide.style.backgroundColor= 'blue';
    this.leftSide.style.width= '50%';
    this.leftSide.style.height = '100%';
    this.leftSide.style.float= 'left';
    this.leftSide.style.overflow = 'scroll';

    this.table = new Element('table');
    this.table.style.width = '100%';
    this.leftSide.appendChild(this.table);


/*
    this.editDiv = new Element('div');
    this.editDiv.style.backgroundColor= 'green';
    this.editDiv.style.width= '20%';
    this.editDiv.style.height = '100%';
    // this.editDiv.style.float= 'left';
    this.editDiv.style.overflow = 'scroll';
    // this.editDiv.style.position = 'absolute';
    // this.editDiv.style.left = 0;
    //
* /
    this.textDiv = new Element('div');
    this.textDiv.style.backgroundColor= 'white';
    this.textDiv.style.width= '50%';
    this.textDiv.style.height = '100%';
    this.textDiv.style.float= 'right';
    this.textDiv.style.overflow = 'scroll';
    // this.textDiv.style.position = 'absolute';
    // this.textDiv.style.left = window.innerWidth * 0.5;

    document.body.appendChild(this.leftSide);
    // document.body.appendChild(this.editDiv);
    document.body.appendChild(this.textDiv);
  },
  receiveTextObject: function(obj) {
    this.article = JSON.decode(obj.content); // tbr
    this.html = TextLoader.objToHTML(this.article);
    // TextLoader.prepareTextHTML(this.html, this.scrollTo.bind(this));
    TextLoader.prepareTextHTML(this.html, this.scrollTo2.bind(this));
    Logger.hide();
    this.showText();
    // this.createEditor();
    this.editor = TextLoader.objToHTML(this.article,
      this.createEditorElement.bind(this),
      this.addEditorElement.bind(this),
      this.addEditorText.bind(this));

    // this.editDiv.appendChild(this.editor);
  },
  createEditorElement: function(depth, tagName) {
    
    function makeSelectable(e) {
      e.setStyle('user-select', 'text');
      e.setStyle('-webkit-user-select', 'text');
      e.setStyle('-moz-user-select', 'text');
      e.setStyle('-o-user-select', 'text');
      e.setStyle('-khtml-user-select', 'text');
    }
    
    var e, e2, f, i;
    switch (tagName) {
      case 'article':
      case 'header':
      case 'nav':
        // e = document.createElement('div');
        e = new Element('div');
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        e = document.createElement('input');
        e.type = 'edit';
        e.style.width = '100%';
        break;
      case 'p':
        e = document.createElement('textarea');
        e.style.width = '100%';
        break;
      default:
        //e = document.createElement('label');
        // e.textContent = 'TODO: ' + tagName;
        e = document.createElement('div');
        e.style.width = '100%';
        e.innerHTML = 'TODO: ' + tagName;
        e.style.backgroundColor = 'red';
        break;
    }

    makeSelectable(e);

    e2 = new Element('button');
    e2.style.width = '100%';
    e2.style.textAlign = 'left';
    f = '';
    for (i=0; i<depth; i++) {
      f += '_';
    }
    e2.innerHTML = f + tagName;
    var tr = new Element('tr');
    this.table.appendChild(tr);
    var li = new Element('td');

    li.align = 'right';
    li.style.verticalAlign = 'top';

    tr.appendChild(li);
    li.appendChild(e2);

    li = new Element('td');

    li.style.verticalAlign = 'top';

    tr.appendChild(li);
    li.appendChild(e);

    //this.leftSide.appendChild(e2);

    return e;
    // return document.createElement(tagName);
  },
  addEditorElement: function(pel, el) {
    //pel.appendChild(el);
  },
  addEditorText: function(el, t) {
    if ('INPUT' === el.tagName) {
      el.value = t;
      //el.textContent = t;
    } else {
      el.innerHTML = t;
    }
  },


  /*
   * NO!
   * Editor must be created as the html is created
   * /
  createEditor_uu: function() {
    function print(el, depth) {
      var f = '', i;
      for (i=0; i<depth; i++) {
        f += ' ';
      }
      if (el.tagName) {
        console.log(f + el.tagName);
      } else {
        console.log(f + el.data);
      }
      for (i=0; i<el.childNodes.length; i++) {
        print(el.childNodes[i], depth+1);
      }
    }
    function traverse(el, le, depth) {
      var f = '', i, ee;
      for (i=0; i<depth; i++) {
        f += ' ';
      }
      if (el.tagName) {
        console.log(f + el.tagName);
        switch (el.tagName) {
          case 'ARTICLE':
            
            break;
          case 'HEADER':
            ee = new Element('div');
            
            break;
          case 'H1':
            ee = new Element('input', {type: 'edit'});
            break;
          case 'H2':
            ee = new Element('input', {type: 'edit'});
            
            break;
          case 'UL':
            
            break;
          case 'LI':
            
            break;
          case 'SECTION':
            
            break;
          case 'P':
            ee = new Element('textarea');
            
            break;
        }
        if (ee) {
          le.appendChild(ee);
        } else {
          ee = le;  // TBR
        }
      } else {
        console.log(f + el.data);
        le.value = el.data;
      }
      for (i=0; i<el.childNodes.length; i++) {
        traverse(el.childNodes[i], ee, depth+1);
      }
    }
    traverse (this.html, this.editDiv, 0);
  },
  setYPosition: function(el, y) {
    el.style.top = y;
  },
  scrollTo: function(ev) {
    var id = ev.target.getAttribute('target');
    var el = this.html.getElementById(id);
    var y = -parseFloat(el.offsetTop);
    this.setYPosition(this.textDiv, y);
  },
  scrollTo2: function(ev) {
    var id = ev.target.getAttribute('target');
    var el = this.html.getElementById(id);
    var y = parseFloat(el.offsetTop);
    this.textDiv.scrollTo(0, y);
  },
  showText: function() {
    this.textDiv.innerHTML = '';
    this.textDiv.appendChild(this.html);
  }
});
*/

var EditTextApp = new Class({
  elements: {},
  reverseElements: {},
  articleElements: {},

  initialize: function(key) {
    this.textLoader = new TextLoader();

    this.textLoader.setCallbacks(
      this.createEditorElement.bind(this),
      this.addEditorElement.bind(this),
      this.addEditorText.bind(this));

    this.textLoader.loadArticle(key, this.receiveTextObject.bind(this));
    
    this.leftSide = new Element('div');
    this.leftSide.style.backgroundColor= 'blue';
    this.leftSide.style.width= '50%';
    this.leftSide.style.height = '100%';
    this.leftSide.style.float= 'left';
    this.leftSide.style.overflow = 'scroll';

    this.table = new Element('table');
    this.table.style.width = '100%';
    this.leftSide.appendChild(this.table);


    this.textDiv = new Element('div');
    this.textDiv.style.backgroundColor= 'white';
    this.textDiv.style.width= '50%';
    this.textDiv.style.height = '100%';
    this.textDiv.style.float= 'right';
    this.textDiv.style.overflow = 'scroll';

    document.body.appendChild(this.leftSide);
    document.body.appendChild(this.textDiv);
  },
  receiveTextObject: function(obj) {
    Logger.hide();

    this.article = JSON.decode(obj.content); // tbr

    this.html = this.textLoader.objToHTML(this.article);
    //this.editor = this.textLoader.objToHTML(this.article);
    this.textLoader.prepareTextHTML(this.html, this.scrollTo2.bind(this));
    this.showText();



  },
  /*
  receiveTextObject: function(obj) {
    this.article = JSON.decode(obj.content); // tbr
    this.html = this.textLoader.objToHTML(this.article);
    this.textLoader.prepareTextHTML(this.html, this.scrollTo2.bind(this));
    Logger.hide();
    this.showText();

    this.textLoader.setCallbacks(
      this.createEditorElement.bind(this),
      this.addEditorElement.bind(this),
      this.addEditorText.bind(this));


    this.editor = this.textLoader.objToHTML(this.article,
      this.createEditorElement.bind(this),
      this.addEditorElement.bind(this),
      this.addEditorText.bind(this));
  },
  */
  //createEditorElement: function(depth, articleEl, tagName) {
  __uid__: 1,
  createEditorElement: function(depth, el, articleElement, tagName) {

    // var tagName = el.tagName.toLowerCase();
    
    function makeSelectable(e) {
      e.setStyle('user-select', 'text');
      e.setStyle('-webkit-user-select', 'text');
      e.setStyle('-moz-user-select', 'text');
      e.setStyle('-o-user-select', 'text');
      e.setStyle('-khtml-user-select', 'text');
    }
    
    var e, e2, f, i;
    switch (tagName) {
      case 'article':
      case 'header':
      case 'nav':
        // e = document.createElement('div');
        e = new Element('div');
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        e = document.createElement('input');
        e.addEventListener('change', this.inputValueChanged.bind(this));
        e.type = 'edit';
        e.style.width = '100%';
        break;
      case 'p':
        e = document.createElement('textarea');
        e.style.width = '100%';
        break;
      default:
        //e = document.createElement('label');
        // e.textContent = 'TODO: ' + tagName;
        e = document.createElement('div');
        e.style.width = '100%';
        e.innerHTML = 'TODO: ' + tagName;
        e.style.backgroundColor = 'red';
        break;
    }

    makeSelectable(e);
    e.uid = this.__uid__++;
    this.elements[el.uid] = e;
    this.reverseElements[e.uid] = el;
    this.articleElements[e.uid] = articleElement;

    e2 = new Element('button');
    e2.style.width = '100%';
    e2.style.textAlign = 'left';
    f = '';
    for (i=0; i<depth; i++) {
      f += '_';
    }
    e2.innerHTML = f + tagName;
    var tr = new Element('tr');
    this.table.appendChild(tr);
    var li = new Element('td');

    li.align = 'right';
    li.style.verticalAlign = 'top';

    tr.appendChild(li);
    li.appendChild(e2);

    li = new Element('td');

    li.style.verticalAlign = 'top';

    tr.appendChild(li);
    li.appendChild(e);

    //this.leftSide.appendChild(e2);

    return e;
    // return document.createElement(tagName);
  },
  inputValueChanged: function(ev) {

    // unfinished:
    // now: changes in tree are changing the displayed document directly
    // todo: changes in tree must change the article, which then change the displayed document via notification
    //
    // building the editor:
    // now: direct callback
    // todo: TextHandler is Emitter, emitting 'createElement', 'addElement', 'addElementText'
    //    this class is a Receiver

    var e = ev.target;
    var val = e.value;

    // not ok: strings are stored in articleElements, instead of objects
    // -> artuicle is already stored, wen need the path
    // TESTING
    var test = {
      one: {
        two: {
          three: 17
        }
      }
    };
    var test2 = test.one.two.three;
    var test3 = test['one'].two.three;
    var test4 = test['one']['two'].three;
    var test5 = test['one']['two']['three'];

    // TESTING

    //var ae = this.articleElements[e.uid];
    //ae.setText(val);
    // var path = this.paths[];
    // var ae = this.article[path] = val;

    var re = this.reverseElements[e.uid];
    re.textContent = val;
  },
  addEditorElement: function(pel, el) {
    //pel.appendChild(el);
  },
  addEditorText: function(el, t) {
    var e = this.elements[el.uid];
    if (!$defined(e)) {
      return;
    }
    if ('INPUT' === e.tagName) {
      e.value = t;
      //el.textContent = t;
    } else {
      e.innerHTML = t;
    }
  },

  setYPosition: function(el, y) {
    el.style.top = y;
  },
  scrollTo: function(ev) {
    var id = ev.target.getAttribute('target');
    var el = this.html.getElementById(id);
    var y = -parseFloat(el.offsetTop);
    this.setYPosition(this.textDiv, y);
  },
  scrollTo2: function(ev) {
    var id = ev.target.getAttribute('target');
    var el = this.html.getElementById(id);
    var y = parseFloat(el.offsetTop);
    this.textDiv.scrollTo(0, y);
  },
  showText: function() {
    this.textDiv.innerHTML = '';
    this.textDiv.appendChild(this.html);
  }
});


window.addEvent('domready', function() {
  var timer = new OneTimer(1000);     // android needs a delay to get window.innerWidth / ..Height right
  var starter = {
    cb: function(type, timer) {
      var app;
      if (Math.random() < 0.5) {
        app = new App();
      } else {
        app = new EditTextApp('7');
      }
    }
  }
  timer.addReceiver(starter, 'finished');
  timer.start();
});
