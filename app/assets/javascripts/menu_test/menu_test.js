var Logger;

var App = new Class({
  initialize: function() {
    Logger = new Log();
    var items = [
      {text: 'one', cb: this.cb1.bind(this)},
      {text: 'two', cb: this.cb2.bind(this)},
      {text: 'A'},
      {text: 'B'},
      {text: 'C'},
      {text: 'D'},
      {text: 'E'},
      {text: 'F'},
      {text: 'G'},
      {text: 'H'},
      {text: 'I'},
      {text: 'J'},
      {text: 'K'},
      {text: 'three', cb: this.cb3.bind(this)},
      {text: 'show second', cb: this.showSecond.bind(this)},
    ];
    var options = {};
    this.mainMenu = Menus.createSplashMenu(items, options);

    items = [
      {text: 'Second Menu', cb: this.cb1.bind(this)},
      {text: 'show first', cb: this.showFirst.bind(this)},
    ];
    options = {};
    this.secondMenu = Menus.createSplashMenu(items, options);

    Menus.showSplashMenu(this.mainMenu);
  },

  cb1: function() {
    Logger.log('one');
  },
  cb2: function() {
    Logger.log('two');
  },
  cb3: function() {
    Logger.log('three');
  },
  showSecond: function() {
    Logger.log('four');
    Menus.hideSplashMenu(this.mainMenu);
    setTimeout(
      function() {
        Menus.showSplashMenu(this.secondMenu);
      }.bind(this),
      1000);
  },
  showFirst: function() {
    Logger.log('four');
    Menus.hideSplashMenu(this.secondMenu);
    setTimeout(
      function() {
        Menus.showSplashMenu(this.mainMenu);
      }.bind(this),
      1000);
  },
});

window.addEvent('domready', function() {
  onLoad();
});

function onLoad() {
  var app = new App();
}

