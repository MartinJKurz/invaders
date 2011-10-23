/****************************************************************
 * menu_test2
 ****************************************************************/

//= require lib/mootools-core-1.4.0-full-compat-yc
//= require lib/log
//= require lib/js_helper
//= require lib/menus

/*
 * testing a hierarchy of menus,
 *
 *
 * settings
 *  style
 * texts
 *  political
 *  controvery
 * recipies
 *  meat
 *    chicken
 *    beef
 *    pig
 *  vegetarian
 *    apples
 *    oranges
 * music
 *  classical
 *  ballads
 *  loud
 *  punk
 * applications
 *  invaders
 *  pong
 *
 *
 * 1. 
 */

var App = new Class({
  menuSelection: function(type, menu) {
    var idx = menu.selectedId;
    var it = menu.items[idx];
    Logger.log('Selected: ' + idx + ' ' + it.text);
    if ($defined(it.check)) {
      Logger.log('CHECKBOX: ' + it.checked);
    }
    if (it.action) {
      if (it.args) {
        it.action.apply(this, it.args);
      } else {
        it.action();
      }
    }
  },
  
  initialize: function() {
    var i, n, sn;
    var items = [
      {text: 'Settings', submenu: 'settings'},
      {text: 'Texts', submenu: 'texts'},
      {text: 'Recipies', submenu: 'recipies'},
      {text: 'Music', submenu: 'music'},
      {text: 'Applications', submenu: 'applications'},
    ];

    var options = {fixedFontSize: 30};
    this.mainMenu = Menus.createSplashMenu('main', items, options, {obj:this, method:'menuSelection'});

    // Settings
    items = [
      //{text: 'Settings', caption: true},
      {text: 'Styles', submenu: 'styles'},
      {text: 'back', mainmenu: true},
    ];
    // options = {};
    this.settingsMenu = Menus.createSplashMenu('settings', items, options, {obj:this, method:'menuSelection'});

    // Styles
    items = [
      {text: 'Styles', caption: true},
    ];
    this.styles = getAlternateStyleSheetNames();
    n = this.styles.length;
    for (i=0; i<n; i++) {
      sn = this.styles[i];
      items.push({text: 'Style: ' + sn, action: setActiveStyleSheet, args: [i]});
    }
    items.push({text: 'back', mainmenu: true});
    options = {};
    this.stylesMenu = Menus.createSplashMenu('styles', items, options, {obj:this, method:'menuSelection'});

    
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

  // set a random style
  var titles = getAlternateStyleSheetNames();
  var n = titles.length;
  var idx = Math.floor(Math.random()*n);
  setActiveStyleSheet(titles[idx]);

  bindTest();

}

function t1(a,b,c) {
  console.log(['t1: ', '[', this.name, ']', a, b, c].join(' '));
}

function bindTest() {
  t1(7,8,'aha');
  t1.bind(this)(1,2,3);

  var obj = {
    name: 'Hugo'
  }
  t1.bind(obj)('a', 'b', 'c');
}


