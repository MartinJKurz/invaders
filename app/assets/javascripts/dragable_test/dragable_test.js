var Logger = null;

var App = new Class({
  initialize: function() {

    Logger = new Log();

    var thing1 = new Dragable('label');
    thing1.setPosition(200, 50);
    thing1.setTargetPositions([[200,50],[400,50],[600,50],[800,50]]);
    thing1.el.style.fontSize = 50;
    thing1.el.textContent = 'Thing 1';
    document.body.appendChild(thing1.el);

    var thing2 = new Dragable('img');
    thing2.el.style.width = 250;
    thing2.el.style.height= 200;
    thing2.setPosition(250, 300);
    thing2.setTargetPositions(
      [
        [0,  0],[250,  0],[500,  0],[750,  0],[1000,  0],
        [0,200],[250,200],[500,200],[750,200],[1000,200],
        [0,400],[250,400],[500,400],[750,400],[1000,400]
      ]
    );
    thing2.el.src = '/P8180198_s.JPG';
    document.body.appendChild(thing2.el);

    var thing3 = new Dragable('img');
    thing3.el.style.width = 250;
    thing3.el.style.height= 200;
    thing3.setPosition(500, 300);
    thing3.setTargetPositions(
      [
        [0,  0],[250,  0],[500,  0],[750,  0],[1000,  0],
        [0,200],[250,200],[500,200],[750,200],[1000,200],
        [0,400],[250,400],[500,400],[750,400],[1000,400]
      ]
    );
    thing3.el.src = '/P1010015_s.JPG';
    document.body.appendChild(thing3.el);

    thing3.addReceiver(this, 'finished');

/*
    var thing4 = Object.clone(thing3);
    thing4.el.src = '/P1010015_s.JPG';
    document.body.appendChild(thing4.el);
*/
  },

  cb: function(type, dragable) {
    Logger.log('position: ' + dragable.targetIdx);
  },

});

window.addEvent('domready', function() {
  new App();
  //test();
});

var ReceiverImpl = new Class({
  Extends: Receiver,

  initialize: function() {
  },
  cb: function(type, obj) {
    Logger.log('cb: ' + type);
  }
});

function test() {
  var e1 = new Emitter();
  var r1 = new ReceiverImpl();
  var r2 = new ReceiverImpl();
  e1.addReceiver(r1, 'click');
  e1.addReceiver(r2, 'click');
  e1.addReceiver(r1, 'xxx');

  e1.notify('click');

  Logger.log('yyy:   ' + e1.numReceivers('yyy'));
  Logger.log('click: ' + e1.numReceivers('click'));
  Logger.log('all:   ' + e1.numReceivers());
  e1.removeReceiver(r1);
  Logger.log('yyy:   ' + e1.numReceivers('yyy'));
  Logger.log('click: ' + e1.numReceivers('click'));
  Logger.log('all:   ' + e1.numReceivers());


}


