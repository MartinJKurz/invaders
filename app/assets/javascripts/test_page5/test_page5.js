/*

page5 ok now

*/

/*
JS source for random flickr images:
src="http://api.flickr.com/services/rest/?format=json&sort=random&method=flickr.photos.search&tags=japan,food&tag_mode=all&api_key=66c61b93c4723c7c3a3c519728eac252">
*/

debug = false;

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
  '/P8180198_s.JPG',
];

var Image = new Class({
  initialize: function(idx, f) {

    ImageOpts.imageW = -1;
    ImageOpts.imageH = -1;

    this.f = f;
    this.image = new Element('img');
    this.image.addEventListener('load', this.loaded.bind(this));

    this.image.initialized = false;

    this.image.src = imageSources[idx];
    if (this.image.complete && !this.image.initialized) {
      this.loaded({target: this.image});
    }
  },

  loaded: function(ev) {
    if (ev.target.initialized) {
      return;
    }
    ev.target.initialized = true;

    var r1 = window.innerWidth / window.innerHeight;
    var r2 = ev.target.width / ev.target.height;
    if ((r1 >= 1 && r2 < 1) || (r1 < 1 && r2 >= 1)) {
      var image = CH.rotateImage90(ev.target, 1);
    } else {
      image = ev.target;
    }
    ImageOpts.imageW = image.width;
    ImageOpts.imageH = image.height;

    ImageOpts.kx = ImageOpts.imageW / Opts.nx;
    ImageOpts.ky = ImageOpts.imageH / Opts.ny;
    ImageOpts.tw = ImageOpts.imageW / Opts.nx - Opts.gap;
    ImageOpts.th = ImageOpts.imageH / Opts.ny - Opts.gap;

    this.f(image, true);
  },
});

var Rect = new Class({
  initialize: function(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
  },
  draw: function(x, y, ctx, image, highlighted) {
    var X = x*Opts.kx;
    var Y = y*Opts.ky;
    var W = Opts.tw;
    var H = Opts.th;
    var SX = this.x*ImageOpts.kx;
    var SY = this.y*ImageOpts.ky;
    var SW = ImageOpts.tw;
    var SH = ImageOpts.th;

    ctx.drawImage(image, SX, SY, SW, SH, X, Y, W, H);

    ctx.strokeStyle = highlighted ? 'red' : 'black';
    ctx.lineWidth = highlighted ? 2 : 1;

    ctx.strokeRect(X, Y, W, H);
  }
});

var App = new Class({
  initialize: function() {

    if (Logger) {
      //this.logger = new Log();
      Logger.log('start logging');
    }
 
    this.info = new InfoCanvas({
      fontWeight: 'bold',
      fontSize: 20,
    });
    this.info.resize();
    this.info.hide();
    
    this.enable(false);

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = 100;
    this.h = 100;
    this.canvas.addEventListener('touchend', this.te.bind(this));
    this.canvas.addEventListener('touchmove', this.tm.bind(this));
    this.canvas.addEventListener('touchstart', this.ts.bind(this));

    this.bound_md = this.md.bind(this);
    this.bound_mm = this.mm.bind(this);
    this.bound_mu = this.mu.bind(this);

    this.mouse = true;
    if (this.mouse) {
      this.addMouseEventHandler();
    }

    window.addEventListener('resize', this.onResize.bind(this));


  
    this.loadImage(0);
    //this.doCreateDrawing();

    this.prevDef = true;
  },
  initialize2: function(image, reuse) {

    this.ih = -1;
    this.iw = -1;

    if (reuse) {
      this.images[this.imageIdx] = image;
    }

    this.image = image;

    this.currentX = Opts.nx - 1;
    this.currentY = Opts.ny - 1;

    this.lastTime = 0;

    this.createFields();
    this.correct = Opts.nx*Opts.ny -1;
    this.info.showLines(['shuffling','image']);

    this.draw();
    this.shuffle(20);
  },
  createFields: function() {
    this.field = [];
    var i, j, t;
    for (j=0; j<Opts.ny; j++) {
      this.field.push([]);
      for (i=0; i<Opts.nx; i++) {
        t = new Rect(randomColor(), i, j);
        if (i!==Opts.nx-1 || j!==Opts.ny-1) {
          this.field[j].push(t);
        } else {
          this.lastField = t;
        }
      }
    }
    this.field[Opts.ny-1].push(null);
  },

  togglePrevDef: function() {
    this.prevDef = !this.prevDef;
    this.log('PrevDev: ' + this.prevDef);
  },

  loadImage: function(idx) {
    this.info.showLines('loading image ...');
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
    this.info.showLines('creating drawing ...');
    this.createDrawing(this.initialize2.bind(this));
  },
  createDrawing: function(f) {
    ImageOpts.imageW = window.innerWidth;
    ImageOpts.imageH = window.innerHeight;
    ImageOpts.kx = ImageOpts.imageW / Opts.nx;
    ImageOpts.ky = ImageOpts.imageH / Opts.ny;
    ImageOpts.tw = ImageOpts.imageW / Opts.nx - Opts.gap;
    ImageOpts.th = ImageOpts.imageH / Opts.ny - Opts.gap;
    var image = new Drawing(ImageOpts.imageW, ImageOpts.imageH).canvas;
    f(image, false);
  },

  shuffle: function(n) {
    if (n > 0) {
      this.single_shuffle();
      setTimeout(this.shuffle.bind(this, n-1), 100);
    } else {
      setTimeout(this.enable.bind(this), 200, true);
    }
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
    this.selectXY(x, y, false);
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
      this.log('ERROR: te ss inactive');
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
    if (Logger) {
      Logger.log(line);
    }
  },
  toggleLog: function(line) {
    if (Logger) {
      Logger.toggle();
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
    this.log('mu');
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
    var items = [];
    if (!this.solved) {
      items.push({text: 'shuffle', cb: function() {this.shuffle(11);}.bind(this)});
    }
    items.push({text: 'new image', cb: function(){this.loadNextImage();}.bind(this)});
    items.push({text: 'new graphic', cb: function(){this.doCreateDrawing();}.bind(this)});
    if (debug) {
      items.push({text: 'log', cb: function(){this.toggleLog();}.bind(this)});
      items.push({text: 'toggle PD', cb: function(){this.togglePrevDef();}.bind(this)});
    }
    this.info.showMenu(items, {cancel:true});
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
    this.selectXY(xn, yn, true);
  },
  selectXY: function(x, y, user) {
    var i, X=-1, Y=-1, d;

    if (x >= 0 && x <= Opts.nx && y >= 0 && y <= Opts.ny) {
    } else {
      this.log('sxy: outside');
      return;
    }

    this.currentX = x;
    this.currentY = y;

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

    function setField(tx, ty, sx, sy) {
      var plus = 0;
      var f = this.field[sy][sx];
      if (f && f.x === sx && f.y === sy) {
        plus--;
      }
      this.field[ty][tx] = this.field[sy][sx];
      f = this.field[ty][tx];
      if (f && f.x === tx && f.y === ty) {
        plus++;
      }
      this.correct += plus;
    }

    if ((X === -1 && Y !== -1) || (X !== -1 && Y === -1)) {
      if (X===-1) {
        d = y > Y ? 1:-1;
        for (i=Y; i != y; i+=d) {
          setField.bind(this, [x, i, x, i+d])();
        }
      } else {
        d = x > X ? 1:-1;
        for (i=X; i != x; i+=d) {
          setField.bind(this, [i, y, i+d, y])();
        }
      }
      this.field[y][x] = null;
      //this.draw();
    }
    this.draw();
    if (user) {
      if (Opts.nx * Opts.ny - 1 === this.correct) {
        this.solved();
      } else {
        this.log('Correct: ' + this.correct);
      }
    }
  },
  solved: function() {
    this.log('solved');
    this.field[Opts.nx-1][Opts.ny-1] = this.lastField;
    this.draw();
    this.info.showLines(['solved!'], {timeout:2000});
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

    this.log('resized: ' + this.iw + 'x' + this.ih);

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
          this.field[j][i].draw(i, j, this.ctx, this.image, false);
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
});

function onLoad() {
  var app = new App();
}

