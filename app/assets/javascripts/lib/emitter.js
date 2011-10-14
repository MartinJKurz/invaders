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

  receivers: {},
  
  initialize: function() {
  },
  /*
  addReceiver: function(rec, type) {
    if (!$defined(type)) {
      throw('Emitter.addReceiver: type not defined');
    }
    if (!$defined(rec)) {
      throw('Emitter.addReceiver: receiver not defined');
    }
    if (!this.receivers[type]) {
      this.receivers[type] = [];
    }
    if (this.receivers[type].contains(rec)) {
      return;
    }
    this.receivers[type].push(rec);
  },

  removeReceiver: function(rec, type) {
    if (!$defined(type)) {
      for (type in this.receivers) {
        this.removeReceiver(rec, type);
      }
    } else {
      if (!this.receivers[type]) {
        return;
      }
      this.receivers[type].erase(rec);
    }
  },
  */

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

  addReceiver: function(rec, types) {
    if (!$defined(rec)) {
      throw('Emitter.addReceiver: receiver not defined');
    }

    types = this._getTypes(types, 'addReceiver');

    var i, t;
    for (i=0; i<types.length; i++) {
      t = types[i];
      if (!this.receivers[t]) {
        this.receivers[t] = [];
      }
      if (this.receivers[t].contains(rec)) {
        return;
      }
      this.receivers[t].push(rec);
    }
  },

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
    var recs = this.receivers[type];
    var l = recs.length, i;
    for (i=0; i<l; i++) {
      recs[i].cb(type, this);
    }
  },
});


