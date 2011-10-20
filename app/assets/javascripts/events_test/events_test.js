// scenario:
//  parent div, with
//    mousedown, mousemove, mouseup
//  OR
//    touchstart, touchmove, touchend
//
// child buttons, with click
//
//  -> different event types
//
//
//
// stopPropagation: handles SAME event type:
// -> scenario not affected
// -> stopPropagation not useful here
//
// preventDefault: default action (not implemented in script) is NOT called
// -> not useful in scenario


var App = new Class({
  isTouchDevice: false,
  dragElement: null,
  dragElement_min: 30,

  initialize: function() {
    Logger.show('right');
    Logger.log('events tests');

    this.addButtons(document.body, 'body_');

    this.dragDiv = new Element('div', {id: 'drag_test_1', class: 'dragable'});
    var h1 = new Element('h3', {text: 'div with button'})
    this.dragDiv.appendChild(h1);
    this.dragDiv.style.backgroundColor = 'rgba(0,0,255,0.5)';
    this.addButtons(this.dragDiv, 'div_');
    document.body.appendChild(this.dragDiv);

    this.dragDiv2 = new Element('div', {id: 'drag_test_2', class: 'dragable'});
    this.dragDiv2.style.backgroundColor = 'rgba(0,255,255,0.5)';
    this.addButtons(this.dragDiv2, 'div2_');
    document.body.appendChild(this.dragDiv2);

    this.isTouchDevice = "ontouchstart" in window;
    Logger.log('Touch device: ' + this.isTouchDevice);

    // for dragging:
    if (this.isTouchDevice) {
      document.body.addEventListener('touchmove', this.div_tm.bind(this));
      document.body.addEventListener('touchend', this.div_te.bind(this));
    } else {
      document.body.addEventListener('mousemove', this.div_mm.bind(this));
      document.body.addEventListener('mouseup', this.div_mu.bind(this));
    }
    document.body.addEventListener('click', function(ev) {
        this.dragging = false;
        //Logger.log('  dragging false');
      }.bind(this));

    this.makeDragable(this.dragDiv);
    this.makeDragable(this.dragDiv2);
  },
  
  makeDragable: function(el) {
    if (this.isTouchDevice) {
      el.addEventListener('touchstart', this.div_ts.bind(this));
    } else {
      el.addEventListener('mousedown', this.div_md.bind(this));
    }
    var px = 0;
    var py = el.offsetTop;
    el.style.position = 'absolute';
    el.style.left = px;
    el.style.top = py;
  },

  div_md: function(ev) {
    //Logger.log('div::md ' + ev.target.id);
    this.divDown = true;
    this.dragging = false;

    this.dragElement = ev.target;

    while (!this.dragElement.hasClass('dragable')) {
      this.dragElement = this.dragElement.parentNode;
    }

    //Logger.log('  dragging false');
    this.dragStartX = parseFloat(ev.clientX);
    this.dragStartY = parseFloat(ev.clientY);
    this.posStartX = parseFloat(this.dragElement.style.left);
    this.posStartY = parseFloat(this.dragElement.style.top);
  },
  div_mm: function(ev) {
    if (this.divDown) {
      var dx = ev.clientX - this.dragStartX;
      var dy = ev.clientY - this.dragStartY;
      var px = this.posStartX + dx;
      var py = this.posStartY + dy;
      var d = Math.sqrt(dx*dx+dy*dy);
      if (!this.dragging && (d > this.dragElement_min)) {
        Logger.log('div::mm ' + px + ' ' + py + ' ' + d);
        this.dragging = true;
        // Logger.log('  dragging true');
      }

      if (this.dragging) {
        this.dragElement.style.left = px;
        this.dragElement.style.top = py;
      }
    }
  },
  div_mu: function(ev) {
    // Logger.log('div::mu ' + ev.target.id);
    this.divDown = false;
    //this.dragging = false;
  },

  div_ts: function(event) {
    if (event.changedTouches.length == 1) {
      var touch = event.changedTouches[0];
      var ev = {
        target: touch.target,
        clientX: touch.pageX,
        clientY: touch.pageY
      };
      this.div_md(ev);
    }
  },
  div_tm: function(ev) {
    if (this.divDown) {
      if (event.touches.length == 1) {
        var touch = event.touches[0];
        var ev = {
          target: touch.target,
          clientX: touch.pageX,
          clientY: touch.pageY
        };
        this.div_mm(ev);
      }
    }
  },
  div_te: function(ev) {
    if (event.changedTouches.length == 1) {
      var touch = event.changedTouches[0];
      var ev = {
        target: touch.target,
        clientX: touch.pageX,
        clientY: touch.pageY
      };
      this.div_mu(ev);
    }
  },


  addButtons: function(pel, pref) {
    //var h1 = new Element('h3', {text: 'no preventDefault:'})
    //pel.appendChild(h1);

    var b1 = new Element('button', {text: 'click', id: pref + '1'});
    b1.addEventListener('click', this.clickCB.bind(this));
    pel.appendChild(b1);
  },

  clickCB: function(ev) {
    if (this.dragging) {
      Logger.log('dragging ' + ev.target.id);
    } else {
      Logger.log('click ' + ev.target.id);
      // document.body.style.backgroundColor = randomColor();
      document.body.style.background = randomColor();
    }
  },
});

window.addEvent('domready', function() {
  var app = new App();
});

