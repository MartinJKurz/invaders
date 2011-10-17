
var App = new Class({
  initialize: function() {
    $(document.body).setStyle('background-color', 'red');

    this.firstTouch = true;
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
  showErrorScreen: function() {
    $(document.body).set('text', 'something went wrong');
  },
  removeHandlers: function() {
    var i;
    for (i=0; i<this.el.length; i++) {
      this.el[i].removeEvents('mousedown');
      this.el[i].removeEvents('touchstart');
    }
    $(document.body).removeEvents('mousemove');
    $(document.body).removeEvents('mouseup');
    $(document.body).removeEvents('touchmove');
    $(document.body).removeEvents('touchend');
  },
  setHandlers: function(mouse, touch) {
    Logger.log('M: ' + mouse + ' T: ' + touch);
    this.removeHandlers();
    var i;
    if (mouse)  {
      for (i=0; i<this.el.length; i++) {
        this.el[i].addEvent('mousedown', this.mouseDown.bind(this));
      }
      $(document.body).addEvent('mousemove', this.mouseMove.bind(this));
      $(document.body).addEvent('mouseup', this.mouseUp.bind(this));
    }
    if (touch)  {
      for (i=0; i<this.el.length; i++) {
        this.el[i].addEvent('touchstart', this.touchStart.bind(this));
      }
      $(document.body).addEvent('touchmove', this.touchMove.bind(this));
      $(document.body).addEvent('touchend', this.touchEnd.bind(this));
    }
  },
  showContentLocal: function() {
    // m x n colored d&d divs
    $(document.body).setStyle('margin', '0 0 0 0');
    this.n = this.m = 3;
    var x, y, i;
    var innerSize = document.body.getSize();
    this.w = Math.floor(innerSize.x / this.n);
    this.h = Math.floor(innerSize.y / this.m);
    this.el = [];
    this.container = new Element('div',{styles: {position: 'absolute'}});
    document.body.appendChild(this.container);
    for (j=1; j<this.n; j++) {
      for (i=0; i<this.m; i++) {
        this.el.push(new Element('div',
                        {
                          id: '_' + j + '_' + i,
                          styles: {
                            position: 'absolute',
                            left: i*this.w + 'px',
                            top: j*this.h + 'px',
                            width: this.w+'px',
                            height: this.h+'px',
                            backgroundColor: randomColor()
                          }
                        }));
      }
    }
    for (i=0; i<this.el.length; i++) {
      this.container.appendChild(this.el[i]);
    }
    this.el[0].innerHTML = 'bla';
    /*
    this.el[1].innerHTML = '  \
    <h1>Headline</h1>         \
    <button>A Button</button> \
    <button>B Button</button> \
    <button>C Button</button> \
    <button>D Button</button> \
    <button>E Button</button> \
    ';
    */
    function buttonClick(ev) {
      Logger.log('button: ' + ev.target.id);
    }
    this.el[1].appendChild(new Element('h1', {text: 'Headline'}));
    for (i=0; i<4; i++) {
      var bu = new Element('button', {text: 'Button ' + i});
      bu.id = i;
      bu.addEventListener('click', buttonClick);
      this.el[1].appendChild(bu);
    }

    //this.setHandlers(true, false);
    this.setHandlers(false, true);
    
    

    var button1 = new Element('button', {text: 'Mouse'});
    var button2 = new Element('button', {text: 'Touch'});
    button1.addEvent('click', function(ev) {
      ev.preventDefault();
      this.setHandlers(true, false);
    }.bind(this));

    button2.addEvent('click', function(ev) {
      ev.preventDefault();
      this.setHandlers(false, true)
    }.bind(this));

    document.body.appendChild(button1);
    document.body.appendChild(button2);
  },

  // uses only single touch
  touchStart: function(event) {
    if (this.firstTouch) {
      this.firstTouch = false;
      //alert('Touch: ' + event.targetTouches.length);
    }
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
    // preventDefault must NOT called here, to allow click for child elements
    // event.preventDefault();
  },
  touchEnd: function(event) {
    //if (event.targetTouches.length == 1) {
    //  var ev = event.targetTouches[0];
    if (event.changedTouches.length == 1) {
      var ev = event.changedTouches[0];
      this.drag = false;
      var px = ev.pageX - this.rx;
      var py = ev.pageY - this.ry;
      px = this.w*Math.round(px/this.w);
      py = this.h*Math.round(py/this.h);
      this.target.setStyle('left', px);
      this.target.setStyle('top', py);
    }
    // preventDefault must NOT called here, to allow click for child elements
    // event.preventDefault();
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
    // preventDefault must called here, to allow draw while dragging
    event.preventDefault();
  },
  mouseDown: function(ev) {
    if (this.firstTouch) {
      this.firstTouch = false;
      //alert('DOWN');
    }
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
    px = this.w*Math.round(px/this.w);
    py = this.h*Math.round(py/this.h);
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

var Logger;

// executed after page load:
window.addEvent('domready', function() {
  app = new App();
  app.browserInfo();
  //Logger = new Log();
  Logger.show('right');
  Logger.log('hi');
});

