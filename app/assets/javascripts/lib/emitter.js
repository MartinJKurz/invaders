/****************************************************************
 * emitter
 ****************************************************************/


//= require lib/receiver

/*
 * to be used as a base class
 *
 * var SomeClass = new Class({
 *  Extends: Emitter,
 *  initialize: function() {
 *  },
 *  doSomething: function() {
 *    notify('finished');
 *  }
 * });
 */
var Emitter = new Class({
  Extends: Receiver,

  // old:
  // Receiver = {
  //  'tick': [r, r, ...]
  // }
  //
  // new:
  // Receiver = {
  //  'tick': {
  //    rec: [m, m, ...],
  //    rec: [m, m, ...],
  //    ...
  // }
  receivers: {},
  
  initialize: function() {
  },

  _getTypes: function(types, from) {
    if (!$defined(types)) {
      throw('Emitter. ' + from + ': types not defined');
    }
    if ('string' === $type(types)) {
      types = [types];
    } else if ('array' !== $type(types)) {
      throw('Emitter. ' + from + ': types must be a string, or an array of strings');
    }
    var i,t;
    for (i=0; i<types.length; i++) {
      t = types[i];
      if ('string' !== $type(t)) {
        throw('Emitter. ' + from + '; types array: all items must be strings');
      }
    }
    return types;
  },

  addReceiver: function(rec, types, method) {
    if (!$defined(method)) {
      method = 'cb';
    }
    if (!$defined(rec)) {
      throw('Emitter.addReceiver: receiver not defined');
    }

    types = this._getTypes(types, 'addReceiver');

    var i, t;
    for (i=0; i<types.length; i++) {
      t = types[i];
      if (!this.receivers[t]) {
        this.receivers[t] = {};
      }
      if (!this.receivers[t][method]) {
        this.receivers[t][method] = [];
      }

      if (this.receivers[t][method].contains(rec)) {
        return;
      }
      this.receivers[t][method].push(rec);
    }
  },

  // TODO
  removeReceiver: function(rec, types) {
    var i,t;
    if (!$defined(types)) {
      types = this.receivers.keys();
      this.removeReceiver(rec, types);
    } else {
      types = this._getTypes(types, 'removeReceiver');
      for (i=0; i<types.length; i++) {
        t = types[i];
        if (this.receivers[t]) {
          this.receivers[t].erase(rec);
        }
      }
    }
  },

  // TODO
  numReceivers: function(type) {
    var n = 0;
    if (!$defined(type)) {
      for (type in this.receivers) {
        n += this.numReceivers(type);
      }
      return n;
    } else {
      if (!this.receivers[type]) {
        return 0;
      }
      return this.receivers[type].length;
    }
  },

  notify: function(type) {
    if (!$defined(type)) {
      return;
    }
    if (!$defined(this.receivers[type])) {
      return;
    }
    var methods = this.receivers[type];
    var m;
    for (m in methods) {
      if (methods.hasOwnProperty(m)) {
        var recs = this.receivers[type][m];
        var l = recs.length, i;
        for (i=0; i<l; i++) {
          recs[i][m](type, this);
        }
      }
    }
  },
});

