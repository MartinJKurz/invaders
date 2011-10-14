//


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
    //console.log(type + ' ' + info.a + ' ' + info.b + ' r:' + info.r + ' ' + ret);
    this.value = ret;
    this.notify('value_changed');
    if ('finished' === type) {
      this.notify('finished');
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



