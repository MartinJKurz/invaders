/****************************************************************
 * simple_menu
 * to be removed
 ****************************************************************/

"use strict";

var InfoCanvas = new Class({
  initialize: function(opts) {
    this.canvas = new Element('canvas');
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
    this.bound_hide = this.hide.bind(this);
    this.opts = opts ? opts : {};
    if (!this.opts.fontStyle) {
      this.opts.fontStyle = 'normal';
    }
    if (!this.opts.fontVariant) {
      this.opts.fontVariant = 'normal';
    }
    if (!this.opts.fontWeight) {
      this.opts.fontWeight = 'normal';
    }
    if (!this.opts.fontFamily) {
      this.opts.fontFamily = 'Helvetica';
    }
    if (!this.opts.fontSize) {
      this.opts.fontSize = 20;
    }
    if (!this.opts.bgStyle) {
      this.opts.bgStyle = 'rgba(255,255,255,0.5)';
    }
    if (!this.opts.fgStyle) {
      this.opts.fgStyle = 'rgba(0,0,0,1)';
    }
    if (!this.opts.timeout) {
      this.opts.timeout = 0;
    }
    if (!this.opts.cancelable) {
      this.opts.cancelable = false;
    }
    this.hide();
  },
  show: function(immediate) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.opts.bgStyle;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (immediate) {
      this.canvas.setStyle('display', '');
    }
  },
  // opts: timeout, cancelable
  showLines: function(lines, opts) {
    this.hide();
    this.ctx.fillStyle = this.opts.fgStyle;
    this.ctx.textAlign = 'center';
    var px = this.canvas.width / 2;
    var py = this.canvas.height / 2;

    var attr = [this.opts.fontStyle, this.opts.fontVariant, this.opts.fontWeight].join(' ');
    var tmp;
    if (typeof(lines) === 'string') {
      lines = [lines];
    }
    if (!('length' in lines)) {
      return;
    }
    var i, font, tfont;
    for (i=0; i<lines.length; i++) {
      tfont = CH.fontForWidth(this.ctx, lines[i], 20, this.canvas.width*0.9, attr, this.opts.fontFamily);
      if (font) {
        if (tfont.size < font.size) {
          font = tfont;
        }
      } else {
        font = tfont;
      }
    }

    var lineSpacing = 1 + 0.5;
    var H = lines.length * font.size * lineSpacing;
    var H2 = (lines.length-1) * font.size * lineSpacing;
    py += font.size / 2;
    py -= H2*0.5;

    this.ctx.font = font.font;

    for (i=0; i<lines.length; i++) {
      this.ctx.fillText(lines[i], px, py);
      py += font.size * 1.5;
    }

    this.canvas.setStyle('display', '');
    if (opts && opts.timeout && opts.timeout > 0) {
      setTimeout(this.hide.bind(this), opts.timeout);
    }
    this.canvas.removeEventListener('click', this.bound_hide);
    if (opts && opts.cancelable) {
      this.canvas.addEventListener('click', this.bound_hide);
    }
  },
  md: function(ev) {
    this._md = true;
    this._mm = false;
    this.mx = ev.clientX;
    this.my = ev.clientY;
  },
  mu: function(ev) {
    if (this._md) {
      this._md = false;
      var dx = ev.clientX - this.mx;
      var dy = ev.clientY - this.my;
      var d = dx*dx+dy*dy;
      if (d > 100) {
        this.my = ev.clientY;
        console.log('hide');
        this.hide();
        this._mm = true;
      }
    }
    // ev.preventDefault(); - no effect; click is fired for button
  },
  showMenu: function(items, opts) {
    var i,t,tr,td,b,px,py;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    function cancel() {
      this.hide();
    }
    var bound_cancel = cancel.bind(this);

    if (opts.cancel) {
      items.push({text:'cancel', cb: bound_cancel});
    }

    if (!this.menuDiv) {
      this.menuDiv = new Element('div');
      this.menuDiv.setStyle('position', 'absolute');
      this.menuDiv.set('class', 'splash-menu');
      document.body.appendChild(this.menuDiv);
    }
    this.menuDiv.innerHTML = '';

    var box = {
      // w : window.innerWidth * 0.8,
      // h : 0.6 * window.innerHeight * 0.8 / items.length
      w : 0.8*window.innerWidth,
      h : 0.8*window.innerHeight / items.length
    };
    var opts = {
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold'
    }
    var font, tfont;
    for (i=0; i<items.length; i++) {
      tfont = TM.findFontForSize(items[i].text, box, opts);
      if (!font || tfont.size < font.size) {
        font = tfont;
      }
    }

    t = new Element('table');
    t.addEventListener('mousedown', this.md.bind(this));
    t.addEventListener('mouseup', this.mu.bind(this));

    var localClick = function(ev) {
      if (!this._mm) {
        var idx = ev.target.id.toInt();
        items[idx].cb();
        console.log('calling');
      } else {
        console.log('not calling');
      }
    }


    this.menuDiv.appendChild(t);
    for (i=0; i<items.length; i++) {
      tr = new Element('tr');
      t.appendChild(tr);
      b = new Element('input');
      b.type = 'button';
      b.setAttribute('class', 'menu-button');
      // b.setStyle('font-size', 70);
      b.setStyle('font-family', opts.fontFamily);
      b.setStyle('font-style', opts.fontStyle);
      b.setStyle('font-variant', opts.fontVariant);
      b.setStyle('font-size', font.size);
      b.setStyle('font-weight', opts.fontWeight);
      b.id = i;

      b.value = items[i].text;
      tr.appendChild(b);

      if (items[i].cb) {
        b.addEventListener('click', localClick.bind(this));
      }
    }

    this.menuDiv.setStyle('display', '');


    // this.menuDiv.setStyle('left', 0 + 'px');


    px = (window.innerWidth - this.menuDiv.offsetWidth)*0.5;
    py = (window.innerHeight - this.menuDiv.offsetHeight)*0.5;
    this.menuDiv.setStyle('left', px);
    this.menuDiv.setStyle('top', py);

    this.canvas.setStyle('display', '');
  },
  hide: function() {
    this.show(false);
    this.canvas.setStyle('display', 'none');
    if (this.menuDiv) {
      this.menuDiv.setStyle('display', 'none');
    }
  },
  resize: function () {

    if (window.innerWidth !== this.canvas.width || window.innerHeight != this.canvas.height) {
      this.canvas.style.width = window.innerWidth+'px';
      this.canvas.style.height = window.innerHeight+'px';
      this.canvas.width = Math.floor(window.innerWidth);
      this.canvas.height = Math.floor(window.innerHeight);
      this.canvas.style.position = 'absolute';
    }
  },
});

