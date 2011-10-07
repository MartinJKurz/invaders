/*

Corrected issues listed below.
test_page6:
  touch only
test_page7:
  mouse only

when prevent default is enabled (at start):
  ts p 0/0
  ERROR: te L = 0
  -> touch events WRONG, no mouse events
when PD is disabled:
  ts p 0/0
  ERROR: te L = 0
  md: 268/97
  mu: start select
  sel: 268/97 -> 2/0
  -> touch ev wrong, continue with mouse events

-->
2 Fehler:
1. TS liefert 0/0
2. TE: touches list ist leer - ist wohl kein Bug

ts c undefined/undefined
ts p 0/0
ERR: te L = 0

pd: false -> WORKING!!
ts: 0 0
ERROR: te L = 0
md 222/453
mu start select
sel: 222/453 -> 2/1




test_page3:

desktop:
M -> T ok
T -> M NOK

android:
M -> T NOK
T -> M ok

MOVE: 1
UP: 0


*/



var Opts = {
  tw: 40,
  th: 40,
  kx: 50,
  ky: 50,
  ox: 0,
  oy: 0,
  nx: 3,
  ny: 3,
  gap: 0
};
var ImageOpts = {
  imageW: -1,
  imageH: -1
};

var Drawing = new Class({
  initialize: function(w, h) {
    this.canvas = new Element('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    var ctx = this.canvas.getContext('2d');
    var i;
    ctx.fillStyle = 'green';
    ctx.fillRect(0,0,w,h);
    for (i=0; i<20; i++) {
      this.drawCircle(ctx, w*Math.random(), h*Math.random(), 0.2*Math.min(w,h)*(Math.random()+0.5), randomColor());
    }
  },
  drawCircle: function(ctx, x, y, r, c) {
    ctx.fillStyle = c;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = r*0.05;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
});

var imageSources = [
  '/P8200264.JPG',
  '/P8200257.JPG',
  '/P1010015_s.JPG',
  '/P8180198_s.JPG'
];

var Image = new Class({
  initialize: function(idx, f) {

    ImageOpts.imageW = -1;
    ImageOpts.imageH = -1;

    this.f = f;
    this.image = new Element('img');
    this.image.addEventListener('load', this.loaded.bind(this));

    this.image.src = imageSources[idx];
    if (this.image.complete) {
      this.loaded({target: this.image});
    }
  },

  loaded: function(ev) {
    ImageOpts.imageW = ev.target.width;
    ImageOpts.imageH = ev.target.height;
    ImageOpts.kx = ImageOpts.imageW / Opts.nx;
    ImageOpts.ky = ImageOpts.imageH / Opts.ny;
    ImageOpts.tw = ImageOpts.imageW / Opts.nx - Opts.gap;
    ImageOpts.th = ImageOpts.imageH / Opts.ny - Opts.gap;

    this.f(ev.target, true);
  },
});

var Rect = new Class({
  initialize: function(color, x, y, image) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.image = image;
  },
  draw: function(x, y, ctx, highlighted) {
    var X = x*Opts.kx;
    var Y = y*Opts.ky;
    var W = Opts.tw;
    var H = Opts.th;
    var SX = this.x*ImageOpts.kx;
    var SY = this.y*ImageOpts.ky;
    var SW = ImageOpts.tw;
    var SH = ImageOpts.th;

    ctx.drawImage(this.image, SX, SY, SW, SH, X, Y, W, H);

    ctx.strokeStyle = highlighted ? 'red' : 'black';
    ctx.lineWidth = highlighted ? 2 : 1;

    ctx.strokeRect(X, Y, W, H);
  }
});

var App = new Class({
  initialize: function() {

    this.info = new InfoCanvas({
      fontWeight: 'bold',
      fontSize: 20,
    });
    this.info.resize();

    this.info.showLines('Loading image');
    
    this.enable(false);

    // this.loadImage(0);
    this.doCreateDrawing();
    this.imageIdx = -1;

    this.prevDef = true;



    ///
    if (Log) {
      this.logger = new Log();
      this.logger.log('start logging');
    }
  },

  togglePrevDef: function() {
    this.prevDef = !this.prevDef;
    this.log('PrevDev: ' + this.prevDef);
  },

  loadImage: function(idx) {
    if (!this.images) {
      this.images = [];
    }
    this.imageIdx = idx;
    if (this.images[idx]) {
      this.initialize2(this.images[idx]);
    } else {
      new Image(idx, this.initialize2.bind(this));
    }
  },
  loadRandomImage: function() {
    this.loadImage(irand(imageSources.length));
  },
  loadNextImage: function() {
    var idx = (1+this.imageIdx) % imageSources.length;
    this.loadImage(idx);
  },

  doCreateDrawing: function(f) {
    this.createDrawing(this.initialize2.bind(this));
  },
  createDrawing: function(f) {
    ImageOpts.imageW = 800;
    ImageOpts.imageH = 800;
    ImageOpts.kx = ImageOpts.imageW / Opts.nx;
    ImageOpts.ky = ImageOpts.imageH / Opts.ny;
    ImageOpts.tw = ImageOpts.imageW / Opts.nx - Opts.gap;
    ImageOpts.th = ImageOpts.imageH / Opts.ny - Opts.gap;
    var image = new Drawing(ImageOpts.imageW, ImageOpts.imageH).canvas;
    f(image, false);
  },

  initialize2: function(image, reuse) {

    if (reuse) {
      this.images[this.imageIdx] = image;
    }

    this.info.hide();
    this.image = image;

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = 100;
    this.h = 100;

    this.field = [];
    var i, j, t;
    for (j=0; j<Opts.ny; j++) {
      this.field.push([]);
      for (i=0; i<Opts.nx; i++) {
        if (i!==Opts.nx-1 || j!==Opts.ny-1) {
          t = new Rect(randomColor(), i, j, this.image);
          this.field[j].push(t);
        }
      }
    }

    this.currentX = Opts.nx - 1;
    this.currentY = Opts.ny - 1;

    this.field[Opts.ny-1].push(null);
    this.mouse = true;
    this.lastTime = 0;
    this.touches = [];

    this.canvas.addEventListener('touchend', this.te.bind(this));
    this.canvas.addEventListener('touchmove', this.tm.bind(this));
    this.canvas.addEventListener('touchstart', this.ts.bind(this));

    window.addEventListener('resize', this.onResize.bind(this));

    this.bound_md = this.md.bind(this);
    this.bound_mm = this.mm.bind(this);
    this.bound_mu = this.mu.bind(this);

    if (this.mouse) {
      this.addMouseEventHandler();
    }

    this.ih = -1;
    this.iw = -1;
    this.draw();
    
    this.shuffle2(10);
  },
  shuffle2: function(n) {
    var i;
    this.info.showLines(['shuffling','image']);
    for (i=0; i<n; i++) {
      setTimeout(this.single_shuffle.bind(this), 300+i*100);
    }
    setTimeout(this.enable.bind(this), 400+n*100, true);
  },
  enable: function(val) {
    this.enabled = val;
    this.info.hide();
  },
  single_shuffle: function() {
    var x, y;
    if (Math.random() < 0.5) {
      x = this.currentX;
      while (this.currentY === (y = irand(Opts.ny)))
        ;
    } else {
      y = this.currentY;
      while (this.currentX === (x = irand(Opts.nx)))
        ;
    }
    this.selectXY(x, y);
  },

  ts: function(event) {
    //this.log('ts p ' + event.pageX + '/' + event.pageY);    // 0/0
    if (this.prevDef) {
      event.preventDefault();
    }
    if (!this.enabled) {
      this.log('ERROR: ts return');
      return;
    }
    var t;
    if (event.touches.length == 1) {
      this.startSelect = true;
      if (this.to) {
        clearTimeout(this.to);
      }
      this.to = setTimeout(this.longTouch.bind(this), 1000, event);
    } else {
      this.log('ERROR: ts L = ' + event.touches.length);
    }
  },
  tm: function(event) {
    if (this.prevDef) {
      event.preventDefault();
    }
    if (!this.enabled) {
      return;
    }
  },
  te: function(event) {
    if (this.prevDef) {
      event.preventDefault();
    }
    if (!this.enabled) {
      this.log('ERROR: te return');
      return;
    }
    if (!this.startSelect) {
      this.log('ERROR: mu ss inactive');
      return;
    }
    this.startSelect = false;
    // if (event.touches.length == 1) {   // this list does NOT contain the touch
    if (event.changedTouches.length == 1) {  // CHANGED !
      t = event.changedTouches[0];
      this.log('te start select ' + t.pageX + '/' + t.pageY);
      this.select(t.pageX, t.pageY);
    } else {
      this.log('ERROR: te L = ' + event.changedTouches.length);
    }
    this.draw();
  },

  log: function(line) {
    if (this.logger) {
      this.logger.log(line);
    }
  },
  toggleLog: function(line) {
    if (this.logger) {
      this.logger.toggle();
      this.info.hide();
    }
  },

  md: function(event) {
    this.log('md ' + event.clientX + '/' + event.clientY);
    if (this.prevDef) {
      event.preventDefault();
    }
    if (!this.enabled) {
      this.log('ERROR: md return');
      return;
    }
    if (this.to) {
      clearTimeout(this.to);
    }
    this.startSelect = true;
    this.to = setTimeout(this.longClick.bind(this), 1000, event);
  },
  mm: function(event) {
    if (this.prevDef) {
      event.preventDefault();
    }
    if (!this.enabled) {
      return;
    }
  },
  mu: function(event) {
    if (this.prevDef) {
      event.preventDefault();
    }
    if (!this.enabled) {
      this.log('ERROR: mu return');
      return;
    }
    if (!this.startSelect) {
      this.log('ERROR: mu ss inactive');
      return;
    }
    this.startSelect = false;
    this.log('mu start select');
    this.select(event.clientX, event.clientY);
    this.draw();
  },

  longFunction: function() {
    this.info.showMenu(
      [
        {text: 'shuffle', cb: function() {this.shuffle2(11);}.bind(this)},
        {text: 'image', cb: function(){this.loadNextImage();}.bind(this)},
        {text: 'create graphic', cb: function(){this.doCreateDrawing();}.bind(this)},
        {text: 'log', cb: function(){this.toggleLog();}.bind(this)},
        {text: 'toggle PD', cb: function(){this.togglePrevDef();}.bind(this)},
      ],
      {cancel:true}
    );
  },

  longClick: function(event) {
    if (this.startSelect) {
      this.startSelect = false;
      this.longFunction();
    }
  },
  longTouch: function(event) {
    if (this.startSelect) {
      this.startSelect = false;
      this.longFunction();
    }
  },

  select: function(x, y) {
    var xn = x - Opts.ox;
    var yn = y - Opts.oy;
    xn = Math.floor(xn/Opts.kx);
    yn = Math.floor(yn/Opts.ky);
    this.log('sel: ' + x + '/' + y + ' -> ' + xn + '/' + yn);
    this.selectXY(xn, yn);
  },
  selectXY: function(x, y) {
    this.currentX = x;
    this.currentY = y;

    try {
      if (x >= 0 && x <= Opts.nx && y >= 0 && y <= Opts.ny) {
        if (this.field[y][x]) {
          this.field[y][x].draw(x, y, this.ctx, true);
        }
      } else {
        this.log('sxy: outside');
        return;
      }
    } catch (e) {
      this.log('catch 1\n' + e);
      return;
    }

    try {
      var i, X=-1, Y=-1;
      for (i=0; i<Opts.nx; i++) {
        if (this.field[y][i] === null) {
          X = i;
          break;
        }
      }
      for (i=0; i<Opts.ny; i++) {
        if (this.field[i][x] === null) {
          Y = i;
          break;
        }
      }
    } catch (e) {
      this.log('catch 2\n' + e);
      return;
    }

    var d;
    try {
      if ((X === -1 && Y !== -1) || (X !== -1 && Y === -1)) {
        if (X===-1) {
          d = y > Y ? 1:-1;
          for (i=Y; i != y; i+=d) {
            this.field[i][x] = this.field[i+d][x];
          }
        } else {
          d = x > X ? 1:-1;
          for (i=X; i != x; i+=d) {
            this.field[y][i] = this.field[y][i+d];
          }
        }
        this.field[y][x] = null;
        this.draw();
      }
    } catch (e) {
      this.log('catch 3\n' + e);
      return;
    }
      
  },
  onResize: function() {
    this.resize();
    this.draw();
  },
  resize: function() {
    if (this.ih === window.innerHeight && this.iw === window.innerWidth) {
      if (this.imageResized) {
        return;
      }
    }
    this.imageResized = ImageOpts.imageW !== -1;

    this.ih = window.innerHeight;
    this.iw = window.innerWidth;

    var nw = window.innerWidth;
    var nh = window.innerHeight;

    var r1 = nw/nh;
    var r2 = ImageOpts.imageW/ImageOpts.imageH;
    var aw, ah, nw2, nh2;
    if (r1 > r2) {
      nw2 = nh*r2;
      Opts.ox = 0.5*(nw-nw2);
      Opts.oy = 0;
      nw = nw2;
    } else {
      nh2 = nw/r2;
      Opts.ox = 0;
      Opts.oy = 0.5*(nh-nh2);
      nh = nh2;
    }

    this.w = nw;
    this.h = nh;
    this.canvas.style.width = this.w+'px';
    this.canvas.style.height = this.h+'px';
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = Opts.ox + 'px';
    this.canvas.style.top = Opts.oy + 'px';

    this.info.resize();

    var radius = (window.innerHeight + window.innerWidth)/2;
    var bg_style;
    bg_style = '-webkit-gradient( radial, 50% 50%, 0, 50% 50%, ' + radius + ', from(#fff), to(#444) )';
    document.body.style.background = bg_style;
    bg_style = '-moz-radial-gradient( 50% 50%, circle, #fff 0px, #444 ' + radius + 'px )';
    document.body.style.background = bg_style;

    Opts.kx = this.w / Opts.nx;
    Opts.ky = this.h / Opts.ny;
    Opts.tw = this.w / Opts.nx - Opts.gap;
    Opts.th = this.h / Opts.ny - Opts.gap;
  },
  draw: function() {
    this.resize();
    this.ctx.fillStyle = '#aaa';
    this.ctx.clearRect(0, 0, this.w, this.h);

    var i,j;
    for (j=0; j<Opts.ny; j++) {
      for (i=0; i<Opts.nx; i++) {
        if (this.field[j][i]) {
          this.field[j][i].draw(i, j, this.ctx, false);
        }
      }
    }
  },
  addMouseEventHandler: function() {
    this.canvas.addEventListener('mousedown', this.bound_md);
    this.canvas.addEventListener('mousemove', this.bound_mm);
    this.canvas.addEventListener('mouseup', this.bound_mu);
  },
  removeMouseEventHandler: function() {
    this.canvas.removeEventListener('mousedown', this.bound_md);
    this.canvas.removeEventListener('mousemove', this.bound_mm);
    this.canvas.removeEventListener('mouseup', this.bound_mu);
  },

  toggle: function() {
    this.mouse = !this.mouse;
    if (this.mouse) {
      this.addMouseEventHandler();
    } else {
      this.removeMouseEventHandler();
    }
  },
  dblCheck: function() {
    var nt = (new Date).getTime();
    if (nt - this.lastTime < 200) {
      this.toggle();
    }
    this.lastTime = nt;
  }
});

function onLoad() {
  var app = new App();
}

