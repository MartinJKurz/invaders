/*
 * One Menus object
 *
 *
 *
 *
 *
 */

_MENU_OPTS_ = {
  dragStart: 100
};
var SplashMenu = new Class({
  table: null,
  initialize: function(items, options) {
    this.items = items;
    var box, i, tr, b;
    var localClick;

    this.table = new Element('table');
    this.elements = [];

    localClick = function(ev) {
      if (!Menus.menuDiv.dragging) {
        var idx = ev.target.id.toInt();
        items[idx].cb();
      } else {
      }
    }

    this.opts = {
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold'
    }

    for (i=0; i<items.length; i++) {
      tr = new Element('tr');
      this.table.appendChild(tr);
      b = new Element('input');
      this.elements.push(b);
      b.type = 'button';
      b.setAttribute('class', 'menu-button');
      b.setStyle('font-family', this.opts.fontFamily);
      b.setStyle('font-style', this.opts.fontStyle);
      b.setStyle('font-variant', this.opts.fontVariant);
      b.setStyle('font-weight', this.opts.fontWeight);
      b.id = i;

      b.value = items[i].text;
      tr.appendChild(b);

      if (items[i].cb) {
        b.addEventListener('click', localClick.bind(this));
      }
    }

    this.resize();
  },

  resize: function() {
    if (this.used_width === window.innerWidth && this.used_height === window.innerHeight) {
      return;
    }
    this.used_width = window.innerWidth;
    this.used_height = window.innerHeight;

    var font, tfont, b;
    box = {
      w : 0.8*window.innerWidth,
      h : 0.8*window.innerHeight / this.items.length
    };

    // TESTING
    box.h = 50;
    
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
  },

  el: function() {
    return this.table;
  }
});


var MenusClass = new Class({
  splashMenus: [],
  currentSplashMenu: -1,
  bgCanvas: null,
  bgCtx: null,
  startX: -1,
  startY: -1,
  menuDiv: null,
  posIdx: 0,
  mPosX: 0,
  mPosY: 0,

  initialize: function() {
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
    this.bgCtx.fillStyle = 'rgba(0,255,0,0.5)';
    this.bgCtx.fillStyle = '#88f';
    this.bgCtx.fillRect(0, 0, cw, ch);

    this.bgCtx.fillStyle = 'white';
    this.bgCtx.font = 'normal ' + ch*0.35 + 'pt Courier';
    this.bgCtx.fillText('back', 0, ch*0.7);

    this.menuDiv = new Dragable('div');
    this.menuDiv.addReceiver(this, 'finished');
    this.menuDiv.el.set('class', 'splash-menu');
    document.body.appendChild(this.menuDiv.el);

    window.addEventListener('resize', this.resize.bind(this));
  },

  resizeBGCanvas: function() {
    this.bgCanvas.style.width = window.innerWidth;
    this.bgCanvas.style.height = window.innerHeight;
  },

  resize: function() {
    this.resizeBGCanvas();
    var m = this.currentMenu();
    if (m) {
      m.resize();

      px = (window.innerWidth - this.menuDiv.el.offsetWidth)*0.5;
      py = (window.innerHeight - this.menuDiv.el.offsetHeight)*0.5;
      this.menuDiv.setPosition(px, py);
    }
  },

  showBGCanvas: function() {
    this.resizeBGCanvas();
    this.bgCanvas.style.display = '';
  },
  hideBGCanvas: function() {
    this.bgCanvas.style.display = 'none';
  },

  createSplashMenu: function(items, options) {
    if (!this.bgCanvas) {
      this.initialize();
    }
    this.splashMenus.push(new SplashMenu(items, options));
    var id = this.splashMenus.length - 1;
    this.showSplashMenu(id);

    var el = this.splashMenus[id].el();
    el.style.minWidth = this.menuDiv.el.offsetWidth;
    el.style.minHeight = this.menuDiv.el.offsetHeight;
   
    this.hideSplashMenu(id);

    return id;
  },

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

    menu.resize();

    px = (window.innerWidth - this.menuDiv.el.offsetWidth)*0.5;
    py = (window.innerHeight - this.menuDiv.el.offsetHeight)*0.5;

    // TESTING
    if (py < 0) {
      py = 0;
    }
    var i;
    var pos = [];
    // var n = this.menuDiv.el.items.length;
    var n = menu.items.length;
    var H = this.menuDiv.el.offsetHeight/n;
    for (i=0; i<n; i++) {
      pos.push([px, -i*H]);
    }
    this.menuDiv.setTargetPositions(pos);

    this.menuDiv.setPosition(px, py);
  },

  hideSplashMenu: function() {
    if (this.currentSplashMenu < 0) {
      return;
    }
    this.hideBGCanvas();
    this.menuDiv.el.innerHTML = '';
    this.currentSplashMenu = -1;
  },

  currentMenu: function() {
    return this.currentSplashMenu > -1 ? this.splashMenus[this.currentSplashMenu] : null;
  },

  cb: function(type, dragable) {
    if ('finished' === type) {
      Logger.log('Menus: dropped ' + dragable.targetIdx);
    }
  },

});
var Menus = null;
window.addEvent('domready', function() {
  Menus = new MenusClass();
});

