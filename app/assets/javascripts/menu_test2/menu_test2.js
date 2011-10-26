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

  // standard callback method for menus
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
    // main menu
    var items = [
      {text: 'Main Menu', caption: true},
      {text: 'Settings', submenu: 'settings'},
      {text: 'Texts', submenu: 'texts'},
      {text: 'Recipies', submenu: 'recipies'},
      {text: 'Music', submenu: 'music'},
      {text: 'Applications', submenu: 'applications'},
    ];
    var options = {fixedFontSize: 30};
    this.mainMenu = Pages.createSplashMenu(null, 'main', items, options, {obj:this, method:'menuSelection'});

    this._createSettingsMenu(this.mainMenu);
    this._createTextsMenu(this.mainMenu);

    // Pages.createBG('rgba(255,255,255,0.5)');
    Pages.showPage(this.mainMenu);
  },

  _createSettingsMenu: function(parentMenu) {
    var items = [
      {text: 'Settings Menu', caption: true},
      {text: 'Styles', submenu: 'styles'},
    ];
    var options = {};
    this.settingsMenu = Pages.createSplashMenu(parentMenu, 'settings', items, options, {obj:this, method:'menuSelection'});

    this._createStylesMenu(this.settingsMenu);
  },

  _createStylesMenu: function(parentMenu) {
    var i, n, sn;
    items = [
      {text: 'Styles Menu', caption: true},
    ];
    this.styles = getAlternateStyleSheetNames();
    n = this.styles.length;
    for (i=0; i<n; i++) {
      sn = this.styles[i];
      items.push({text: sn, action: setActiveStyleSheet, args: [i]});
    }
    var options = {};
    this.stylesMenu = Pages.createSplashMenu(parentMenu, 'styles', items, options, {obj:this, method:'menuSelection'});
  },

  texts: [],
  _createTextsMenu: function(parentMenu) {
    var items = [
      {text: 'Texts Menu', caption: true},
      {text: 'Sample 1', action: this.showText, args: ['sample_1']},
    ];
    var options = {};
    this.textsMenu = Pages.createSplashMenu(parentMenu, 'texts', items, options, {obj:this, method:'menuSelection'});
  },

  showText: function(text) {
    if (!this.texts[text]) {
      this.texts[text] = Pages.createTextPage(this.textsMenu, 'sample_1', texts['sample_1'], {});
    }
    Pages.showSubMenu(this.texts[text]);
  },
  /*
  showText: function(text) {
    var current = Pages.currentPage;
    if (!this.texts[text]) {
      this.texts[text] = Pages.createTextPage(this.textsMenu, 'sample_1', texts['sample_1'], {});
    }
    if (current) {
      Pages.currentPage = current;
      Pages.showSubMenu(this.texts[text]);
    } else {
      Pages.showPage(this.texts[text]);
    }
  },
  */
});

window.addEvent('domready', function() {
  var timer = new OneTimer(1000);     // android needs a delay to get window.innerWidth / ..Height right
  var starter = {
	cb: function(type, timer) {
		new App();
	}
  }
  timer.addReceiver(starter, 'finished');
  timer.start();
});

var texts = {
  sample_1: "\
<h1>Oregon</h1>\
The U.S. state of Oregon has 26 official emblems, as designated by the Oregon State Legislature. Oregon's first state symbol was the motto Alis Volat Propriis, written and translated in 1854. Latin for \"She Flies With Her Own Wings\", the motto remained unchanged until 1957, when \"The Union\" became the official state motto. Alis Volat Propriis became the state motto once again in 1987. Originally designed in 1857, usage of the Oregon State Seal began after Oregon became the 33rd state of the United States on February 14, 1859. The motto and seal served as Oregon's only symbols until over 50 years later, when the Oregon-grape became the state flower in 1899. Oregon had 6 official symbols by 1950 and 22 symbols by 2000. The newest symbol of Oregon is Jory soil, declared the state soil in 2011.",

};

/*
// better use this
// -> text - or any apropriate html is on server and loaded via get request.
// -> the content is added as a child onto the vertically dragable text div
<p>The U.S. state of <a title="Oregon" href="/wiki/Oregon">Oregon</a> has 26 <a title="Lists of United States state insignia" href="/wiki/Lists_of_United_States_state_insignia">official emblems</a>, as designated by the <a title="Oregon Legislative Assembly" href="/wiki/Oregon_Legislative_Assembly">Oregon State Legislature</a>. Oregon's first <b><a title="List of Oregon state symbols" href="/wiki/List_of_Oregon_state_symbols">state symbol</a></b> was the <a title="List of U.S. state and territory mottos" href="/wiki/List_of_U.S._state_and_territory_mottos">motto</a> <i>Alis Volat Propriis</i>, written and translated in 1854. <a title="Latin" href="/wiki/Latin">Latin</a> for "She Flies With Her Own Wings", the motto remained unchanged until 1957, when "The Union" became the official state motto. <i>Alis Volat Propriis</i> became the state motto once again in 1987. Originally designed in 1857, usage of the Oregon State Seal began after Oregon became the 33rd state of the United States on February 14, 1859. The motto and seal served as Oregon's only symbols until over 50 years later, when the <a title="Oregon-grape" href="/wiki/Oregon-grape">Oregon-grape</a> became the state flower in 1899. Oregon had 6 official symbols by 1950 and 22 symbols by 2000. The newest symbol of Oregon is <a title="Jory (soil)" href="/wiki/Jory_(soil)">Jory soil</a>, declared the <a title="List of U.S. state soils" href="/wiki/List_of_U.S._state_soils">state soil</a> in 2011. (<b><a title="List of Oregon state symbols" href="/wiki/List_of_Oregon_state_symbols">more...</a></b>)</p>
*/



















