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
    thing2.el.style.width = 150;
    thing2.el.style.height= 100;
    thing2.setPosition(150, 0);
    thing2.setTargetPositions(
      [
        [0,  0],[150,  0],[300,  0],[450,  0],
        [0,100],[150,100],[300,100],[450,100],
        [0,200],[150,200],[300,200],[450,200],
        [0,300],[150,300],[300,300],[450,300],
        [0,400],[150,400],[300,400],[450,400]
      ]
    );
    thing2.el.src = '/P8180198_s.JPG';
    document.body.appendChild(thing2.el);

    var thing3 = new Dragable('img');
    thing3.el.style.width = 150;
    thing3.el.style.height= 100;
    thing3.setPosition(150, 200);
    thing3.setTargetPositions(
      [
        [0,  0],[150,  0],[300,  0],[450,  0],
        [0,100],[150,100],[300,100],[450,100],
        [0,200],[150,200],[300,200],[450,200],
        [0,300],[150,300],[300,300],[450,300],
        [0,400],[150,400],[300,400],[450,400]
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


