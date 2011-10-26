/****************************************************************
 * interpolator
 ****************************************************************/



var Interpolator = new Class({
  Extends: Emitter,
  _times: [],         // [0,1]
  _values: [],        // any value, to be interpolated by Interpolator implementations

  initialize: function(times, values) {
    this._times = times;
    this._values = values;
    if (this._times.length != this._values.length) {
      throw('Interpolator: times and values must have equal length');
    }
    if (this._times.length === 0) {
      throw('Interpolator: times and values must not be empty');
    }
    if (this._times[0] !== 0 || this._times[this._times.length-1] !== 1) {
      //throw('Interpolator: first time must be 0, last 1');
      throw('Interpolator: first time must be 0, last 1 len: ' + this._times.length);
    }
    var i, t0 = this._times[0], t1;
    for (i=1; i<this._times.length; i++) {
      t1 = this._times[i];
      if (t1 <= t0) {
        throw('Interpolator: times must be continousely increasing');
      }
      t0 = t1;
    }
  },
  cb: function(type, timer) {
    var t = timer._rel_elapsed;
    var info = this._findIndices(t);
    var ret = this._calculate(info.a, info.b, info.r);
    this.value = ret;
    this.notify('value_changed');
    if ('finished' === type) {
      this.notify('finished');
    }
    if ('started' === type) {
      this.notify('started');
    }
    if ('interval started' === type) {
      this.notify('started');
    }
    return ret;
  },
  _recFind: function(t, a, b) {
    if (b < a) {
      console.log('err 1');
      return;
    }
    if (a === b) {
      console.log('err 2');
      return;
    }
    if (a+1 === b) {
      var r = (t - this._times[a]) / (this._times[b] - this._times[a]);
      if (r > 1) {
        console.log('ERR');
      }
      return {a:a, b:b, r:r};
    }
    var c = Math.floor((a+b)/2);
    if (t > this._times[c]) {
      return this._recFind(t, c, b);
    } else {
      return this._recFind(t, a, c);
    }
  },
  _findIndices: function(t) {
    if (t<=0) {
      return {a:0, b:0, r:1};
    }
    if (t>=1) {
      return {a:this._times.length-1, b:this._times.length-1, r:1};
    }
    var a=0;
    var b=this._times.length-1;
    return this._recFind(t, a, b);
  }

});

var LinearInterpolator = new Class({
  Extends: Interpolator,

  initialize: function(times, values) {
    this.parent(times, values);
  },
  _calculate: function(a, b, r) {
    return (1-r)*this._values[a] + r*this._values[b];
  }
});

var VectorInterpolator = new Class({
  Extends: Interpolator,

  initialize: function(times, values) {
    this.parent(times, values);
    this.length = this._values[0].length;
  },
  _calculate: function(a, b, r) {
    var i;
    var ret = [];
    for (i=0; i<this.length; i++) {
      ret.push((1-r)*this._values[a][i] + r*this._values[b][i]);
    }
    return ret;
  }
});

var MOVE_LIMIT = {
  dist: 1,
  v: 0.05,
  Ain: 0.95,
  Aout: 0.65,
  F1: 0.0002,    // proportional to distance
  F2: 0.02     // not prop
};

var Move = new Class({
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0,
  bx: 0,
  by: 0,
  px: 0,
  py: 0,
  timer: null,
  dt: 1000/60,
  //dt: 1/60,

  initialize: function(el, vx, vy, ax, ay, bx, by) {
    if (!$defined(el)) {
      throw(' - missing element');
    }
    /* TODO
    if (!$defined(by)) {
      throw('Move(el, ax, ay, bx, by) or Move(el, ax, ay, bx, by, vx, vy) - missing target position');
    }
    */
    this.el = el;
    if ($defined(vx)) {
      this.vx = vx;
    }
    if ($defined(vy)) {
      this.vy = vy;
    }
    this.px = parseFloat(el.style.left);
    this.py = parseFloat(el.style.top);

    if ($defined(by)) {
      this.limits = [[ax,ay],[bx,by]];
    } else {
      this.limits = null;
    }

    this.ver = this.limits[0][0] === this.limits[1][0];
    this.hor = this.limits[0][1] === this.limits[1][1];

    this.timer = new IntervalTimer(this.dt);
    this.timer.addReceiver(this, ['tick']);
  },
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
  cb: function(type, timer) {
    var dx, dy, v, d, fx, fy, check, tx, ty, A;

    this.px += this.vx * this.dt;
    this.py += this.vy * this.dt;

    check = this._inLimits(this.px, this.py);
    
    v = Math.sqrt(this.vx*this.vx+this.vy*this.vy);

    if (-1 == check) {
      A = MOVE_LIMIT.Ain;
      if (v < MOVE_LIMIT.v) {
        this.timer.stop();
      }
    } else {
      A = MOVE_LIMIT.Aout;
      tx = this.limits[check][0];
      ty = this.limits[check][1];
      dx = tx - this.px;
      dy = ty - this.py;
      d = Math.sqrt(dx*dx+dy*dy);
      if (v < MOVE_LIMIT.v && d < MOVE_LIMIT.dist) {
        this.timer.stop();
        this.px = this.tx;
        this.py = this.ty;
      }
    }

    this.el.style.left = this.px;
    this.el.style.top = this.py;
    if (-1 !== check) {
      switch (0) {
        case 0:
          fx = MOVE_LIMIT.F1*dx;
          fy = MOVE_LIMIT.F1*dy;
          break;
        case 1:
          fx = MOVE_LIMIT.F2*dx/d;
          fy = MOVE_LIMIT.F2*dy/d;
          break;
        case 2:
          fx = MOVE_LIMIT.F2*dx/(d+20);
          fy = MOVE_LIMIT.F2*dy/(d+20);
          break;
      }
      this.vx += fx*this.dt;
      this.vy += fy*this.dt;
    }
    this.vx *= A;
    this.vy *= A;
  },
  start: function() {
    this.timer.start();
  },
  stop: function() {
    this.timer.stop();
  },
});

/*
var Swap = new Class({
  initialize: function(page1, page2, method) {
  },
  swap: function(page1, page2, method) {
    var inter = new VectorInterpolator();
  },
});
*/
/*
var Swap = {
  swap: function(page1, page2, method) {
    var times = [];
    var positions = [];
    var inter;
    var dt = 1000/60;
    var duration;
    var timer;

    this.page1 = page1;
    this.page2 = page2;

    this.page1.style.position = 'absolute';
    this.page2.style.position = 'absolute';
    document.body.appendChild(this.page2);

    if (method === 'left_to_right') {
      var y = parseFloat(page1.style.top);
      if (!isNumber(y)) {
        y = 0;
      }
      this._createLeftToRight(times, positions, y);
      duration = 1000;
    }

    inter = new VectorInterpolator(times, positions);
    timer = new IntervalTimer(dt, {duration: duration});
    timer.addReceiver(inter, ['tick', 'finished']);
    inter.addReceiver(this, ['value_changed', 'finished'], 'moveCB');
    timer.start();
  },

  moveCB: function(type, inter) {
    this.page1.style.left = inter.value[0];
    this.page2.style.left = inter.value[0] - 1280;

    if ('finished' === type) {
      Logger.log('fini');
      this.page1.style.position = '';
      this.page2.style.position = '';
      Pages.pageDiv.el.removeChild(this.page1);
      Pages.pageDiv.el.appendChild(this.page2);
    }
  },

  _createLeftToRight: function(times, positions, y) {
    var N = 20;
    var i;
    var x;
    var W = window.innerWidth;
    for (i=0; i<=N; i++) {
      times.push(i/N);
      x = W*i/N;
      positions.push([x,y]);
    }
  }
};
*/

