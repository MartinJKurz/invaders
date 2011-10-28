/****************************************************************
 * menus
 ****************************************************************/

//= require lib/dragable
//= require lib/font_helper
//= require lib/text_loader

/*global Class, Emitter, TextLoader, Pages, Element, $defined, $$, TM, Logger, Dragable, Drag, DragManager, $type, isNumber, VectorInterpolator, IntervalTimer */
"use strict";

var DT = 1000 / 60;

var BACK_BUTTON_WIDTH = 0.1;


var TextObjectPage = new Class({
  Extends: Emitter,

  content: null,
  name: null,

  // article is a object, must be transformed to a html structure first
  initialize: function(parentMenu, name, article, options) {

    article = JSON.decode(article); // tbr

    var textLoader = new TextLoader();

    this.contentContainer = textLoader.objToHTML(article);
    textLoader.prepareTextHTML(this.contentContainer, Pages.scrollTo.bind(Pages));



    this.parentMenu = parentMenu;
    this.name = name;

    //var box;
    //var obj, method;

    // this.contentContainer.style.backgroundColor = 'red';
    //this.contentContainer.style.margin = 0;
    //this.contentContainer.style.padding = 0;

    /* set in style sheet
    this.opts = {
      fontFamily: 'Arial',
      fontSize: 30,       // starting point for font size search
      fontMinSize: 30,    // lower limit: no smaller font
      fontWeight: 'normal',
      fixedFontSize: options.fixedFontSize
    }
    this.contentContainer.style.fontFamily = this.opts.fontFamily;
    this.contentContainer.style.fontSize = this.opts.fontSize;
    this.contentContainer.style.fontWeight = this.opts.fontWeight;
    */

    // this.contentContainer.innerHTML = this.content;

    this.resize();
  },

  resize: function() {
    /*
    var fs;
    if (this.opts.fixedFontSize) {
      fs = this.opts.fixedFontSize;
    } else {
      if (this.used_width === window.innerWidth && this.used_height === window.innerHeight) {
        return;
      }
      this.used_width = window.innerWidth;
      this.used_height = window.innerHeight;
      fs = window.innerWidth * 0.05;
    }
    */

    if (Pages.pageDiv.el.hasChild(this.contentContainer)) {
      this.contentContainer.style.minHeight = 0;
      // this.contentContainer.setStyle('font-size', fs);

      this.contentContainer.style.minHeight = Pages.pageDiv.el.offsetHeight;
    }
  },

  el: function() {
    return this.contentContainer;
  }
});


var TextPage = new Class({
  Extends: Emitter,

  content: null,
  name: null,

  // content is html text, to be used as innerHTML
  initialize: function(parentMenu, name, content, options) {
    this.parentMenu = parentMenu;
    this.name = name;
    this.content = content;

    this.contentContainer = new Element('p');
    // this.contentContainer.style.backgroundColor = 'red';
    this.contentContainer.style.margin = 0;
    this.contentContainer.style.padding = 0;

    this.opts = {
      fontFamily: 'Arial',
      fontSize: 30,       // starting point for font size search
      fontMinSize: 30,    // lower limit: no smaller font
      fontWeight: 'normal',
      fixedFontSize: options.fixedFontSize
    };

    this.contentContainer.style.fontFamily = this.opts.fontFamily;
    this.contentContainer.style.fontSize = this.opts.fontSize;
    this.contentContainer.style.fontWeight = this.opts.fontWeight;

    this.contentContainer.innerHTML = this.content;

    this.resize();
  },

  resize: function() {
    var fs;
    if (this.opts.fixedFontSize) {
      fs = this.opts.fixedFontSize;
    } else {
      if (this.used_width === window.innerWidth && this.used_height === window.innerHeight) {
        return;
      }
      this.used_width = window.innerWidth;
      this.used_height = window.innerHeight;
      fs = window.innerWidth * 0.05;
    }

    if (Pages.pageDiv.el.hasChild(this.contentContainer)) {
      this.contentContainer.style.minHeight = 0;
      this.contentContainer.setStyle('font-size', fs);

      this.contentContainer.style.minHeight = Pages.pageDiv.el.offsetHeight;
    }
  },

  el: function() {
    return this.contentContainer;
  }
});


var SplashMenu = new Class({
  Extends: Emitter,

  table: null,
  name: null,

  initialize: function(parentMenu, name, items, options, cb) {
    this.parentMenu = parentMenu;
    this.name = name;
    this.items = items;
    var
      i, tr, b, chk, lab, uncheckedImg,
      localClick, getTarget, toggleCheckButton, setStandardMenuElement,
      setActiveMenuElement, setPassiveMenuElement,
      it, checkedImg;

    this.fixed = options.fixed ? true : false;
    this.vcentered = options.vcentered ? true : false;

    this.table = new Element('table');
    if (options.classes) {
      this.table.addClass(options.classes);
    }
    this.table.setAttribute('cellspacing', '0');
    this.elements = [];

    getTarget = function(ev) {
      var t = ev.target;
      while (!t.hasClass('menu-button')) {
        t = t.parentNode;
      }
      return t;
    };

    localClick = function(ev) {
      var
        it,
        t = getTarget(ev);

      if (!Pages.pageDiv.dragging) {
        this.selectedId = t.id.toInt();
        it = this.items[this.selectedId];
        if (it.submenu) {
          Pages.showSubMenu(it.submenu);
        } else if (it.mainmenu) {
          Pages.showMainMenu();
        } else if (it.caption) {
          // nothing
        } else {
          this.notify('selected', this);
        }
      }
    };

    this.opts = {
      fontFamily: 'Arial',
      fontSize: 30,       // starting point for font size search
      fontMinSize: 30,    // lower limit: no smaller font
      fontWeight: 'bold',
      fixedFontSize: options.fixedFontSize
    };

    toggleCheckButton = function(ev) {
      if (Pages.pageDiv.dragging) {
        return;
      }
      var
        b = getTarget(ev),
        idx = b.id.toInt(),
        it = this.items[idx],
        c = b.getAttribute('checked');
      if ('true' === c) {
        b.setAttribute('checked', 'false');
        it.checked = false;
      } else {
        b.setAttribute('checked', 'true');
        it.checked = true;
      }
    };

    setStandardMenuElement = function(el, opts) {
      el.addClass('menu-item');
      el.setStyle('font-family', opts.fontFamily);
      el.setStyle('font-style', opts.fontStyle);
      el.setStyle('font-variant', opts.fontVariant);
      el.setStyle('font-weight', opts.fontWeight);
    };

    setActiveMenuElement = function(el, context, opts) {
      setStandardMenuElement(el, opts);
      el.addClass('menu-button');
      el.addEventListener('click', toggleCheckButton.bind(context));
      el.addEventListener('click', localClick.bind(context));
    };

    setPassiveMenuElement = function(el, opts) {
      setStandardMenuElement(el, opts);
      el.addClass('menu-caption');
    };

    for (i = 0; i < items.length; i++) {
      it = items[i];
      tr = new Element('tr');
      this.table.appendChild(tr);

      chk = $defined(it.check);
      if (chk) {
        b = new Element('button');
        if (it.check) {
          b.setAttribute('checked', true);
          it.checked = true;
        } else {
          b.setAttribute('checked', false);
          it.checked = false;
        }
        b.addClass('menu-checkbox');
        // b.innerHTML = it.text;
        lab = new Element('label', {text: it.text});
        b.appendChild(lab);
        lab.style.verticalAlign = 'text-bottom';
        checkedImg = new Element('img');
        checkedImg.addClass('check-image');
        checkedImg.src = '../assets/checked.png';
        checkedImg.style.height = '30px';
        b.appendChild(checkedImg);
        uncheckedImg = new Element('img');
        uncheckedImg.addClass('uncheck-image');
        uncheckedImg.src = '../assets/unchecked.png';
        uncheckedImg.style.height = '30px';
        b.appendChild(uncheckedImg);
        setActiveMenuElement(b, this, this.opts);
      } else if (it.caption) {
        // b = new Element('h2', {text: it.text});
        b = new Element('button', {text: it.text});
        b.addClass('menu-caption');
        setPassiveMenuElement(b, this.opts);
      } else {
        b = new Element('button', {text: it.text});
        setActiveMenuElement(b, this, this.opts);
      }

      if (options.item_classes) {
        b.addClass(options.item_classes);
      }

      this.elements.push(b);
      b.id = i;
      tr.appendChild(b);
    }
    if (cb) {
      this.addReceiver(cb.obj, ['selected'], cb.method);
    }

    this.resize();
  },

  resize: function() {
    var font, tfont, b, box, fs, i;
    if (this.opts.fixedFontSize) {
      fs = this.opts.fixedFontSize;

      for (i = 0; i < this.items.length; i++) {
        b = this.elements[i];
        b.setStyle('font-size', fs);
      }

      $$('.check-image, .uncheck-image').each(function(el) {
        el.style.height = 1.25 * fs + 'px';
      });

      this.table.style.minHeight = Pages.pageDiv.el.offsetHeight;
    } else {
      if (this.used_width === window.innerWidth && this.used_height === window.innerHeight) {
        return;
      }
      this.used_width = window.innerWidth;
      this.used_height = window.innerHeight;

      box = {
        w: 0.95 * window.innerWidth,
        h: 50   // upper limit -> max px tall
      };

      for (i = 0; i < this.items.length; i++) {
        tfont = TM.findFontForSize(this.items[i].text, box, this.opts);
        if (!font || tfont.size < font.size) {
          font = tfont;
        }
      }

      for (i = 0; i < this.items.length; i++) {
        b = this.elements[i];
        b.setStyle('font-size', font.size);
      }

      $$('.check-image, .uncheck-image').each(function(el) {
        el.style.height = 1.25 * font.size + 'px';
      });

      Logger.log('Menu-FS: ' + font.size);

      this.table.style.minHeight = Pages.pageDiv.el.offsetHeight;
    }
  },

  el: function() {
    return this.table;
  }
});


var MenusClass = new Class({
  allMenus: {},
  currentPage: null,
  background: null,
  bgCtx: null,
  startX: -1,
  startY: -1,
  pageDiv: null,
  posIdx: 0,
  mPosX: 0,
  mPosY: 0,

  scrollTo: function(ev) {
    var tname, el, left;
    tname = ev.target.getAttribute('target');

    el = document.getElementById(tname);
    console.log(tname, el.offsetTop);

    left = parseFloat(this.pageDiv.el.style.left);
    this.pageDiv.setPosition(left, -parseFloat(el.offsetTop));
  },

  createDefaultBG: function() {
    var cw = 30, ch = 30,
      bg = new Element('canvas'),
      bgCtx = bg.getContext('2d');
    bg.width = cw;
    bg.height = ch;

    bgCtx.clearRect(0, 0, cw, ch);
    // this.bgCtx.fillStyle = 'rgba(255,255,255,0.5)';
    bgCtx.fillStyle = '#888';
    bgCtx.fillRect(0, 0, cw, ch);

    bgCtx.fillStyle = 'white';
    bgCtx.font = 'normal ' + ch * 0.35 + 'pt Courier';
    bgCtx.fillText('back', 0, ch * 0.7);

    this.setBG(bg);
  },

  createBG: function(rgba) {
    var cw = 30, ch = 30,
      bg = new Element('canvas'),
      bgCtx = bg.getContext('2d');
    bg.width = cw;
    bg.height = ch;

    bgCtx.clearRect(0, 0, cw, ch);
    bgCtx.fillStyle = rgba;
    bgCtx.fillRect(0, 0, cw, ch);

    this.setBG(bg);
  },

  deleteBG: function() {
    if (this.background) {
      this.background.parentNode.removeChild(this.background);
      this.background = null;
    }
  },

  setBG: function(bg) {
    this.deleteBG();

    bg.id = 'the-background';

    this.background = bg;

    this.background.style.position = 'absolute';
    this.background.style.left = '0px';
    this.background.style.top = '0px';
    this.background.style.width = '100%';
    this.background.style.height = '100%';
    // document.body.appendChild(this.background);
    this.bgDiv.appendChild(this.background);
  },

  initialize: function() {

    this.initialized = true;

    this.bgDiv = new Element('div');
    this.bgDiv.style.display = 'none';
    this.bgDiv.style.position = 'absolute';
    this.bgDiv.style.left = '0';
    this.bgDiv.style.top = '0';
    this.bgDiv.style.width = '100%';
    this.bgDiv.style.height = '100%';
    document.body.appendChild(this.bgDiv);

    // this.createDefaultBG();
    // this.createBG('rgba(255,255,255,0.5)');


    this.pageDiv = new Dragable('div', true);
    this.pageDiv.motion = Drag.M_VER;
    this.pageDiv.motionTarget = Drag.TARGET_COAST;
    this.pageDiv.addReceiver(this, 'finished');
    this.pageDiv.el.set('class', 'splash-menu');
    document.body.appendChild(this.pageDiv.el);


    // new: back button
    this.backButton = new Element('div');
    this.backButton.set('class', 'splash-menu-back');
    //this.backButton.style.backgroundColor = 'red';
    this.backButton.style.width = window.innerWidth * BACK_BUTTON_WIDTH;
    this.backButton.style.height = '100%';
    document.body.appendChild(this.backButton);
    this.backButton.style.display = 'none';
    this.backButton.addEventListener('click', this.showMainMenu.bind(this));
    this.backButton.style.verticalAlign = 'middle';


    this.backImg = new Element('img');
    this.backImg.src = '../assets/back.png';
    this.backImg.style.width = '30px';
    this.backButton.appendChild(this.backImg);

    this.resize();


    window.addEventListener('resize', this.resize.bind(this));
  },
/*
  resizeBGCanvas: function() {
    if (this.background) {
      this.background.style.width = window.innerWidth;
      this.background.style.height = window.innerHeight;
      console.log('resize BG');
    }
  },
*/
  _calcPosition: function(menu) {
    var px, py;
    if (menu.vcentered) {
      py = (window.innerHeight - this.pageDiv.el.offsetHeight) * 0.5;
      if (py < 0) {
        py = 0;
      }
    } else {
      py = 0;
    }

    if (menu.parentMenu) {
      px = window.innerWidth * BACK_BUTTON_WIDTH;
    } else {
      px = 0;
    }

    return {x: px, y: py};
  },

  resize: function() {
    var pos, m;
    Logger.log('MenuClass: ' + window.innerWidth + ' ' + window.innerHeight);
    // this.resizeBGCanvas();
    m = this.currentPage;
    if (m) {
      m.resize();

      pos = this._calcPosition(m);
      this.pageDiv.setPosition(pos.x, pos.y);
      this._setLimits();
    }
    this.backImg.style.width = BACK_BUTTON_WIDTH * window.innerWidth;
    this.backImg.style.height = BACK_BUTTON_WIDTH * window.innerWidth;
    this.backButton.style.height = window.innerHeight;
  },

  showBGCanvas: function() {
    // this.resizeBGCanvas();
    if (this.background) {
      this.bgDiv.style.display = '';
    }
  },
  hideBGCanvas: function() {
    if (this.background) {
      this.bgDiv.style.display = 'none';
    }
  },

  createTextPage: function (parentMenu, name, content, options) {
    var current = this.currentPage,
      sm = new TextObjectPage(parentMenu, name, content, options),
      el;

    this.allMenus[name] = sm;

    this.showPage(name);

    el = this.allMenus[name].el();

    el.style.width = parentMenu ? (100 - BACK_BUTTON_WIDTH * 100) + '%' : '100%';

    this.hidePage(name);

    if (current) {
      this.showPage(current);
    }

    return sm;
  },

  createSplashMenu: function(parentMenu, name, items, options, cb) {
    if (!this.initialized) {
      this.initialize();
      console.log('CALLING INITIALIZE');
    }
    var current = this.currentPage, sm, el;
    if (this.allMenus[name]) {
      throw 'Pages.createSplashMenu menu with name "' + name + '" already exists';
    }

    sm = new SplashMenu(parentMenu, name, items, options, cb);
    this.allMenus[name] = sm;

    this.showPage(name);

    el = this.allMenus[name].el();
    // el.style.width = '100%';
    el.style.width = parentMenu ? (100 - BACK_BUTTON_WIDTH * 100) + '%' : '100%';

    this.hidePage(name);

    if (current) {
      this.showPage(current);
    }

    return sm;
  },
  _showPage: function(menu) {
    var el, pos, px, py;
    if (this.currentPage === menu) {
      return;
    }
    this.currentPage = menu;
    this.showBGCanvas();
    this.pageDiv.el.innerHTML = '';

    el = menu.el();
    this.pageDiv.el.appendChild(el);

    this.pageDiv.el.style.display = '';
    menu.used_width = -1;
    menu.resize();

    pos = this._calcPosition(menu);
    px = pos.x;
    py = pos.y;

    if ($defined(el.cpx)) {
      px = el.cpx;
      py = el.cpy;
    }
    this._setLimits();

    this.pageDiv.setPosition(px, py);

    // this.backButton.style.display = this.currentPage.parentMenu ? '' : 'none';

    DragManager.oneDragElement = this.pageDiv;

    if (menu.fixed) {
      this.pageDiv.motion = Drag.M_NONE;
      // this.pageDiv.motionTarget = Drag.TARGET_COAST;
    } else {
      this.pageDiv.motion = Drag.M_VER;
      this.pageDiv.motionTarget = Drag.TARGET_COAST;
    }
  },
  _menuFromMenuOrName: function(nameOrMenu) {
    if ($type(nameOrMenu) === 'object') {
      return nameOrMenu;
    } else {
      return this.allMenus[nameOrMenu];
    }
  },
  showPage: function(nameOrMenu) {
    var menu = this._menuFromMenuOrName(nameOrMenu);
    return this._showPage(menu);
  },

  showSubMenu: function(nameOrMenu) {
    var next = this._menuFromMenuOrName(nameOrMenu),
      current;
    if (!next) {
      return;
    }
    current = this.currentPage;
    this.swapMenus(current, next, 'shift.right_to_left');
  },
  showMainMenu: function() {
    var current = this.currentPage,
      next = current.parentMenu;
    this.swapMenus(current, next, 'shift.left_to_right');
  },

  _setLimits: function() {
    var menu = this.currentPage,
      el = menu.el(),
      CH = parseFloat(el.style.minHeight);
    if (isNaN(CH)) {
      CH = 100;
    }

    if (CH >= window.innerHeight) {
      this.pageDiv.setLimits([[0, 0], [0, window.innerHeight - CH]]);
    } else {
      this.pageDiv.setLimits([[0, 0], [0, 0]]);
    }
  },

  _saveCurrentPos: function() {
    var menu = this.currentPage,
      el = menu.el();
    el.cpx = this.pageDiv.el.cpx;
    el.cpy = this.pageDiv.el.cpy;

    return {
      x: el.cpx,
      y: el.cpy
    };
  },

  _currentPos: function() {
    return {
      x: this.pageDiv.el.cpx,
      y: this.pageDiv.el.cpy
    };
  },

  hidePage: function() {
    if (this.currentPage === null) {
      return;
    }

    this._saveCurrentPos();

    DragManager.oneDragElement = null;
    this.hideBGCanvas();
    this.pageDiv.el.innerHTML = '';
    this.currentPage = null;
  },
  swapMenus: function(menu1, menu2, method) {
    if (this._swapping) {
      return;
    }

    this.backButton.style.display = 'none';

    this._swapping = true;

    var
      el1 = menu1.el(),
      el2 = menu2.el(),
      back1, back2;
    this.menu2 = menu2;

    method = method.split('.');
    method[0] = '_swap_' + method[0];
    // if (!(method[0] in this)) {
    // if (!this.hasOwnProperty(method[0])) {
    if (!$defined(this[method[0]])) {
      method[0] = '_swap_shift';
    }
    this.swapDirection = method[1];
    if (!['left_to_right', 'right_to_left'].contains(this.swapDirection)) {
      this.swapDirection = 'right_to_left';
    }

    back1 = menu1.parentMenu !== null;
    back2 = menu2.parentMenu !== null;

    this[method[0]](el1, el2, back1, back2);
  },
  /////////////////////////////////////////////////////////////
  _swap_shift: function(page1, page2, back1, back2) {

    var
      times = [],
      positions = [],
      inter, duration, timer, x, y, pos1, pos2;

    this.page1 = page1;
    this.page2 = page2;


    pos1 = this._saveCurrentPos();

    this.pageDiv.el.style.display = 'none';

    this.showPage(this.menu2);

    pos2 = this._currentPos();

    document.body.appendChild(this.page1);
    this.page1.style.position = 'absolute';
    this.page1.style.left = pos1.x;
    this.page1.style.top = pos1.y;

    if (this.swapDirection === 'left_to_right') {
      y = parseFloat(page1.style.top);
      if (!isNumber(y)) {
        y = 0;
      }
      this._createLeftToRight(times, positions, pos1.y, pos2.y, back1, back2);
      duration = 500;
    } else if (this.swapDirection === 'right_to_left') {
      y = parseFloat(page1.style.top);
      if (!isNumber(y)) {
        y = 0;
      }
      this._createRightToLeft(times, positions, pos1.y, pos2.y, back1, back2);
      duration = 500;
    } else if (this.swapDirection === 'top_to_bottom') {
      x = parseFloat(page1.style.left);
      if (!isNumber(x)) {
        x = 0;
      }
      this._createTopToBottom(times, positions, pos1.x, pos2.x, back1, back2);
      duration = 2500;
    }

    inter = new VectorInterpolator(times, positions);
    timer = new IntervalTimer(DT, {duration: duration});
    timer.addReceiver(inter, ['tick', 'finished', 'started']);
    inter.addReceiver(this, ['value_changed', 'finished', 'started'], '_moveCB');
    timer.start();
  },

  _swap_over: function(page1, page2, todo) {
    this.page1 = page1;
    this.page2 = page2;

    this.pageDiv.el.removeChild(page1);
    if (!this.clipDiv2) {
      this.clipDiv1 = new Element('div');
      this.clipDiv1.style.position = 'absolute';
      this.clipDiv1.style.left = '0px';
      this.clipDiv1.style.top = '0px';
      this.clipDiv1.style.width = '100%';
      this.clipDiv1.style.height = '100%';
      this.clipDiv1.style.overflow = 'hidden';

      this.clipDiv2 = new Element('div');
      this.clipDiv2.style.position = 'absolute';
      this.clipDiv2.style.left = '0px';
      this.clipDiv2.style.top = '0px';
      this.clipDiv2.style.width = '100%';
      this.clipDiv2.style.height = '100%';
      this.clipDiv2.style.overflow = 'hidden';
    }
    page1.style.position = 'absolute';
    page1.style.left = '0px';
    page1.style.top = '0px';

    page2.style.position = 'absolute';
    page2.style.left = '0px';
    page2.style.top = '0px';

    this.clipDiv1.appendChild(page1);
    this.clipDiv1.content = page1;

    this.clipDiv2.appendChild(page2);
    this.clipDiv2.content = page2;

    this.clipDiv1.content.style.top = this.pageDiv.el.cpy;
    this.clipDiv2.content.style.top = this.page2.cpy;

    timer = new IntervalTimer(DT, {duration: duration});
    timer.addReceiver(this, ['tick', 'started'], '_swapOverCB');
    timer.addReceiver(this, ['finished'], '_swapFinishedCB');

    document.body.appendChild(this.clipDiv1);
    document.body.appendChild(this.clipDiv2);
    timer.start();
  },
  _swapFinishedCB: function(type, timer) {
    document.body.removeChild(this.clipDiv1);
    document.body.removeChild(this.clipDiv2);
    this.page1.style.position = '';
    this.page2.style.position = '';
    this.showPage(this.menu2);
    this._swapping = false;
    this.backButton.style.display = this.currentPage.parentMenu ? 'table-cell' : 'none';
  },
  _swapOverCB: function(type, timer) {
    var t = this._oneToOne(timer._rel_elapsed),
      k = 1,
      ltr = this.swapDirection === 'right_to_left';
    if (ltr) {
      t = -t;
      k = -1;
    }
    this.clipDiv1.style.left = -t * window.innerWidth + 'px';
    this.clipDiv1.content.style.left =  t * window.innerWidth + 'px';

    this.clipDiv2.style.left = k * window.innerWidth - t * window.innerWidth + 'px';
    this.clipDiv2.content.style.left = -k * window.innerWidth + t * window.innerWidth + 'px';
  },

  _moveCB: function(type, inter) {
    this.page1.style.left = inter.value[0];
    this.page1.style.top = inter.value[1];
    this.pageDiv.el.style.left = inter.value[2];
    this.pageDiv.el.style.top = inter.value[3];

    if ('finished' === type) {
      Logger.log('fini');
      this.page1.style.position = '';
      this.page2.style.position = '';
      document.body.removeChild(this.page1);
      this._swapping = false;
      this.backButton.style.display = this.currentPage.parentMenu ? 'table-cell' : 'none';
    }
    if ('started' === type) {
      Logger.log('display');
      this.pageDiv.el.style.display = '';
    }
  },
  _oneToOne: function(v) {
    return 0.5 * (1 - Math.cos(v * Math.PI));
  },
  _createTopToBottom: function(times, positions, x1, x2, todo) {
    var N = 20,
      i,
      y,
      H = window.innerHeight;
    for (i = 0; i <= N; i++) {
      times.push(i / N);
      y = H * this._oneToOne(i / N);
      positions.push([x1, y, x1, y - H]);
    }
  },
  _createLeftToRight: function(times, positions, y1, y2, back1, back2) {
    var N = 20, i, x,
      W = window.innerWidth,
      ox1 = back1 ? window.innerWidth * BACK_BUTTON_WIDTH : 0,
      ox2 = back2 ? window.innerWidth * BACK_BUTTON_WIDTH : 0;

    for (i = 0; i <= N; i++) {
      times.push(i / N);
      x = W * this._oneToOne(i / N);
      positions.push([ox1 + x, y1, ox2 + x - W, y2]);
    }
  },
  _createRightToLeft: function(times, positions, y1, y2, back1, back2) {
    var N = 20, i, x,
      W = window.innerWidth,
      ox1 = back1 ? window.innerWidth * BACK_BUTTON_WIDTH : 0,
      ox2 = back2 ? window.innerWidth * BACK_BUTTON_WIDTH : 0;

    for (i = 0; i <= N; i++) {
      times.push(i / N);
      x = -W * this._oneToOne(i / N);
      positions.push([ox1 + x, y1, ox2 + x + W, y2]);
    }
  },
  /////////////////////////////////////////////////////////////


  cb: function(type, dragable) {
    /*
    if ('finished' === type) {
      //Logger.log('Pages: dropped ' + dragable.targetIdx);
      //Logger.log('W/H; ' +window.innerWidth + '/' + window.innerHeight);
    }
    */
  }
});

var Pages = null;
window.addEvent('domready', function() {
  Pages = new MenusClass();
});

