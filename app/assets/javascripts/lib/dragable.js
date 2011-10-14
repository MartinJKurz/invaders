var global_dragable = null;


window.addEvent('domready', function() {
  function gmm(ev) {
    if (global_dragable) {
      global_dragable.mm(ev);
    }
  }
  function gmu(ev) {
    if (global_dragable) {
      global_dragable.mu(ev);
    }
  }

  document.body.addEventListener('mousemove', gmm);
  document.body.addEventListener('mouseup', gmu);
});

var Dragable = new Class({
  Extends: Emitter,
  DRAGSTART: 100,
  startX: -1,
  startY: -1,
  el: null,
  dragging: false,
  positions: [],
  posIdx: -1,
  motion: 2,

  initialize: function(elType) {
    this.el = new Element(elType);
    this.el.style.position = 'absolute';

    this.el.addEventListener('mousedown', this.md.bind(this));
  },

  setPosition: function(px, py) {
    this.el.style.left = px;
    this.el.style.top = py;
  },

  setTargetPositions: function(tp) {
    this.targetPositions = tp;
  },

  md: function(ev) {
    global_dragable = this;

    var px = parseFloat(this.el.style.left);
    if (isNaN(px)) {
      px = 0;
    }
    var py = parseFloat(this.el.style.top);
    if (isNaN(py)) {
      py = 0;
    }
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

    ev.preventDefault();
  },

  mm: function(ev) {
    var x, y, dx, dy, d, started;
    if (-1 !== this.startX) {
      x = ev.clientX;
      y = ev.clientY;
      
      this.addPosition(x, y);

      dx = x - this.startX;
      dy = y - this.startY;


      if (this.hor) {
        dy = 0;
      } else if (this.ver) {
        dx = 0;
      }

      d = dx*dx+dy*dy;
      started = false;
      if (d > this.DRAGSTART && !this.dragging) {
        this.dragging = true;
        started = true;
        switch (this.motion) {
          case 0:
            this.hor = true;
            break;
          case 1:
            this.ver = true;
            break;
          case 2:
            if (Math.abs(dx) < 2) {
              this.ver = true;
            } else if (Math.abs(dy) < 2) {
              this.hor = true;
            }
        }

      }
      if (this.dragging) {
        this.el.setStyle ('left', this.el.cpx + dx); 
        this.el.setStyle ('top', this.el.cpy + dy);
      }
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

  mu: function(ev) {
    global_dragable = null;

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
    }
  },
});
