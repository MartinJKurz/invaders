/****************************************************************
 * receiver
 ****************************************************************/


"use strict";

/*
 * to be used as a base class,
 * cb method has to be implemented by the class
 *
 * var ReceiverImpl = new Class({
 *  Extends: Receiver,
 *  initialize: function() {
 *  },
 *  cb: function(type, obj) {
 *    Logger.log('cb: ' + type);
 *  }
 * });
 *
 */
var Receiver = new Class({
  initialize: function() {
  },
  cb: function(type, obj) {
    throw('Receiver: cb not implemented');
  }
});


