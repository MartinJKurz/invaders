// requires Emitter
// requires Receiver

window.setTimeoutOrg = window.setTimeout;
window.setIntervalOrg = window.setInterval;
window.clearTimeoutOrg = window.clearTimeout;
window.clearIntervalOrg = window.clearInterval;


window.setTimeout = function(func, delay, params) {
  var handle = window.setTimeoutOrg(func, delay, params);
  TimerObserver.addTimeout(handle);
  return handle;
}

/*
// setTimeout will call the attached function and do NOTHING more
// -> nobody else will be notified about the finish
window.setTimeout = function(func, delay, params) {
  obj = {
    external: func,
    internal: function() {
      console.log('timeout: calling attached function');
      this.external();
    }
  };
  var handle = window.setTimeoutOrg(obj.internal.bind(obj), delay, params);
  TimerObserver.addTimeout(handle);
  return handle;
}
*/

window.setInterval = function(func, inter, params) {
  var handle = window.setIntervalOrg(func, inter, params);
  TimerObserver.addInterval(handle);
  return handle;
}
window.clearTimeout = function(handle) {
  TimerObserver.removeTimeout(handle);
  return window.clearTimeoutOrg(handle);
}
window.clearInterval = function(handle) {
  TimerObserver.removeInterval(handle);
  return window.clearIntervalOrg(handle);
}

var TimerObserver = {
  timeouts: [],
  intervals: [],
  debug : false,

  show: function() {
    if (!this.debug) {
      return;
    }
    //console.log('TO: ' + this.timeouts.length + ' INTER: ' + this.intervals.length);
    console.log('TO: ' + this.timeouts.length + ': [' + this.timeouts.join(' ') + ']');
    console.log('INTER: ' + this.intervals.length + ': [' + this.intervals.join(' ') + ']');
  },

  addTimeout: function(t) {
    if (this.timeouts.contains(t)) {
      if (this.debug) {
        console.log('TimerObserver.addTimeout: already registered: ' + t);
      }
      return;
    }
    this.timeouts.push(t);
    if (this.debug) {
      console.log('added timeout ' + t);
      this.show();
    }
  },
  removeTimeout: function(t) {
    if (!this.timeouts.contains(t)) {
      if (this.debug) {
        console.log('TimerObserver.removeTimeout: not registered: ' + t);
      }
      return;
    }
    this.timeouts.erase(t);
    if (this.debug) {
      console.log('removed timeout ' + t);
      this.show();
    }
  },
  addInterval: function(t) {
    if (this.intervals.contains(t)) {
      if (this.debug) {
        console.log('removed timeout ' + t);
        console.log('TimerObserver.addInterval: already registered: ' + t);
      }
      return;
    }
    this.intervals.push(t);
    if (this.debug) {
      console.log('added interval ' + t);
      this.show();
    }
  },
  removeInterval: function(t) {
    if (!this.intervals.contains(t)) {
      if (this.debug) {
        console.log('TimerObserver.removeInterval: not registered: ' + t);
      }
      return;
    }
    this.intervals.erase(t);
    if (this.debug) {
      console.log('removed interval ' + t);
      this.show();
    }
  },
};

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
    TimerObserver.removeTimeout(this._handle);
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
    console.log('STOP TIMER');

    if ($defined(this._handle) && 0 !== this._handle) {
      clearTimeout(this._handle);
      this._handle = 0;
      this.notify('stopped');
    }
  },
  pause: function() {
    if ($defined(this._handle) && 0 !== this._handle) {
      clearTimeout(this._handle);
      this._elapsed = Date.now() - this._started;
      this._remaining = this._duration - this._elapsed;
      this._handle = 0;
      this.notify('stopped');
    }
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
      this._killTimer = setTimeout(this._stopInterval.bind(this), this._duration);
    }
  },
  _stopInterval: function() {
    this._endTimes();
    this.notify('finished');
    // clearTimeout(this._killTimer);
    TimerObserver.removeTimeout(this._killTimer);
    if ($defined(this._handle) && 0 !== this._handle) {
      clearInterval(this._handle);
    }
  },
  cont: function() {
    if (this._handle) {
      return 'already running';
    }
    this.notify('continued');
    this._handle = setInterval(this._tickCB.bind(this), this._interval);
  },
  stop: function() {
    if ($defined(this._handle) && 0 !== this._handle) {
      clearInterval(this._handle);
    }
    if ($defined(this._killTimer) && 0 !== this._killTimer) {
      clearTimeout(this._killTimer);
    }
    this.notify('stopped');
    this._handle = 0;
    this._killTimer = 0;
    this._ticks = 0;
  },
  pause: function() {
    if ($defined(this._handle) && 0 !== this._handle) {
      clearInterval(this._handle);
      this._handle = 0;
    }
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


