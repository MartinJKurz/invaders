function random(n) {
  return Math.floor(Math.random()*n);
}

function randomColor() {
  return '#' + random(16).toString(16) + random(16).toString(16) + random(16).toString(16);
}

var App = new Class({
  initialize: function() {
    $(document.body).setStyle('background-color', 'red');
  },
  browserInfo: function() {
    var sizeInfo = this.browserSizeInfo();
    var app = this;
    var req = new Request({
      url: '/pages/test_post_browser_info',
      method: 'post',
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
  showErrorScreen: function() {
    $(document.body).set('text', 'something went wrong');
  },
  showContentLocal: function() {
    // $(document.body).set('text', 'all fine');
    // m x n colored d&d divs
    $(document.body).setStyle('margin', '0 0 0 0');
    this.n = this.m = 3;
    var x, y, e;
    var innerSize = document.body.getSize();
    this.w = innerSize.x / this.n;
    this.h = innerSize.y / this.m;
    for (j=0; j<this.n; j++) {
      for (i=0; i<this.m; i++) {
        e = new Element('div',
                        {
                          id: '_' + j + '_' + i,
                          styles: {
                            position: 'absolute',
                            left: i*this.w + 'px',
                            top: j*this.h + 'px',
                            width: this.w+'px',
                            height: this.h+'px',
                            backgroundColor: randomColor()
                          },
                          events: {

                            //mousedown: this.mouseDown.bind(this),
                            touchstart: this.touchStart.bind(this),
                          }
                        });
        document.body.appendChild(e);
      }
    }

    $(document.body).set({
      events: {
        touchEnd: this.mouseUp.bind(this),
        touchMove: this.touchMove.bind(this),
        //mouseup: this.mouseUp.bind(this),
        //mousemove: this.mouseMove.bind(this),
      }
    });
  },

  // uses only single touch
  touchStart: function(event) {
    if (event.targetTouches.length == 1) {
      var ev = event.targetTouches[0];

      this.ox = ev.target.style.left.toFloat();
      this.oy = ev.target.style.top.toFloat();
      this.rx = ev.pageX - this.ox;
      this.ry = ev.pageY - this.oy;
      this.drag = true;
      this.target = ev.target;
      this.target.parentNode.appendChild(this.target);
    }
  },
  touchEnd: function(event) {
    if (event.targetTouches.length == 1) {
      var ev = event.targetTouches[0];
      this.drag = false;
      var px = ev.pageX - this.rx;
      var py = ev.pageY - this.ry;
      console.log('drop 1 ' + px + '/' + py);
      px = this.w*Math.round(px/this.w);
      py = this.h*Math.round(py/this.h);
      console.log('drop 2 ' + px + '/' + py);
      this.target.setStyle('left', px);
      this.target.setStyle('top', py);
    }
  },
  touchMove: function(event) {
    if (event.targetTouches.length == 1) {
      var ev = event.targetTouches[0];
      if (this.drag) {
        var px = ev.pageX - this.rx;
        var py = ev.pageY - this.ry;
        this.target.setStyle('left', px);
        this.target.setStyle('top', py);
      }
    }
  },
  mouseDown: function(ev) {
    this.ox = ev.target.style.left.toFloat();
    this.oy = ev.target.style.top.toFloat();
    this.rx = ev.client.x - this.ox;
    this.ry = ev.client.y - this.oy;
    this.drag = true;
    this.target = ev.target;
    this.target.parentNode.appendChild(this.target);
  },
  mouseUp: function(ev) {
    this.drag = false;
    var px = ev.client.x - this.rx;
    var py = ev.client.y - this.ry;
    console.log('drop 1 ' + px + '/' + py);
    px = this.w*Math.round(px/this.w);
    py = this.h*Math.round(py/this.h);
    console.log('drop 2 ' + px + '/' + py);
    this.target.setStyle('left', px);
    this.target.setStyle('top', py);
  },
  mouseMove: function(ev) {
    if (this.drag) {
      var px = ev.client.x - this.rx;
      var py = ev.client.y - this.ry;
      this.target.setStyle('left', px);
      this.target.setStyle('top', py);
    }
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

