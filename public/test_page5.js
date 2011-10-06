var Opts = {
  tw: 40,
  th: 40,
  kx: 50,
  ky: 50,
  ox: 0,
  oy: 0,
  nx: 4,
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

    // document.body.appendChild(this.canvas);
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

var Image = new Class({
  initialize: function(f) {

    ImageOpts.imageW = -1;
    ImageOpts.imageH = -1;

    this.f = f;
    this.image = new Element('img');
    this.image.addEventListener('load', this.loaded.bind(this));
    // this.image.src = '/episode-3-album-art.jpg';
    //this.image.src = '/eye.jpg';
    //this.image.src = '/P8200264.JPG';
    //this.image.src = '/P8200257.JPG';
    //this.image.src = '/P1010015.JPG';
    //this.image.src = '/P1010015_s.JPG';
    this.image.src = '/P8180198_s.JPG';
    if (this.image.complete) {
      this.loaded({target: this.image});
    }
    // document.body.appendChild(this.image);
  },

  loaded: function(ev) {
    /*
    console.log('LOADED');
    console.log('width: ' + ev.target.width);
    console.log('height: ' + ev.target.height);
    */

    ImageOpts.imageW = ev.target.width;
    ImageOpts.imageH = ev.target.height;
    ImageOpts.kx = ImageOpts.imageW / Opts.nx;
    ImageOpts.ky = ImageOpts.imageH / Opts.ny;
    ImageOpts.tw = ImageOpts.imageW / Opts.nx - Opts.gap;
    ImageOpts.th = ImageOpts.imageH / Opts.ny - Opts.gap;

    this.f(ev.target);
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

    this.createInfoCanvas();
    this.infoResize();
    this.showInfo('Loading image');
    
    this.enable(false);

    new Image(this.initialize2.bind(this));
    //this.createDrawing(this.initialize2.bind(this));
  },

  createDrawing: function(f) {
    ImageOpts.imageW = 800;
    ImageOpts.imageH = 800;
    ImageOpts.kx = ImageOpts.imageW / Opts.nx;
    ImageOpts.ky = ImageOpts.imageH / Opts.ny;
    ImageOpts.tw = ImageOpts.imageW / Opts.nx - Opts.gap;
    ImageOpts.th = ImageOpts.imageH / Opts.ny - Opts.gap;
    var image = new Drawing(ImageOpts.imageW, ImageOpts.imageH).canvas;
    f(image);
  },

  createInfoCanvas: function() {
    this.infoCanvas = new Element('canvas');
    /*
    TODO
    this.infoCanvas.addEventListener('touchstart', this.tsi.bind(this));
    this.infoCanvas.addEventListener('touchmove', this.tmi.bind(this));
    this.infoCanvas.addEventListener('touchend', this.tei.bind(this));
    this.infoCanvas.addEventListener('mousedown', this.bound_mdi);
    this.infoCanvas.addEventListener('mousemove', this.bound_mmi);
    this.infoCanvas.addEventListener('mouseup', this.bound_mui);
    */
    this.infoCtx = this.infoCanvas.getContext('2d');
    this.hideInfo();
    document.body.appendChild(this.infoCanvas);
  },
  measureLine: function(ctx, font, line) {
    ctx.font = font;
    return ctx.measureText(line);
  },
  fontForWidth: function(ctx, line, fs, w, attr, family) {
    var font, count;

    font = attr + ' ' + fs + 'pt ' + family;
    m = this.measureLine(ctx, font, line);
    
    count = 0;
    while (count < 20 && m.width < w) {
      fs /= 0.9;
      font = attr + ' ' + fs + 'pt ' + family;
      m = this.measureLine(ctx, font, line);
      count++;
    }
    count = 0;
    while (count < 20 && m.width > w) {
      fs *= 0.9;
      font = attr + ' ' + fs + 'pt ' + family;
      m = this.measureLine(ctx, font, line);
      count++;
    }
    return {
      font: font,
      size: fs
    }
  },
  showInfo: function(line, timeout) {
    this.infoCtx.clearRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
    this.infoCtx.fillStyle = 'rgba(255,255,255,0.5)';
    this.infoCtx.fillRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
    this.infoCtx.fillStyle = 'black';
    this.infoCtx.textAlign = 'center';
    var px = this.infoCanvas.width / 2;
    var py = this.infoCanvas.height / 2;

    var attr = 'bold';
    var family = 'Arial';
    var font = this.fontForWidth(this.infoCtx, line, 20, this.infoCanvas.width, attr, family);

    this.infoCtx.font = font.font;

    py += font.size / 2;

    this.infoCtx.fillText(line, px, py);
    this.infoCanvas.setStyle('display', '');
    if (timeout && timeout > 0) {
      setTimeout(this.hideInfo.bind(this), timeout);
    }
  },
  showMenu: function(items, opts) {
    var i,t,tr,td,b,px,py;
    this.infoCtx.clearRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
    this.infoCtx.fillStyle = 'rgba(255,255,255,0.5)';
    this.infoCtx.fillRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);

    function cancel() {
      this.hideInfo();
      //this.hideInfo.bind(this);
    }

    if (opts.cancel) {
      items.push({text:'cancel', cb: cancel});
    }

    if (!this.menuDiv) {
      this.menuDiv = new Element('div');
      //this.menuDiv.setStyle('background', 'red');
      this.menuDiv.setStyle('position', 'absolute');
      document.body.appendChild(this.menuDiv);
    }
    this.menuDiv.innerHTML = '';

    t = new Element('table');
    this.menuDiv.appendChild(t);
    for (i=0; i<items.length; i++) {
      tr = new Element('tr');
      t.appendChild(tr);
      b = new Element('input');
      b.type = 'button';
      b.setAttribute('class', 'menu-button');
      b.setStyle('font-size', 70);
      /*
      b.setStyle('width', '100%');
      b.setStyle('background-color', 'rgba(255,255,255,0.5)');
      */
      //b.innerHTML = items[i].text;
      b.value = items[i].text;
      tr.appendChild(b);

      if (items[i].cb) {
        b.addEventListener('click', items[i].cb.bind(this));
      }
    }

    this.menuDiv.setStyle('display', '');

    console.log('WH: ' + this.menuDiv.offsetWidth + ' ' + this.menuDiv.offsetHeight);
    px = (window.innerWidth - this.menuDiv.offsetWidth)*0.5;
    py = (window.innerHeight - this.menuDiv.offsetHeight)*0.5;
    this.menuDiv.setStyle('left', px);
    this.menuDiv.setStyle('top', py);


    this.infoCanvas.setStyle('display', '');
    // tbr:
    //setTimeout(this.hideInfo.bind(this), 8000);
  },
  /*
  showMenu: function(items) {
    this.infoCtx.clearRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
    this.infoCtx.fillStyle = 'rgba(255,255,255,0.5)';
    this.infoCtx.fillRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
    this.infoCtx.fillStyle = 'black';
    this.infoCtx.textAlign = 'center';
    var i, font, fs=1000, font;
    var px = this.infoCanvas.width / 2;
    var attr = 'bold';
    var family = 'Arial';
    for (i=0; i<items.length; i++) {
      font = this.fontForWidth(this.infoCtx, items[i].text, 20, this.infoCanvas.width, attr, family);
      if (font.size < fs) {
        fs = font.size;
      }
    }
    while (items.length * fs * 1.5 > this.infoCanvas.height) {
      fs *= 0.9;
    }
    font = attr + ' ' + fs + 'pt ' + family;
    this.infoCtx.font = font;
    for (i=0; i<items.length; i++) {
      py = fs + i*fs*1.5;
      this.infoCtx.fillText(items[i].text, px, py);
    }
    this.infoCanvas.setStyle('display', '');



    // tbr:
    setTimeout(this.hideInfo.bind(this), 8000);
  },
  */
  hideInfo: function() {
    this.infoCanvas.setStyle('display', 'none');
    if (this.menuDiv) {
      this.menuDiv.setStyle('display', 'none');
    }
  },
  initialize2: function(image) {
    this.hideInfo();
    this.image = image;

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = 100;
    this.h = 100;

    /*
    this.createInfoCanvas();
    this.infoResize();
    this.showInfo('Loading image', 2000);
    */

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
    this.outputText1 = '';
    this.outputText2 = '';
    this.mouse = true;
    this.lastTime = 0;
    //this.buttonHeight = 25;
    this.buttonHeight = 0;
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

    // buttons
    if (this.buttonHeight > 0) {
      var b1,t;
      if (false) {
        b1 = document.createElement('button');
        b1.style.height = this.buttonHeight;
        b1.style.position = 'absolute';
        b1.style.bottom = '0px';
        b1.style.fontSize = '10px';
        t = document.createTextNode('Mouse + Touch / Touch only');
        b1.appendChild(t);
        document.body.appendChild(b1);
      } else {
        var d = document.createElement('div');
        d.style.position = 'absolute';
        d.style.bottom = '0px';
        var b1 = document.createElement('input');
        b1.type = 'checkbox';
        b1.style.height = this.buttonHeight;
        b1.style.fontSize = '10px';
        b1.checked = true;

        t1 = document.createElement('label');
        t2 = document.createTextNode('+Mouse');

        document.body.appendChild(d);
        d.appendChild(b1);
        d.appendChild(t1);
        t1.appendChild(t2);
      }
      b1.addEventListener('click', this.toggle.bind(this));
    }

    this.ih = -1;
    this.iw = -1;
    this.draw();
    this.showInfo('Scrambling');
    this.scramble2(10);
  },
  scramble: function(n) {
    var i;
    var x = Opts.nx-1;
    var y = 0;
    var xn, yn;

    for (i=0; i<n; i++) {
      this.selectXY(x, y);
      if (0 == i%2) {
        while (x === (xn = irand(Opts.nx)))
          ;
        x = xn;
      } else {
        while (y === (yn = irand(Opts.ny)))
          ;
        y = yn;
      }
    }
  },
  scramble2: function(n) {
    var i;
    for (i=0; i<n; i++) {
      setTimeout(this.single_scramble.bind(this), 300+i*100);
    }
    setTimeout(this.enable.bind(this), 400+n*100, true);
  },
  enable: function(val) {
    this.enabled = val;
    this.hideInfo();
  },
  single_scramble: function() {
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

  /*
  ts: function(event) {
    if (!this.enabled) {
      return;
    }
    var t;
    if (event.touches.length == 1) {
      t = event.touches[1];
      this.select(t.pageX, t.pageY);
    }
  },
  tm: function(event) {
    if (!this.enabled) {
      return;
    }
      event.preventDefault();
  },
  te: function() {
    if (!this.enabled) {
      return;
    }
    this.draw();
  },
  */

  ts: function(event) {
    if (!this.enabled) {
      return;
    }
    var t;
    if (event.touches.length == 1) {
      this.startSelect = true;
      if (this.to) {
        clearTimeout(this.to);
      }
      this.to = setTimeout(this.menu.bind(this), 3000);
    }
  },
  tm: function(event) {
    if (!this.enabled) {
      return;
    }
      event.preventDefault();
  },
  te: function(event) {
    if (!this.enabled) {
      return;
    }
    if (!this.startSelect) {
      return;
    }
    this.startSelect = false;
    if (event.touches.length == 1) {
      t = event.touches[1];
      this.select(t.pageX, t.pageY);
    }
    this.draw();
  },

  md: function(event) {
    if (!this.enabled) {
      return;
    }
    if (this.to) {
      clearTimeout(this.to);
    }
    this.startSelect = true;
    this.to = setTimeout(this.menu.bind(this), 2000);
  },
  mm: function(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
  },
  mu: function(event) {
    if (!this.enabled) {
      return;
    }
    if (!this.startSelect) {
      return;
    }
    this.startSelect = false;
    this.select(event.clientX, event.clientY);
    this.draw();
  },

  menu: function() {
    if (this.startSelect) {
      this.startSelect = false;
      //this.showInfo('Menu - not yet implemented', 3000);
      this.showMenu([{text:'Menu - not yet implemented'}, {text: 'but soon'}], {cancel:true});
    }
  },
/*
  md: function(event) {
    if (!this.enabled) {
      return;
    }
    this.select(event.clientX, event.clientY);
  },
  mm: function(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
  },
  mu: function() {
    if (!this.enabled) {
      return;
    }
    this.draw();
  },
*/

  select: function(x, y) {
    x -= Opts.ox;
    y -= Opts.oy;
    x = Math.floor(x/Opts.kx);
    y = Math.floor(y/Opts.ky);
    this.selectXY(x, y);
  },
  selectXY: function(x, y) {
    this.currentX = x;
    this.currentY = y;
    if (x >= 0 && x <= Opts.nx && y >= 0 && y <= Opts.ny) {
      if (this.field[y][x]) {
        this.field[y][x].draw(x, y, this.ctx, true);
      }
    }

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
    var d;
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
  },
  deb_top: function(text) {
    this.outputText1 = text;
  },
  deb_bot: function(text) {
    this.outputText2 = text;
  },
  showText: function (text, y) {
    if (text !== '') {
      this.ctx.font = 'bold 10pt Arial';
      this.ctx.fillStyle = 'red';
      this.ctx.fillText(text, 5, y);
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
    var nh = window.innerHeight - this.buttonHeight;

    var r1 = nw/nh;
    var r2 = ImageOpts.imageW/ImageOpts.imageH;
    var aw, ah, nw2, nh2;
    if (r1 > r2) {
      nw2 = nh*r2;
      Opts.ox = 0.5*(nw-nw2);
      nw = nw2;
    } else {
      nh2 = nw/r2;
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

    this.infoResize();

    Opts.kx = this.w / Opts.nx;
    Opts.ky = this.h / Opts.ny;
    Opts.tw = this.w / Opts.nx - Opts.gap;
    Opts.th = this.h / Opts.ny - Opts.gap;
  },
  infoResize: function () {

    if (window.innerWidth !== this.infoCanvas.width || window.innerHeight != this.infoCanvas.height) {
      this.infoCanvas.style.width = window.innerWidth+'px';
      this.infoCanvas.style.height = window.innerHeight+'px';
      this.infoCanvas.width = Math.floor(window.innerWidth*0.5);
      this.infoCanvas.height = Math.floor(window.innerHeight*0.5);
      this.infoCanvas.style.position = 'absolute';
    }

    // background: -webkit-gradient( radial, 50% 50%, 0, 50% 50%, 600, from(#fff), to(#444) );
    // background: -moz-radial-gradient( 50% 50%, circle, #fff 0px, #444 600px );
    var radius = (window.innerHeight + window.innerWidth)/2;
    var bg_style;
    bg_style = '-webkit-gradient( radial, 50% 50%, 0, 50% 50%, ' + radius + ', from(#fff), to(#444) )';
    document.body.style.background = bg_style;
    bg_style = '-moz-radial-gradient( 50% 50%, circle, #fff 0px, #444 ' + radius + 'px )';
    document.body.style.background = bg_style;

  },
  draw: function() {
    this.resize();
    this.ctx.fillStyle = '#aaa';
    //this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.showText(this.outputText1, 25);
    this.showText(this.outputText2, 50);

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
    //this.deb_bot('Mouse and Touch');
  },
  removeMouseEventHandler: function() {
    this.canvas.removeEventListener('mousedown', this.bound_md);
    this.canvas.removeEventListener('mousemove', this.bound_mm);
    this.canvas.removeEventListener('mouseup', this.bound_mu);
    //this.deb_bot('Touch only');
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

