/****************************************************************
 * menus
 ****************************************************************/

//= require lib/dragable
//= require lib/font_helper

var DT = 1000/60;

var SplashMenu = new Class({
  Extends: Emitter,

  table: null,
  name: null,

  initialize: function(name, items, options, cb) {
    this.name = name;
    this.items = items;
    var box, i, tr, b, btype, chk, lab;
    var localClick;
    var it, obj, method;

    this.table = new Element('table');
    this.table.setAttribute('cellspacing', '0');
    this.elements = [];

    getTarget = function(ev) {
      var t = ev.target;
      while (!t.hasClass('menu-button')) {
        t = t.parentNode;
      }
      return t;
    }

    localClick = function(ev) {
      var it;
      var t = getTarget(ev);
      if (!Menus.menuDiv.dragging) {
        this.selectedId = t.id.toInt();
        it = this.items[this.selectedId];
        if (it.submenu) {
          Menus.showSubMenu(it.submenu);
        } else if (it.mainmenu) {
          Menus.showMainMenu();
        } else {
          this.notify('selected', this);
        }
      }
    }

    this.opts = {
      fontFamily: 'Arial',
      fontSize: 30,       // starting point for font size search
      fontMinSize: 30,    // lower limit: no smaller font
      fontWeight: 'bold',
      fixedFontSize: options.fixedFontSize
    }

    function toggleCheckButton(ev) {
      if (Menus.menuDiv.dragging) {
        return;
      }
      var b = getTarget(ev);
      var idx = b.id.toInt();
      var it = this.items[idx];
      var c = b.getAttribute('checked');
      if ('true' === c) {
        b.setAttribute('checked', 'false');
        it.checked = false;
      } else {
        b.setAttribute('checked', 'true');
        it.checked = true;
      }
    };

    for (i=0; i<items.length; i++) {
      it = items[i];
      tr = new Element('tr');
      this.table.appendChild(tr);

      chk = $defined(it.check);
      if (chk) {
        //b = new Element('div');
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
      } else {
        b = new Element('button', {text: it.text});
      }

      this.elements.push(b);

      b.addClass('menu-button');
      b.setStyle('font-family', this.opts.fontFamily);
      b.setStyle('font-style', this.opts.fontStyle);
      b.setStyle('font-variant', this.opts.fontVariant);
      b.setStyle('font-weight', this.opts.fontWeight);
      b.id = i;
      b.addEventListener('click', toggleCheckButton.bind(this));

      tr.appendChild(b);

      b.addEventListener('click', localClick.bind(this));
    }
    this.addReceiver(cb.obj, ['selected'], cb.method);

    this.resize();
  },

  resize: function() {
    var font, tfont, b, box;
    if (this.opts.fixedFontSize) {
      fs = this.opts.fixedFontSize;

      for (i=0; i<this.items.length; i++) {
        b = this.elements[i];
        b.setStyle('font-size', fs);
      }

      $$('.check-image, .uncheck-image').each(function(el) {
        el.style.height = 1.25*fs + 'px';
      });

      this.table.style.minHeight = Menus.menuDiv.el.offsetHeight;
    } else {
      if (this.used_width === window.innerWidth && this.used_height === window.innerHeight) {
        return;
      }
      this.used_width = window.innerWidth;
      this.used_height = window.innerHeight;

      box = {
        w : 0.95*window.innerWidth,
        h: 50   // upper limit -> max px tall
      };

      for (i=0; i<this.items.length; i++) {
        tfont = TM.findFontForSize(this.items[i].text, box, this.opts);
        if (!font || tfont.size < font.size) {
          font = tfont;
        }
      }

      for (i=0; i<this.items.length; i++) {
        b = this.elements[i];
        b.setStyle('font-size', font.size);
      }

      $$('.check-image, .uncheck-image').each(function(el) {
        el.style.height = 1.25*font.size + 'px';
      });

      Logger.log('Menu-FS: ' + font.size);

      this.table.style.minHeight = Menus.menuDiv.el.offsetHeight;
    }
  },

  el: function() {
    return this.table;
  }
});


var MenusClass = new Class({
  // splashMenus: [],
  menuStack: [],
  allMenus: {},
  currentSplashMenuName: null,
  bgCanvas: null,
  bgCtx: null,
  startX: -1,
  startY: -1,
  menuDiv: null,
  posIdx: 0,
  mPosX: 0,
  mPosY: 0,

  _createBG: function() {
    var cw = 30, ch = 30;
    this.bgCanvas = new Element('canvas');
    this.bgCanvas.width = cw;
    this.bgCanvas.height = ch;
    this.bgCanvas.style.display = 'none';
    this.bgCanvas.style.position = 'absolute';
    this.bgCanvas.style.left = '0px';
    this.bgCanvas.style.top = '0px';
    document.body.appendChild(this.bgCanvas);

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.bgCtx.clearRect(0, 0, cw, ch);
    // this.bgCtx.fillStyle = 'rgba(0,255,0,0.5)';
    this.bgCtx.fillStyle = '#888';
    this.bgCtx.fillRect(0, 0, cw, ch);

    this.bgCtx.fillStyle = 'white';
    this.bgCtx.font = 'normal ' + ch*0.35 + 'pt Courier';
    this.bgCtx.fillText('back', 0, ch*0.7);
  },

  initialize: function() {

    this.initialized = true;
    // this._createBG();

    this.menuDiv = new Dragable('div', true);
    this.menuDiv.motion = Drag.M_VER;
    //this.menuDiv.motionTarget = Drag.TARGET_NEAREST;
    this.menuDiv.motionTarget = Drag.TARGET_COAST;
    this.menuDiv.addReceiver(this, 'finished');
    this.menuDiv.el.set('class', 'splash-menu');
    document.body.appendChild(this.menuDiv.el);

    window.addEventListener('resize', this.resize.bind(this));
  },

  resizeBGCanvas: function() {
    if (this.bgCanvas) {
      this.bgCanvas.style.width = window.innerWidth;
      this.bgCanvas.style.height = window.innerHeight;
    }
  },

  resize: function() {
    Logger.log('MenuClass: ' + window.innerWidth + ' ' + window.innerHeight);
    this.resizeBGCanvas();
    var m = this.currentMenu();
    if (m) {
      m.resize();

      px = (window.innerWidth - this.menuDiv.el.offsetWidth)*0.5;
      py = (window.innerHeight - this.menuDiv.el.offsetHeight)*0.5;
      this.menuDiv.setPosition(px, py);
    }
    this._setLimits();
  },

  showBGCanvas: function() {
    this.resizeBGCanvas();
    if (this.bgCanvas) {
      this.bgCanvas.style.display = '';
    }
  },
  hideBGCanvas: function() {
    if (this.bgCanvas) {
      this.bgCanvas.style.display = 'none';
    }
  },

  createSplashMenu: function(name, items, options, cb) {
    if (!this.initialized) {
      this.initialize();
    }
    //if (this.allMenus.contains(name)) {
    if (this.allMenus[name]) {
      throw 'Menus.createSplashMenu menu with name "' + name + '" already exists';
    }

    var sm = new SplashMenu(name, items, options, cb);
    // this.splashMenus.push(sm);
    this.allMenus[name] = sm;


    this.showSplashMenu(name);

    var el = this.allMenus[name].el();
    el.style.width = '100%';
   
    this.hideSplashMenu(name);

    return name;
  },

  showSplashMenu: function(name) {
    var el, menu;
    if (this.currentSplashMenuName === name) {
      return;
    }
    if (!this.allMenus[name]) {
      // ERROR
      return;
    }
    this.currentSplashMenuName = name;
    this.showBGCanvas();
    this.menuDiv.el.innerHTML = '';
    
    menu = this.allMenus[name];
    el = menu.el();
    this.menuDiv.el.appendChild(el);

    this.menuDiv.el.style.display = '';
    menu.used_width = -1;
    menu.resize();

    px = (window.innerWidth - this.menuDiv.el.offsetWidth)*0.5;
    py = (window.innerHeight - this.menuDiv.el.offsetHeight)*0.5;

    if (py < 0) {
      py = 0;
    }

    if ($defined(el.cpx)) {
      px = el.cpx;
      py = el.cpy;
    }
    this._setLimits();

    this.menuDiv.setPosition(px, py);

    DragManager.oneDragElement = this.menuDiv;
  },
  /*
  showSplashMenu: function(id) {
    var el, menu;
    if (this.currentSplashMenu === id) {
      return;
    }
    if (id < 0 || id >= this.splashMenus.length) {
      // ERROR
      return;
    }
    this.currentSplashMenu = id;
    this.showBGCanvas();
    this.menuDiv.el.innerHTML = '';
    
    menu = this.splashMenus[id];
    el = menu.el();
    this.menuDiv.el.appendChild(el);

    this.menuDiv.el.style.display = '';
    menu.used_width = -1;
    menu.resize();

    px = (window.innerWidth - this.menuDiv.el.offsetWidth)*0.5;
    py = (window.innerHeight - this.menuDiv.el.offsetHeight)*0.5;

    if (py < 0) {
      py = 0;
    }

    if ($defined(el.cpx)) {
      px = el.cpx;
      py = el.cpy;
    }
    this._setLimits();

    this.menuDiv.setPosition(px, py);

    DragManager.oneDragElement = this.menuDiv;
  },
  */
  showSubMenu: function(menuName) {
    var current = this.currentSplashMenuName;
    var next = menuName;
    this.menuStack.push(current);
    this.swapMenus(current, next, 'shift.right_to_left');
  },
  showMainMenu: function() {
    var current = this.currentSplashMenuName;
    var next = this.menuStack.pop();
    this.swapMenus(current, next, 'shift.left_to_right');
  },

  _setLimits: function() {
    var menu = this.allMenus[this.currentSplashMenuName];
    el = menu.el();
    var CH = parseFloat(el.style.minHeight);
    if (isNaN(CH)) {
      CH = 100;
    }
    this.menuDiv.setLimits([[0,0],[0,-(CH - window.innerHeight)]]);
  },

  _saveCurrentPos: function() {
    var menu = this.allMenus[this.currentSplashMenuName];
    var el = menu.el();
    el.cpx = this.menuDiv.el.cpx;
    el.cpy = this.menuDiv.el.cpy;

    return {
      x: el.cpx,
      y: el.cpy
    }
  },

  _currentPos: function() {
    return {
      x: this.menuDiv.el.cpx,
      y: this.menuDiv.el.cpy
    };
  },

  hideSplashMenu: function() {
    if (this.currentSplashMenuName === null) {
      return;
    }
  
    this._saveCurrentPos();

    DragManager.oneDragElement = null;
    this.hideBGCanvas();
    this.menuDiv.el.innerHTML = '';
    this.currentSplashMenu = null;
  },

  swapMenus: function(name1, name2, method) {
    if (this._swapping) {
      return;
    }
    this._swapping = true;

    var el1 = this.allMenus[name1].el();
    var el2 = this.allMenus[name2].el();
    this.name2 = name2;

    method = method.split('.');
    method[0] = '_swap_' + method[0];
    if (!(method[0] in this)) {
      method[0] = '_swap_shift_';
    }
    this.swapDirection = method[1];
    if (!['left_to_right', 'right_to_left'].contains(this.swapDirection)) {
      this.swapDirection = 'right_to_left';
    }

    this[method[0]](el1, el2);
  },
  /////////////////////////////////////////////////////////////
  _swap_shift: function(page1, page2) {
  

    var times = [];
    var positions = [];
    var inter;
    var duration;
    var timer;

    this.page1 = page1;
    this.page2 = page2;
    
    var pos1 = this._saveCurrentPos();

    this.menuDiv.el.style.display = 'none';

    this.showSplashMenu(this.name2);

    var pos2 = this._currentPos();

    document.body.appendChild(this.page1);
    this.page1.style.position = 'absolute';
    this.page1.style.left = pos1.x;
    this.page1.style.top = pos1.y;

    if (this.swapDirection === 'left_to_right') {
      var y = parseFloat(page1.style.top);
      if (!isNumber(y)) {
        y = 0;
      }
      this._createLeftToRight(times, positions, pos1.y, pos2.y);
      duration = 500;
    } else if (this.swapDirection === 'right_to_left') {
      var y = parseFloat(page1.style.top);
      if (!isNumber(y)) {
        y = 0;
      }
      this._createRightToLeft(times, positions, pos1.y, pos2.y);
      duration = 500;
    } else if (this.swapDirection === 'top_to_bottom') {
      var x = parseFloat(page1.style.left);
      if (!isNumber(x)) {
        x = 0;
      }
      this._createTopToBottom(times, positions, pos1.x, pos2.x);
      duration = 2500;
    }

    inter = new VectorInterpolator(times, positions);
    timer = new IntervalTimer(DT, {duration: duration});
    timer.addReceiver(inter, ['tick', 'finished', 'started']);
    inter.addReceiver(this, ['value_changed', 'finished', 'started'], '_moveCB');
    timer.start();
  },

  _swap_over: function(page1, page2) {
    this.page1 = page1;
    this.page2 = page2;
    var pos1 = this._saveCurrentPos();
    var timer;
    var duration = 500;
    this.menuDiv.el.removeChild(page1);
    if (!this.clipDiv2) {
      this.clipDiv1 = new Element('div');
      this.clipDiv1.style.position = 'absolute';
      this.clipDiv1.style.left = '0px';
      this.clipDiv1.style.top = '0px';
      this.clipDiv1.style.width = '100%';
      this.clipDiv1.style.height = '100%';
      //this.clipDiv1.style.backgroundColor = 'blue';
      this.clipDiv1.style.overflow = 'hidden';
      
      this.clipDiv2 = new Element('div');
      this.clipDiv2.style.position = 'absolute';
      this.clipDiv2.style.left = '0px';
      this.clipDiv2.style.top = '0px';
      this.clipDiv2.style.width = '100%';
      this.clipDiv2.style.height = '100%';
      //this.clipDiv2.style.backgroundColor = 'green';
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

    this.clipDiv1.content.style.top = this.menuDiv.el.cpy;
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
    this.showSplashMenu(this.name2);
    this._swapping = false;
  },
  _swapOverCB: function(type, timer) {
    var t = this._oneToOne(timer._rel_elapsed);
    var k = 1;
    var ltr = this.swapDirection === 'right_to_left';
    if (ltr) {
      t = -t;
      k = -1;
    }
    this.clipDiv1.style.left = -t * window.innerWidth + 'px';
    this.clipDiv1.content.style.left =  t * window.innerWidth + 'px';

    this.clipDiv2.style.left = k*window.innerWidth - t * window.innerWidth + 'px';
    this.clipDiv2.content.style.left = -k*window.innerWidth + t * window.innerWidth + 'px';
  },

  _moveCB: function(type, inter) {
    this.page1.style.left = inter.value[0];
    this.page1.style.top = inter.value[1];
    this.menuDiv.el.style.left = inter.value[2];
    this.menuDiv.el.style.top = inter.value[3];

    if ('finished' === type) {
      Logger.log('fini');
      this.page1.style.position = '';
      this.page2.style.position = '';
      document.body.removeChild(this.page1);
      this._swapping = false;
    }
    if ('started' === type) {
      Logger.log('display');
      this.menuDiv.el.style.display = '';
    }
  },
  _oneToOne: function(v) {
    return 0.5*(1-Math.cos(v*Math.PI));
  },
  _createTopToBottom: function(times, positions, x1, x2) {
    var N = 20;
    var i;
    var y;
    var H = window.innerHeight;
    for (i=0; i<=N; i++) {
      times.push(i/N);
      y = H*this._oneToOne(i/N);
      positions.push([x1,y,x1,y-H]);
    }
  },
  _createLeftToRight: function(times, positions, y1, y2) {
    var N = 20;
    var i;
    var x;
    var W = window.innerWidth;
    for (i=0; i<=N; i++) {
      times.push(i/N);
      x = W*this._oneToOne(i/N);
      positions.push([x,y1,x-W,y2]);
    }
  },
  _createRightToLeft: function(times, positions, y1, y2) {
    var N = 20;
    var i;
    var x;
    var W = window.innerWidth;
    for (i=0; i<=N; i++) {
      times.push(i/N);
      x = -W*this._oneToOne(i/N);
      positions.push([x,y1,x+W,y2]);
    }
  },
  /////////////////////////////////////////////////////////////






  currentMenu: function() {
    //return this.currentSplashMenu > -1 ? this.splashMenus[this.currentSplashMenu] : null;
    return this.allMenus[this.currentSplashMenuName];
  },

  cb: function(type, dragable) {
    if ('finished' === type) {
      //Logger.log('Menus: dropped ' + dragable.targetIdx);
      //Logger.log('W/H; ' +window.innerWidth + '/' + window.innerHeight);
    }
  },

});
var Menus = null;
window.addEvent('domready', function() {
  Menus = new MenusClass();
});

