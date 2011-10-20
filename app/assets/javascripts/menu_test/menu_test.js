var App = new Class({
  menuSelection: function(type, menu) {
    var idx = menu.selectedId;
    console.log('Selected: ' + idx + ' ' + menu.items[idx].text);
    if (menu.items[idx].action) {
      menu.items[idx].action();
    }
  },
  
  initialize: function() {
    var items = [
      {text: 'one'},
      {text: 'two'},
      {text: 'three'},
      {text: 'New Callback Technique'},
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
      {text: 'L'},
      {text: 'M'},
      {text: 'N'},
      {text: 'O'},
      {text: 'P'},
      {text: 'Q'},
      {text: 'R'},
      {text: 'S'},
      {text: 'T'},
      {text: 'U'},
      {text: 'V'},
      {text: 'W'},
      {text: 'X'},
      {text: 'Y'},
      {text: 'Z'},
      {text: 'show second menu with a simple click', action: this.showSecond.bind(this)},
    ];
    var options = {};
    this.mainMenu = Menus.createSplashMenu(items, options, {obj:this, method:'menuSelection'});

    items = [
      {text: 'Second Menu'},
      {text: 'show first menu', action: this.showFirst.bind(this)},
    ];
    options = {};
    this.secondMenu = Menus.createSplashMenu(items, options, {obj:this, method:'menuSelection'});

    Menus.showSplashMenu(this.mainMenu);
  },
  showSecond: function() {
    Menus.swapMenus(this.mainMenu, this.secondMenu, 'shift.left_to_right');
    // Menus.swapMenus(this.mainMenu, this.secondMenu, 'over.left_to_right');
  },
  showFirst: function() {
    Menus.swapMenus(this.secondMenu, this.mainMenu, 'shift.right_to_left');
    //Menus.swapMenus(this.secondMenu, this.mainMenu, 'over.right_to_left');
  },
});

window.addEvent('domready', function() {
  onLoad();
});



function onLoad() {
  var timer = new OneTimer(1000);     // android needs a delay to get window.innerWidth / ..Height right
  var starter = {
	cb: function(type, timer) {
		new App();
	}
  }
  timer.addReceiver(starter, 'finished');
  timer.start();

  test();
}

function test() {
  Logger.log('window: ' + window.innerWidth + ' ' + window.innerHeight);
  var sh, i;
  var sheets = document.styleSheets;
  console.log('stylesheets:');
  for (i=0; i<sheets.length; i++) {
    sh = sheets[i];
    console.log(' ' + sh.title);
  }
  activateStyleSheet('hugo', false);
  activateStyleSheet('hugo', true);
}

