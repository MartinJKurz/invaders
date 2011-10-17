
// plan B
// one DragManager, auto instanciated

var Drag = {
  M_VER: 0,           // drag only in vertical direction
  M_HOR: 1,           // "           horizontal "
  M_BOTH: 2,          // drag direction determined after start
  M_FREE: 3,          // free 2d dragging
  TARGET_NEAREST: 0,
  TARGET_STOP: 1,
  TARGET_COAST: 3
};

var DragManagerClass = new Class({
  isTouchDevice: false,
  dragElement: null,
  dragLimit: 30,
  oneDragElement: null,

  initialize: function() {
    this.isTouchDevice = "ontouchstart" in window;
    Logger.log('Touch device: ' + this.isTouchDevice);

    if (this.isTouchDevice) {
      document.body.addEventListener('touchstart', this.gts.bind(this));
      document.body.addEventListener('touchmove', this.gtm.bind(this));
      document.body.addEventListener('touchend', this.gte.bind(this));
    } else {
      document.body.addEventListener('mousedown', this.gmd.bind(this));
      document.body.addEventListener('mousemove', this.gmm.bind(this));
      document.body.addEventListener('mouseup', this.gmu.bind(this));
    }
    document.body.addEventListener('click', function(ev) {
        if (this.dragElement) {
          this.dragElement.dragging = false;
        }
      }.bind(this));
  },

  gmd: function(ev) {
    if (this.oneDragElement) {
      //this.dragElement = this.oneDragElement;
      //this.dragElement.md(ev);
      this.oneDragElement.md(ev);
    }
  },
  gts: function(event) {
    if (this.oneDragElement) {
      if (event.targetTouches.length == 1) {
        // Logger.log('gtm --- ', true);
        touch = event.targetTouches[0];
        var ev = {};
        ev.clientX = touch.pageX;
        ev.clientY = touch.pageY;
        ev.target = this.oneDragElement;
        this.gmd(ev);
      } else {
        Logger.log('gts: ' + event.targetTouches.length);
      }
    }
  },

  gmm: function(ev) {
    if (this.dragElement) {
      //Logger.log('gmm --- ', true);
      this.dragElement.mm(ev);
    }
  },
  gmu: function(ev) {
    if (this.dragElement) {
      //Logger.log('gmu --- ', true);
      this.dragElement.mu(ev);
      this.dragElement = null;
    }
  },
  gtm: function(event) {
    if (this.dragElement) {
      if (event.targetTouches.length == 1) {
        // Logger.log('gtm --- ', true);
        touch = event.targetTouches[0];
        var ev = {};
        ev.clientX = touch.pageX;
        ev.clientY = touch.pageY;
        this.dragElement.mm(ev);
      } else {
        Logger.log('TTL: ' + event.targetTouches.length);
      }
    } else {
      Logger.log('no drag element');
    }
    // needed: to draw while dragging
    event.preventDefault();
  },
  gte: function(event) {
    if (this.dragElement) {
      if (event.changedTouches.length == 1) {
        //Logger.log('gte --- ', true);
        touch = event.changedTouches[0];
        var ev = {};
        ev.clientX = touch.pageX;
        ev.clientY = touch.pageY;
        this.dragElement.mu(ev);
      }
    }
    // forbidden, to allow click event on child element
    // event.preventDefault();
  }
});

var DragManager = null;
window.addEvent('domready', function() {
  DragManager = new DragManagerClass();
});



var Dragable = new Class({
  Extends: Emitter,
  startX: -1,
  startY: -1,
  el: null,
  dragging: false,
  positions: [],
  posIdx: -1,
  motion: Drag.M_BOTH,
  motionTarget: Drag.TARGET_NEAREST,
  full: false,      // if full is true, then there is only one Dragable visible,
                    // to start drag a point on the page can be used to start drag
                    // if full is false (the default), the Dragable itself must
                    // be hit (receive the touchstart/mousedown event)

  initialize: function(elType, full) {
    this.el = new Element(elType);
    this.el.style.position = 'absolute';
    this.full = $defined(full) ? full : false;

    if (this.full) {
      if (DragManager.isTouchDevice) {
        this.el.addEventListener('touchstart', this.ts.bind(this));
      } else {
        this.el.addEventListener('mousedown', this.md.bind(this));
      }
    } else {
      // handler already set in DragManager class
    }
  },

  setPosition: function(px, py) {
    this.el.style.left = px;
    this.el.style.top = py;
  },

  // arbitrary number of positions
  // [[x0,y0],[x1,y1], ...]
  setTargetPositions: function(tp) {
    this.targetPositions = tp;
  },
  
  // 2 positions
  // [[x0,y0],[x1,y1]]
  setLimits: function(limits) {
    this.limits = limits;
  },
  
  stopAnimation: function() {
    if (this.timer) {
      this.timer.stop();
    }
  },

  md: function(ev) {
    this.stopAnimation();
    DragManager.dragElement = this;
    //Logger.log('md');
      
    var px = parseFloat(this.el.style.left);
    if (isNaN(px)) {
      px = 0;
    }
    var py = parseFloat(this.el.style.top);
    if (isNaN(py)) {
      py = 0;
    }
    /*
    Logger.log('L:' + this.el.style.left);
    Logger.log('px:' + px);
    Logger.log('T:' + this.el.style.top);
    Logger.log('py:' + py);
    */

    this.el.opx = px;  // original position
    this.el.opy = py;
    this.el.cpx = px;  // current position
    this.el.cpy = py;


    var x = ev.clientX;
    var y = ev.clientY;
    this.startX = x;
    this.startY = y;
    this.dragging = false;
    this.positions = [];
    this.addPosition(x, y);

    this.hor = false;
    this.ver = false;

    if (this.motion === Drag.M_VER) {
      this.ver = true;
    } else if (this.motion === Drag.M_VER) {
      this.hor = true;
    }

  },
  ts: function(event) {
    if (event.targetTouches.length == 1) {
      //Logger.log('ts');
      var touch = event.targetTouches[0];

      var ev = {};
      ev.clientX = touch.pageX;
      ev.clientY = touch.pageY;
      this.md(ev);
    }
    // testing:
    // event.preventDefault();
  },

  mm: function(ev) {
    var x, y, dx, dy, d, started;
    if (-1 !== this.startX) {
      // Logger.log('mm');
      x = ev.clientX;
      y = ev.clientY;
      
      this.addPosition(x, y);

      dx = x - this.startX;
      dy = y - this.startY;

      /*
      if (this.motion === Drag.M_VER) {
        this.ver = true;
      } else if (this.motion === Drag.M_VER) {
        this.hor = true;
      }
      */


      if (this.ver) {
        dx = 0;
      } else if (this.hor) {
        dy = 0;
      }

      if (dx !== 0) {
        Logger.log('ERROR: dx = ' + dx);
      }

      d = Math.sqrt(dx*dx+dy*dy);
      started = false;
      if (d > DragManager.dragLimit && !this.dragging) {
        this.dragging = true;
        //Logger.log('START DRAGGING');
        started = true;
        switch (this.motion) {
          case Drag.M_HOR:
            this.hor = true;
            break;
          case Drag.M_VER:
            this.ver = true;
            break;
          case Drag.M_BOTH:
            if (Math.abs(dx) < 2) {
              this.ver = true;
            } else if (Math.abs(dy) < 2) {
              this.hor = true;
            }
            break;
          case Drag.M_FREE:
            // no restriction
            break;
        }
      }

      // android browser hangs sometimes
      //
      if (this.dragging) {
        //Logger.log('[', true);
        try {
          /*
          Logger.log('this: ' + $type(this));
          Logger.log('this.el: ' + $type(this.el));
          Logger.log('style pos ' + this.el.getStyle('left') + ' ' + this.el.getStyle('top'));
          Logger.log('cpx/cpy: ' + this.el.cpx + ' ' + this.el.cpy);
          Logger.log('dx/dy: ' + dx + ' ' + dy);
          */
          this.el.setStyle ('left', this.el.cpx + dx); 
          this.el.setStyle ('top', this.el.cpy + dy);
        } catch (msg) {
          Logger.log('\nERROR');
          Logger.log(msg);
        }
        //Logger.log(']');
      } else {
        // Logger.log('NOT DRAGGING');
      }
      /*
      if (this.dragging) {
        Logger.log('.', true);    // ok
        try {
          this.el.setStyle ('left', this.el.cpx + dx); 
          this.el.setStyle ('top', this.el.cpy + dy);
        } catch (msg) {
          Logger.log('\nERROR');  // not reached
          Logger.log(msg);
        }
        Logger.log('|', true);    // not reached
      }
      */
    } else {
      Logger.log('startX = -1');
    }
  },

  // timer target needs a cb
  cb: function(type, vi) {
    this.el.style.left = vi.value[0];
    this.el.style.top = vi.value[1];
    this.el.cpx = parseFloat(this.el.getStyle('left'));
    if (isNaN(this.el.cpx)) {
      this.el.cpx = 0;
    }
    this.el.cpy = parseFloat(this.el.getStyle('top'));
    if (isNaN(this.el.cpy)) {
      this.el.cpy = 0;
    }

    if ('finished' === type) {
      this.notify('finished');
    }
  },

  _adjustInterpolationValues: function(T, times, positions, startX, startY, endX, endY) {
    var k;
    switch (times.length) {
      case 0:
        times.push(0);
        times.push(1);
        positions.push([startX, startY]);
        positions[0] = [startX, startY];
        positions.push([endX, endY]);
        T = 10;
        Logger.log('ERROR corrected');
        break;
      case 1:
        times[0] = 0;
        times.push(1);
        positions[0] = [startX, startY];
        positions.push([endX, endY]);
        T = 10;
        Logger.log('corrected');
        break;
      default:
        break;
    }
    k = 1/T;
    for (i=0; i<times.length; i++) {
      times[i] *= k;
    }
    return T;
  },

  _mu_nearest: function() {
    if (0 === this.vx && 0 === this.vy) {
      Logger.log('no time');
      return;
    }
    var dt = 1000/60;

    var vx, vy, minD, tx, ty, px, py, a, fx, fy, use_x,
    i, dx, dy, d, times, positions, T, done, inter;

    px = this.el.cpx;
    py = this.el.cpy;

    tx = this.el.opx;
    ty = this.el.opy;

    this.targetIdx = -1;
    if (this.targetPositions) {
      minD = 1000000;
      for (i=0; i<this.targetPositions.length; i++) {
        dx = px-this.targetPositions[i][0];
        dy = py-this.targetPositions[i][1];
        d = dx*dx + dy*dy;
        if (d < minD) {
          this.targetIdx = i;
          minD = d;
          tx = this.targetPositions[i][0];
          ty = this.targetPositions[i][1];
        }
      }
    }

    a = Math.atan2(ty-py, tx-px);
    fx = Math.cos(a);
    fy = Math.sin(a);
    fx *= 0.03;
    fy *= 0.03;

    use_x = Math.abs(fx) > Math.abs(fy);

    // TODO: for all targets, find the one which is nearest in time - not distance
    // -> no
    times = [];
    positions = [];

    T = 0;
    done = false;
    vx = this.vx;
    vy = this.vy;
    while (!done) {
      times.push(T);
      if (this.hor) {
        py = ty;
      } else if (this.ver) {
        px = tx;
      }
      positions.push([px, py]);
      T += dt;
      px += vx*dt;
      vx += fx*dt;
      py += vy*dt;
      vy += fy*dt;
      if (use_x) {
        done = fx > 0 ? px > tx : px < tx;
      } else {
        done = fy > 0 ? py > ty : py < ty;
      }
    }
    T -= dt;

    T = this._adjustInterpolationValues(T, times, positions, px, py, tx, ty);
    times[0] = 0;
    times[times.length-1] = 1;
    positions[times.length-1][0] = tx;
    positions[times.length-1][1] = ty;

    inter = new VectorInterpolator(times, positions);
    this.timer = new IntervalTimer(Math.round(dt), {duration: T, delay: 0});
    this.timer.addReceiver(inter, ['tick', 'finished']);
    inter.addReceiver(this, ['value_changed', 'finished']);

    this.timer.start();
  },

  _mu_stop: function() {
    // nothing to do here
  },
/*
  _inLimits: function(px,py) {
    function between(val, one, two) {
      return (val >= one && val <= two) || (val >= two && val <= one);
    }

    if (!this.limits) {
      return true;
    }

    if (this.ver) {
      return between(py, this.limits[0][1], this.limits[1][1]);
    } else if (this.hor) {
      return between(px, this.limits[0][0], this.limits[1][0]);
    } else {
      // TODO
      return true;
    }
  },
*/
  // -1: in limits
  // 0,1 limit point index
  _inLimits: function(px,py) {
    function between(val, one, two) {
      return (val >= one && val <= two) || (val >= two && val <= one);
    }

    if (!this.limits) {
      return -1;
    }

    var p, a, b, k;
    if (this.ver) {
      a = this.limits[0][1];
      b = this.limits[1][1];
      p = py;
    } else if (this.hor) {
      a = this.limits[0][0];
      b = this.limits[1][0];
      p = px;
    } else {
      // TODO
      return -1;
    }

    k = (p-a)/(b-a);
    return k < 0 ? 0 : k > 1 ? 1 : -1;
  },

  _mu_coast: function() {
    // 
    var dt, T, times, positions, px, py, vx, vy, v, dx, dy, tx, ty;

    dt = 1000/60;
    T = 1000;

    px = this.el.cpx;
    py = this.el.cpy;

    var check = this._inLimits(px, py);
    if (check !== -1) {
      return;
    }

    tx = px;
    ty = py;

    times = [];
    positions = [];

    vx = this.vx;
    vy = this.vy;

    if (this.ver) {
      vx = 0;
      this.limits[0][0] = px;
      this.limits[1][0] = px;
    } else if (this.hor) {
      vy = 0;
      this.limits[0][1] = py;
      this.limits[1][1] = py;
    }

    v = Math.sqrt(vx*vx+vy*vy);
    T = 0;
    dx = vx / v;
    dy = vy / v;
    while (v > 0 && -1 == (check = this._inLimits(tx,ty))) {
      times.push(T);
      T += dt;
      positions.push([tx,ty]);
      tx += dt*v*dx;
      ty += dt*v*dy;
      v -= 0.05;
    }

    if (-1 !== check) {
      times.push(T);
      positions.push([this.limits[check][0],this.limits[check][1]]);
    }

    //T -= dt;
    T = this._adjustInterpolationValues(T, times, positions, px, py, tx, ty);
    times[0] = 0;
    times[times.length-1] = 1;

    inter = new VectorInterpolator(times, positions);
    this.timer = new IntervalTimer(Math.round(dt), {duration: T, delay: 0});
    this.timer.addReceiver(inter, ['tick', 'finished']);
    inter.addReceiver(this, ['value_changed', 'finished']);

    this.timer.start();
  },

  mu: function(ev) {
    DragManager.dragElement = null;
    //Logger.log('mu');

    this.startX = -1;
    this.el.cpx = parseFloat(this.el.getStyle('left'));
    if (isNaN(this.el.cpx)) {
      this.el.cpx = 0;
    }
    this.el.cpy = parseFloat(this.el.getStyle('top'));
    if (isNaN(this.el.cpy)) {
      this.el.cpy = 0;
    }
    if (this.dragging) {

      switch (this.motionTarget) {
        case Drag.TARGET_NEAREST:
          this._mu_nearest();
          break;
        case Drag.TARGET_STOP:
          this._mu_stop();
          break;
        case Drag.TARGET_COAST:
          this._mu_coast();
          break;
      }
    }
    delete this.hor;
    delete this.ver;
    delete this.positions;
    delete this.posIdx;
    delete this.startX;
    delete this.startY;
    delete this.vx;
    delete this.vy;
  },
  /*
  mu: function(ev) {
    DragManager.dragElement = null;
    Logger.log('mu');

    this.startX = -1;
    this.el.cpx = parseFloat(this.el.getStyle('left'));
    if (isNaN(this.el.cpx)) {
      this.el.cpx = 0;
    }
    this.el.cpy = parseFloat(this.el.getStyle('top'));
    if (isNaN(this.el.cpy)) {
      this.el.cpy = 0;
    }
    if (this.dragging) {
      var dt = 1000/60;

      var vx, vy, minD, tx, ty, px, py, a, fx, fy, use_x,
          i, dx, dy, d, times, positions, T, k, done, inter, timer;

      px = this.el.cpx;
      py = this.el.cpy;

      tx = this.el.opx;
      ty = this.el.opy;

      this.targetIdx = -1;
      if (this.targetPositions) {
        minD = 1000000;
        for (i=0; i<this.targetPositions.length; i++) {
          dx = px-this.targetPositions[i][0];
          dy = py-this.targetPositions[i][1];
          d = dx*dx + dy*dy;
          if (d < minD) {
            this.targetIdx = i;
            minD = d;
            tx = this.targetPositions[i][0];
            ty = this.targetPositions[i][1];
          }
        }
      }

      a = Math.atan2(ty-py, tx-px);
      fx = Math.cos(a);
      fy = Math.sin(a);
      fx *= 0.03;
      fy *= 0.03;

      use_x = Math.abs(fx) > Math.abs(fy);



      // TODO: for all targets, find the one which is nearest in time - not distance
      // -> no
      times = [];
      positions = [];

      T = 0, k;
      done = false;
      vx = this.vx;
      vy = this.vy;
      while (!done) {
        times.push(T);
        if (this.hor) {
          py = ty;
        } else if (this.ver) {
          px = tx;
        }
        positions.push([px, py]);
        T += dt;
        px += vx*dt;
        vx += fx*dt;
        py += vy*dt;
        vy += fy*dt;
        if (use_x) {
          done = fx > 0 ? px > tx : px < tx;
        } else {
          done = fy > 0 ? py > ty : py < ty;
        }
      }
      T -= dt;


      // check
      if (1 === times.length) {
        times = [];
        times.push(0);
        times.push(1);
        positions = [];
        positions.push([px,py]);
        positions.push([tx,ty]);
        T = 10;
        // Logger.log('corrected');
      }


      k = 1/T;
      for (i=0; i<times.length; i++) {
        times[i] *= k;
      }
      times[0] = 0;
      times[times.length-1] = 1;
      positions[times.length-1][0] = tx;
      positions[times.length-1][1] = ty;

      inter = new VectorInterpolator(times, positions);
      timer = new IntervalTimer(Math.round(dt), {duration: T, delay: 0});
      timer.addReceiver(inter, ['tick', 'finished']);
      inter.addReceiver(this, ['value_changed', 'finished']);

      timer.start();
    }
    delete this.hor;
    delete this.ver;
    delete this.positions;
    delete this.posIdx;
    delete this.startX;
    delete this.startY;
    delete this.vx;
    delete this.vy;
  },
  */

  addPosition: function(x, y) {
    var SAMPLES = 5;
    var n = this.positions.length;
    var li = n;
    var fi = 0;
    var es, ee;
    if (n < SAMPLES) {
      this.positions.push({x:x, y:y, t:Date.now()});
      if (n === SAMPLES-1) {
        this.posIdx = 0;
      }
    } else {
      li = this.posIdx;
      this.positions[this.posIdx] = ({x:x, y:y, t:Date.now()});
      this.posIdx = (this.posIdx+1) % SAMPLES;
      fi = this.posIdx;
    }

    if (n > 0 && this.dragging) {

      le = this.positions[li];
      fe = this.positions[fi];

      this.vx = (le.x - fe.x) / (le.t - fe.t);
      this.vy = (le.y - fe.y) / (le.t - fe.t);
    } else {
      this.vx = 0;
      this.vy = 0;
    }
  },
});
