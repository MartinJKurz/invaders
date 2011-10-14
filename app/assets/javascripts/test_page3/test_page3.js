/*

Audio:
ogg: no
mp3: maybe
mp4: maybe
wav: maybe
pcm/vorbis: no

Problem:
- button not working after one click - canvas consuming the event?
- full screen mode? - get wohl nicht
*/

var Circle = new Class({
  initialize: function(radius, color, borderWidth, borderColor, x, y) {
    this.radius = radius;
    this.color = color;
    this.borderWidth = borderWidth;
    this.borderColor = borderColor;
    this.x = x;
    this.y = y;
  },
  draw: function(ctx, highlighted) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = highlighted ? 'red' : this.borderColor;
    ctx.lineWidth = highlighted ? 7 : this.borderWidth;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
});

var App = new Class({
  initialize: function() {
    $(document.body).setStyle('background-color', 'red');

    this.text = 'all fine';
    this.hit = -1;
    this.mouse = true;
    this.topSpace = 56;
  },
  browserInfo: function() {
    var sizeInfo = this.browserSizeInfo();
    var app = this;
    var token = getMetaContents('csrf-token');
    var req = new Request({
      url: '/pages/test_post_browser_info',
      method: 'post',
      headers: {
	    'X-CSRF-Token': token
      },
      onComplete: function(json_return) {
        if (!JSON.decode(json_return).success) {
          // ERROR
          // handling ??
          app.showErrorScreen();
        } else {
          // now, that the server knows the browser, the content can be requested
          app.showContentLocal();
        }
      }
    });
    req.post(sizeInfo);   // will be automatically wrapped as a json object
  },
  showText: function() {
    if (this.text !== '') {
      this.ctx.font = 'bold 20pt Arial';
      this.ctx.fillStyle = 'red';
      this.ctx.fillText(this.text, 5, 25);
      this.ctx.strokeStyle = 'black';
      this.ctx.strokeText(this.text, 5, 25);
    }
  },
  showErrorScreen: function() {
    $(document.body).set('text', 'something went wrong');
  },
  removeHandlers: function() {
    $(this.canvas).removeEvents('mousedown');
    $(this.canvas).removeEvents('touchstart');
    $(this.canvas).removeEvents('mousemove');
    $(this.canvas).removeEvents('mouseup');
    $(this.canvas).removeEvents('touchmove');
    $(this.canvas).removeEvents('touchend');
  },
  setHandlers: function(mouse, touch) {
    this.removeHandlers();
    if (mouse)  {
      $(this.canvas).addEvent('mousedown', this.mouseDown.bind(this));
      $(this.canvas).addEvent('mousemove', this.mouseMove.bind(this));
      $(this.canvas).addEvent('mouseup', this.mouseUp.bind(this));
    }
    if (touch)  {
      $(this.canvas).addEvent('touchstart', this.touchStart.bind(this));
      $(this.canvas).addEvent('touchmove', this.touchMove.bind(this));
      $(this.canvas).addEvent('touchend', this.touchEnd.bind(this));
    }
  },
  showContentLocal: function() {
    // m x n colored d&d divs
    $(document.body).setStyle('margin', '0 0 0 0');
    this.n = 10;
    var i;
    var toggle;
    var innerSize = document.body.getSize();
    this.radius = Math.min(innerSize.x, innerSize.y) / 7;
    this.circles = [];
    this.canvas = new Element('canvas',{styles: {position: 'absolute', top:this.topSpace}});
    this.canvas.width = innerSize.x;
    this.canvas.height = innerSize.y-this.topSpace;
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);

    for (i=0; i<this.n; i++) {
      this.circles.push(new Circle(this.radius, randomColor(), 2, 'black', irand(innerSize.x), irand(innerSize.y)));
    }
    this.setHandlers(true, false);
    toggle = new Element('button',
      {
        text: 'Mouse -> Touch',
        styles: {
          position: 'absolute',
          right: '0px',
          fontSize: '25px',
          borderRadius: '10px',
          borderStyle: 'solid',
          borderColor: 'blue',
          borderWidth: '3px',
          backgroundColor: 'rgba(255,255,255,1)',
          padding: '10px'
        }
      }
    );
    toggle.addEvent('click', this.toggleHandler.bind(this));
    document.body.appendChild(toggle);

    this.draw();
  },
  toggleHandler: function(ev) {
    ev.preventDefault();
    this.mouse = !this.mouse;
    ev.target.set('text', this.mouse ? 'Mouse -> Touch' : 'Touch -> Mouse');
    this.text = this.mouse ? 'Mouse' : 'Touch';
    this.setHandlers(this.mouse, !this.mouse);
  },
  draw: function() {
    var i;
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (i=0; i<this.n; i++) {
      this.circles[i].draw(this.ctx, this.hit === i);
    }
    this.ctx.lineWidth = 1;
    this.showText();
  },

  touchToCanvas: function(ev) {
    return {x:ev.pageX, y:ev.pageY - this.topSpace};
  },
  mouseToCanvas: function(obj) {
    return {x:obj.x, y:obj.y - this.topSpace};
  },
  // uses only single touch
  touchStart: function(event) {
    this.text = 'Touch: ' + event.targetTouches.length;
    
    if (event.targetTouches.length == 1) {
      var ev = event.targetTouches[0];
      var xy = this.touchToCanvas(ev);
      this.select(xy.x, xy.y);
      this.draw();
    }
    event.preventDefault();
  },
  touchEnd: function(event) {
    this.text = 'UP ' + event.targetTouches.length;
    this.hit = -1;
    this.draw();

    event.preventDefault();
  },
  touchMove: function(event) {
    var ev, px, py;
    this.text = 'MOVE ' + event.targetTouches.length;
    if (event.targetTouches.length == 1) {
      if (this.hit !== -1) {
        ev = event.targetTouches[0];
        var xy = this.touchToCanvas(ev);
        this.circles[this.hit].x = xy.x;
        this.circles[this.hit].y = xy.y;
        this.draw();
      }
    }
    event.preventDefault();
  },
  select: function(x, y) {
    var i, c;
    var dx, dy, d, md = 10000;
    this.hit = -1;
    for (i=0; i<this.n; i++) {
      dx = this.circles[i].x - x;
      dy = this.circles[i].y - y;
      d = Math.sqrt(dx*dx+dy*dy);
      if (d < this.circles[i].radius && d < md) {
        md = d;
        this.hit = i;
      }
    }
    if (this.hit != -1) {
      c = this.circles[this.hit];
      this.circles.splice(this.hit, 1);
      this.circles.push(c);

      this.hit = this.n - 1;
      //this.text = 'HIT';
    }
  },
  mouseDown: function(ev) {
    this.text = 'DOWN';
    var xy = this.mouseToCanvas(ev.client);
    this.select(xy.x, xy.y);
    this.draw();
    ev.preventDefault();
  },
  mouseUp: function(ev) {
    this.text = 'UP';
    this.hit = -1;
    this.draw();
    ev.preventDefault();
  },
  mouseMove: function(ev) {
    if (this.hit === -1) {
      return;
    }
    this.text = 'MOVE';
    var xy = this.mouseToCanvas(ev.client);
    this.circles[this.hit].x = xy.x;
    this.circles[this.hit].y = xy.y;
    this.draw();
    ev.preventDefault();
  },
  
  browserSizeInfo: function() {
    return {
      screenSize: {
        x: window.screen.width,
        y: window.screen.height
      },
      innerSize: $(document.body).getSize(),    // client size (without scrollbars)
    };
  },
});

// executed after page load:
window.addEvent('domready', function() {
  app = new App();
  app.browserInfo();
});

