


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
/*
    if (it.text.contains('Style')) {
      idx = parseInt(it.text.substring(5));
      setActiveStyleSheet(this.styles[idx]);
    }
*/
  },
  
  initialize: function() {
    var i, n, sn;
    var items = [
      {text: 'show second menu with a simple click', action: this.showSecond.bind(this)},
      {text: 'one ', check: true},
      {text: 'two ', check: false},
      {text: 'three'},
      {text: 'New Callback Technique'},
      {text: 'C'},
      {text: 'testing long texts with this entry. should be visible on a mobile device. the line must be tall enough to be selectable'},
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
    this.mainMenu = Pages.createSplashMenu(null, 'main', items, options, {obj:this, method:'menuSelection'});

    items = [
      {text: 'Second Menu'},
      {text: 'show first menu', action: this.showFirst.bind(this)},
      {text: 'one ', check: true},
    ];
    this.styles = getAlternateStyleSheetNames();
    n = this.styles.length;
    for (i=0; i<n; i++) {
      sn = this.styles[i];
      //items.push({text: 'Style: ' + sn, action: setActiveStyleSheet, args: [sn]});
      items.push({text: 'Style: ' + sn, action: setActiveStyleSheet, args: [i]});
    }
    
    options = {};
    this.secondMenu = Pages.createSplashMenu(null, 'second', items, options, {obj:this, method:'menuSelection'});

    Pages.showPage(this.mainMenu);
  },
  showSecond: function() {
    Pages.swapMenus(this.mainMenu, this.secondMenu, 'shift.left_to_right');
    // Pages.swapMenus(this.mainMenu, this.secondMenu, 'over.left_to_right');
  },
  showFirst: function() {
    Pages.swapMenus(this.secondMenu, this.mainMenu, 'shift.right_to_left');
    //Pages.swapMenus(this.secondMenu, this.mainMenu, 'over.right_to_left');
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


