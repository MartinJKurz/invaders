// requires Emitter
// requires Receiver

var Timer = new Class({
  Extends: Emitter,
  _handle: 0,

  initialize: function() {
    this.parent();
  },
  active: function() {
    return this._handle !== 0;
  },
});


var OneTimer = new Class({
  Extends: Timer,
  _delay: 0,
  _started: 0,
  _finished: 0,
  _elapsed: 0,
  _remaining: 0,

  initialize: function(delay) {
    this.parent();
    this._delay = delay;
  },
  finishedCB: function() {
    this._finished = Date.now();
    this.notify('finished');
  },
  start: function() {
    if (this._handle) {
      return;
    }
    this._started = Date.now();
    this.notify('started');
    this._handle = setTimeout(this.finishedCB.bind(this), this._delay);
  },
  stop: function() {
    clearTimeout(this._handle);
    this._handle = 0;
    this.notify('stopped');
  },
  pause: function() {
    clearTimeout(this._handle);
    this._elapsed = Date.now() - this._started;
    this._remaining = this._duration - this._elapsed;
    this._handle = 0;
    this.notify('stopped');
  },
  cont: function() {
    if (this._handle) {
      return;
    }
    this.notify('continued');
    this._handle = setInterval(this.tickCB.bind(this), this._remaining);
  },
  restart: function() {
    this.stop();
    this.start();
  }
});


var IntervalTimer = new Class({
  Extends: Timer,
  _interval: 0,
  _duration: 0,
  _delay: 0,
  _ticks: 0,
  _started: 0,
  _elapsed: 0,
  _remaining: 0,

  initialize: function(interval, options) {
    this.parent();
    this._interval = interval;
    this._duration = $defined(options) && $defined(options.duration) ? options.duration : 0;
    this._delay = $defined(options) && $defined(options.delay) ? options.delay : 0;
  },
  _upda: function(now, end) {
    if (end) {
      this._elapsed =this._duration;
      if (this._duration > 0) {
        this._remaining = 0;
        this._rel_elapsed = 1;
        this._rel_remaining = 0;
      } else {
        this._remaining = 0;
      }
    } else {
      this._elapsed = now - this._interval_started;
      if (this._duration > 0) {
        this._remaining = this._duration - this._elapsed;
        this._rel_elapsed = this._elapsed / this._duration;
        this._rel_remaining = this._remaining / this._duration;
      } else {
        this._remaining = 0;
      }
    }
  },
  _updateTimes: function() {
    this._upda(Date.now());
  },
  _endTimes: function() {
    //this._upda(this._interval_started + this._duration);
    this._upda(0, true);
  },
  _tickCB: function() {
    this._ticks++;
    this._updateTimes();
    this.notify('tick');
  },
  start: function() {
    if (this._handle) {
      return 'already started';
    }
    this._ticks = 0;
    this._started = Date.now();
    this._elapsed = 0;
    this._remaining = this._duration;
    this._rel_elapsed = 0;
    this._rel_remaining = this._duration > 0 ? 1 : 0;
    //this.callback('started', this);
    this.notify('started');
    if (this._delay > 0) {
      this._handle = setTimeout(this._startInterval.bind(this), this._delay);
    } else {
      this._startInterval();
    }
  },
  _startInterval: function() {
    // clearTimeout();
    this._interval_started = Date.now();
    this._updateTimes();
    this.notify('interval started');
    this._handle = setInterval(this._tickCB.bind(this), this._interval);
    if (this._duration > 0) {
      setTimeout(this._stopInterval.bind(this), this._duration);
    }
  },
  _stopInterval: function() {
    this._endTimes();
    this.notify('finished');
    clearInterval(this._handle);
  },
  cont: function() {
    if (this._handle) {
      return 'already running';
    }
    this.notify('continued');
    this._handle = setInterval(this._tickCB.bind(this), this._interval);
  },
  stop: function() {
    clearInterval(this._handle);
    this.notify('stopped');
    this._handle = 0;
    this._ticks = 0;
  },
  pause: function() {
    clearInterval(this._handle);
    this._handle = 0;
  },
  restart: function() {
    this.stop();
    this.start();
  }
});



var CT = new Class({
  timers: [],

  initialize: function() {
  },

  createIntervalTimer: function(interval, options) {
    var t = new IntervalTimer(interval, options);
    this.timers << t;
    return t;
  },
});


