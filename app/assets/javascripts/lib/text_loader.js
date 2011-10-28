/****************************************************************
 * text_loader
 ****************************************************************/

"use strict";

// a class, to be instanciated
var TextLoader = new Class({
  loadArticleList: function(cb) {
    var url = '/articles';
    var ctrl = this;
    var token = getMetaContents('csrf-token');

    var myAjax = new Request({
      url:url,
      method: 'get',
      dataType: 'json',   // ignored
      data: 'format=json',
      headers: {
        'X-CSRF-Token': token
      },

      onComplete: function(json) {
        var obj = JSON.decode(json);
        cb(obj);
      }
    });

    myAjax.send(null);
  },
  loadArticle: function(key, cb) {
    var url = '/articles/' + key;
    var ctrl = this;
    var token = getMetaContents('csrf-token');

    var myAjax = new Request({
      url:url,
      method: 'get',
      dataType: 'json',   // ignored
      data: 'format=json',
      headers: {
        'X-CSRF-Token': token
      },

      onComplete: function(json) {
        var obj = JSON.decode(json);
        console.log('ARTICLE loaded ' + obj.id + ' ' + obj.title);

        if (cb) {
          cb(obj);
        }
        var aha = 17;
      }
    });

    myAjax.send(null);
  },



  // transform
  _createNav: function(depth, o) {
    var n = this.createElement(depth, o, 'nav');
    var i, tar, ul, li, a, t, h;
    if (o.h1) {
      h = this.createElement(depth + 1, o.h1, 'h1');
      this.addText(h, o.h1);
      this.addElement(n, h);
    }
    return n;
  },
  _createHeader: function(depth, o) {
    var t, h, sec, s, p, i;
    var n = this.createElement(depth, o, 'header');
    if (o.h1) {
      h = this.createElement(depth + 1, o.h1, 'h1');
      this.addText(h, o.h1);
      this.addElement(n, h);
    }
    if (o.nav) {
      // n.appendChild(this._createNav(o.nav));
      t = this._createNav(depth + 1, o.nav);
      this.addElement(n, t);
    }
    if (o.sections) {
      for (i=0; i<o.sections.length; i++) {
        sec = o.sections[i];
        if (sec.h2) {
          h = this.createElement(depth + 1, sec.h2, 'h2');
          this.addText(h, sec.h2);
          this.addElement(n, h);
        }
        if (sec.p) {
          p = this.createElement(depth + 1, sec.p, 'p');
          this.addText(h, sec.p);
          this.addElement(n, p);
        }
      }
    }
    return n;
  },
  _addTarget: function(o, e, targets, depth) {
    if (o.id) {
      e.id = o.id;
      targets.push({text: o.id, href: '#' + o.id, depth: depth});
      return true;
    } else {
      return true;
    }
  },
  _createSection: function(depth, o, targets) {
    var s, t, d, d1, d2, i, par, added, n;
    n = this.createElement(depth, o, 'section');
    this._addTarget(o, n, targets, 0); // CHECK
    if (o.h2) {
      d = this.createElement(depth + 1, o.h2, 'h2');
      this.addText(d, o.h2);
      this.addElement(n, d);
    }
    if (o.hgroup) {
      d = this.createElement(depth + 1, o.hgroup, 'hgroup');
      if (o.hgroup.h1) {
        d2 = this.createElement(depth + 2, o.hgroup.h1, 'h1');
        this.addText(d2, o.hgroup.h1);
        this.addElement(d, d2);
      }
      if (o.hgroup.h2) {
        d2 = this.createElement(depth + 2, o.hgroup.h2, 'h2');
        this.addText(d2, o.hgroup.h2);
        this.addElement(d, d2);
      }
      this.addElement(n, d);
    }

    if (o.paragraphs) {
      for (i=0; i<o.paragraphs.length; i++) {
        added = false;
        par = o.paragraphs[i];
        if (par.h2) {
          d = this.createElement(depth + 1, par.h2, 'h2');
          added = this._addTarget(par, d, targets, 1);
          this.addText(d, par.h2);
          this.addElement(n, d);
        }
        if (par.p) {
          d = this.createElement(depth + 1, par.p, 'p');
          if (!added) {
            this._addTarget(par, d, targets, 1);
          }
          this.addText(d, par.p);
          this.addElement(n, d);
        }
      }
    }
    return n;
  },
  _fillNav: function(depth, nav, targets) {
    var i, li, a, t, ul = [], tar, lastDepth = -1, d, par = nav;
    var cul = nav;

    for (i=0; i<targets.length; i++) {
      tar = targets[i];

      for (d=lastDepth; d<tar.depth; d++) {
        ul.push(cul);
        cul = this.createElement(depth + 1 + tar.depth, null, 'ul');
        this.addElement(par, cul);
        par = cul;
      }
      for (d=lastDepth; d>tar.depth; d--) {
        cul = ul.pop();
      }
      lastDepth = tar.depth;

      li = this.createElement(depth + 2 + tar.depth, null, 'li');
      this.addElement(cul, li);
      a = this.createElement(depth + 3 + tar.depth, null, 'a');
      this.addElement(li, a);
      a.href = tar.href; // TODO
      this.addText(a, tar.text);
    }
  },
  __uid__: 1,
  createElement: function(depth, articleElement, tagName) {
    var el = document.createElement(tagName);
    el.uid = this.__uid__++;
    if (this.createCB) {
      this.createCB(depth, el, articleElement, tagName);
    }
    return el;
  },
  addElement: function(pel, el) {
    pel.appendChild(el);
    if (this.addCB) {
      this.addCB(pel, el);
    }
  },
  addText: function(el, t) {
    el.innerHTML = t;
    if (this.addTextCB) {
      this.addTextCB(el, t);
    }
  },
  /*
  createElement: function(depth, tagName) {
    if (this.createCB) {
      return this.createCB(depth, tagName);
    } else {
      return document.createElement(tagName);
    }
  },
  addElement: function(pel, el) {
    if (this.addCB) {
      this.addCB(pel, el);
    } else {
      pel.appendChild(el);
    }
  },
  addText: function(el, t) {
    if (this.addTextCB) {
      this.addTextCB(el, t);
    } else {
      el.innerHTML = t;
    }
  },
  */
  objToHTML: function(o) {
    var targets = [], sec, i, h, t;
    var n = this.createElement(0, o, 'article');
    if (o.header) {
      h = this._createHeader(1, o.header);
      this.addElement(n, h);
    }
    if (o.sections) {
      for (i=0; i<o.sections.length; i++) {
        sec = o.sections[i];
        t = this._createSection(1, sec, targets);
        this.addElement(n, t);
      }
    }

    var nav = n.getElementsByTagName('nav')[0];
    if (nav && targets.length !== 0) {
      this._fillNav(1, nav, targets);
    }

    return n;
  },

  setCallbacks: function(createCB, addCB, addTextCB) {
    this.createCB = createCB;
    this.addCB = addCB;
    this.addTextCB = addTextCB;
  },


  prepareTextHTML: function(textRoot, scrollMethod) {
    var i, els, el, href, li, t, n;
    var tbr = [];
    var lis = [];
    els = textRoot.getElementsByTagName('a');		// all anchors
    n = els.length
    for (i=0; i<n; i++) {
      el = els[i];
      href = el.getAttribute('href');
      if (href) {
        if (href[0] === '#') {
          li = el.parentNode;
          li.setAttribute('target', href.substring(1));
          t = document.createTextNode(el.textContent);
          li.appendChild(t);
          tbr.push(el);
        } else {
          // external, or
          // other text on server ?
        }
      }
    }
    for (i=0; i<tbr.length; i++) {
      if (tbr[i]) {
        el = tbr[i];
        li = el.parentNode;
        li.removeChild(el);
      }
    }

    if (scrollMethod) {
      els = textRoot.getElementsByTagName('li');
      for (i=0; i<els.length; i++) {
        el = els[i];
        el.addEventListener('click', scrollMethod);
      }
    }
  }
});



/*

using ONE static TextLoader

var TextLoader = {
  loadArticleList: function(cb) {
    var url = '/articles';
    var ctrl = this;
    var token = getMetaContents('csrf-token');

    var myAjax = new Request({
      url:url,
      method: 'get',
      dataType: 'json',   // ignored
      data: 'format=json',
      headers: {
        'X-CSRF-Token': token
      },

      onComplete: function(json) {
        var obj = JSON.decode(json);
        cb(obj);
      }
    });

    myAjax.send(null);
  },
  loadArticle: function(key, cb) {
    var url = '/articles/' + key;
    var ctrl = this;
    var token = getMetaContents('csrf-token');

    var myAjax = new Request({
      url:url,
      method: 'get',
      dataType: 'json',   // ignored
      data: 'format=json',
      headers: {
        'X-CSRF-Token': token
      },

      onComplete: function(json) {
        var obj = JSON.decode(json);
        console.log('ARTICLE loaded ' + obj.id + ' ' + obj.title);

        if (cb) {
          cb(obj);
        }
        var aha = 17;
      }
    });

    myAjax.send(null);
  },



  // transform
  _createNav: function(depth, o, createCB, addCB, addTextCB) {
    var n = this.createElement(depth, 'nav', createCB);
    var i, tar, ul, li, a, t, h;
    if (o.h1) {
      h = this.createElement(depth + 1, 'h1', createCB);
      this.addText(h, o.h1, addTextCB);
      this.addElement(n, h, addCB);
    }
    return n;
  },
  _createHeader: function(depth, o, createCB, addCB, addTextCB) {
    var t, h, sec, s, p, i;
    var n = this.createElement(depth, 'header', createCB);
    if (o.h1) {
      h = this.createElement(depth + 1, 'h1', createCB);
      this.addText(h, o.h1, addTextCB);
      this.addElement(n, h, addCB);
    }
    if (o.nav) {
      // n.appendChild(this._createNav(o.nav));
      t = this._createNav(depth + 1, o.nav, createCB, addCB, addTextCB);
      this.addElement(n, t, addCB);
    }
    if (o.sections) {
      for (i=0; i<o.sections.length; i++) {
        sec = o.sections[i];
        if (sec.h2) {
          h = this.createElement(depth + 1, 'h2', createCB);
          this.addText(h, sec.h2, addTextCB);
          this.addElement(n, h, addCB);
        }
        if (sec.p) {
          p = this.createElement(depth + 1, 'p', createCB);
          this.addText(h, sec.p, addTextCB);
          this.addElement(n, p, addCB);
        }
      }
    }
    return n;
  },
  _addTarget: function(o, e, targets, depth) {
    if (o.id) {
      e.id = o.id;
      targets.push({text: o.id, href: '#' + o.id, depth: depth});
      return true;
    } else {
      return true;
    }
  },
  _createSection: function(depth, o, targets, createCB, addCB, addTextCB) {
    var s, t, d, d1, d2, i, par, added, n;
    n = this.createElement(depth, 'section', createCB);
    this._addTarget(o, n, targets, 0); // CHECK
    if (o.h2) {
      d = this.createElement(depth + 1, 'h2', createCB);
      this.addText(d, o.h2, addTextCB);
      this.addElement(n, d);
    }
    if (o.hgroup) {
      d = this.createElement(depth + 1, 'hgroup');
      if (o.hgroup.h1) {
        d2 = this.createElement(depth + 2, 'h1', createCB);
        this.addText(d2, o.hgroup.h1, addTextCB);
        this.addElement(d, d2, addCB);
      }
      if (o.hgroup.h2) {
        d2 = this.createElement(depth + 2, 'h2', createCB);
        this.addText(d2, o.hgroup.h2, addTextCB);
        this.addElement(d, d2, addCB);
      }
      this.addElement(n, d, addCB);
    }

    if (o.paragraphs) {
      for (i=0; i<o.paragraphs.length; i++) {
        added = false;
        par = o.paragraphs[i];
        if (par.h2) {
          d = this.createElement(depth + 1, 'h2', createCB);
          added = this._addTarget(par, d, targets, 1);
          this.addText(d, par.h2, addTextCB);
          this.addElement(n, d, addCB);
        }
        if (par.p) {
          d = this.createElement(depth + 1, 'p', createCB);
          if (!added) {
            this._addTarget(par, d, targets, 1);
          }
          this.addText(d, par.p, addTextCB);
          this.addElement(n, d, addCB);
        }
      }
    }
    return n;
  },
  _fillNav: function(depth, nav, targets, createCB, addCB, addTextCB) {
    var i, li, a, t, ul = [], tar, lastDepth = -1, d, par = nav;
    var cul = nav;

    for (i=0; i<targets.length; i++) {
      tar = targets[i];

      for (d=lastDepth; d<tar.depth; d++) {
        ul.push(cul);
        cul = this.createElement(depth + 1 + tar.depth, 'ul', createCB);
        this.addElement(par, cul, addCB);
        par = cul;
      }
      for (d=lastDepth; d>tar.depth; d--) {
        cul = ul.pop();
      }
      lastDepth = tar.depth;

      li = this.createElement(depth + 2 + tar.depth, 'li', createCB);
      this.addElement(cul, li, addCB);
      a = this.createElement(depth + 3 + tar.depth, 'a', createCB);
      this.addElement(li, a, addCB);
      a.href = tar.href; // TODO
      this.addText(a, tar.text, addTextCB);
    }
  },
  createElement: function(depth, tagName, cb) {
    if (cb) {
      return cb(depth, tagName);
    } else {
      return document.createElement(tagName);
    }
  },
  addElement: function(pel, el, addCB) {
    if (addCB) {
      addCB(pel, el);
    } else {
      pel.appendChild(el);
    }
  },
  addText: function(el, t, addTextCB) {
    if (addTextCB) {
      addTextCB(el, t);
    } else {
      el.innerHTML = t;
    }
  },
  objToHTML: function(o, createCB, addCB, addTextCB) {
    var targets = [], sec, i, h, t;
    var n = this.createElement(0, 'article', createCB);
    if (o.header) {
      h = this._createHeader(1, o.header, createCB, addCB, addTextCB);
      this.addElement(n, h);
    }
    if (o.sections) {
      for (i=0; i<o.sections.length; i++) {
        sec = o.sections[i];
        t = this._createSection(1, sec, targets, createCB, addCB, addTextCB);
        this.addElement(n, t, addCB);
      }
    }

    if (!createCB) {
      var nav = n.getElementsByTagName('nav')[0];
      if (nav && targets.length !== 0) {
        this._fillNav(1, nav, targets, createCB, addCB, addTextCB);
      }
    }

    return n;
  },


  prepareTextHTML: function(textRoot, scrollMethod) {
    var i, els, el, href, li, t, n;
    var tbr = [];
    var lis = [];
    els = textRoot.getElementsByTagName('a');		// all anchors
    n = els.length
    for (i=0; i<n; i++) {
      el = els[i];
      href = el.getAttribute('href');
      if (href) {
        if (href[0] === '#') {
          li = el.parentNode;
          li.setAttribute('target', href.substring(1));
          t = document.createTextNode(el.textContent);
          li.appendChild(t);
          tbr.push(el);
        } else {
          // external, or
          // other text on server ?
        }
      }
    }
    for (i=0; i<tbr.length; i++) {
      if (tbr[i]) {
        el = tbr[i];
        li = el.parentNode;
        li.removeChild(el);
      }
    }

    if (scrollMethod) {
      els = textRoot.getElementsByTagName('li');
      for (i=0; i<els.length; i++) {
        el = els[i];
        el.addEventListener('click', scrollMethod);
      }
    }
  }
}





  // transform
  _createNav: function(o) {
    var n = document.createElement('nav');
    var i, tar, ul, li, a, t, h;
    if (o.h1) {
      h = document.createElement('h1');
      h.innerHTML = o.h1;
      n.appendChild(h);
    }
    return n;
  },
  _createHeader: function(o) {
    var t, h, sec, s, p, i;
    var n = document.createElement('header');
    if (o.h1) {
      h = document.createElement('h1');
      h.innerHTML = o.h1;
      n.appendChild(h);
    }
    if (o.nav) {
      n.appendChild(this._createNav(o.nav));
    }
    if (o.sections) {
      for (i=0; i<o.sections.length; i++) {
        sec = o.sections[i];
        if (sec.h2) {
          h = document.createElement('h2');
          h.innerHTML = o.h2;
          n.appendChild(h);
        }
        if (sec.p) {
          p = document.createElement('p');
          h.innerHTML = sec.p;
          n.appendChild(p);
        }
      }
    }
    return n;
  },
  _addTarget: function(o, e, targets, depth) {
    if (o.id) {
      e.id = o.id;
      targets.push({text: o.id, href: '#' + o.id, depth: depth});
      return true;
    } else {
      return true;
    }
  },
  _createSection: function(o, targets) {
    var s, t, d, d1, d2, i, par, added, n;
    n = document.createElement('section');
    this._addTarget(o, n, targets, 0);
    if (o.h2) {
      d = document.createElement('h2');
      d.innerHTML = o.h2;
      n.appendChild(d);
    }
    if (o.hgroup) {
      d = document.createElement('hgroup');
      if (o.hgroup.h1) {
        d2 = document.createElement('h1');
        d2.innerHTML = o.hgroup.h1;
        d.appendChild(d2);
      }
      if (o.hgroup.h2) {
        d2 = document.createElement('h2');
        d2.innerHTML = o.hgroup.h2;
        d.appendChild(d2);
      }
      n.appendChild(d);
    }

    if (o.paragraphs) {
      for (i=0; i<o.paragraphs.length; i++) {
        added = false;
        par = o.paragraphs[i];
        if (par.h2) {
          d = document.createElement('h2');
          added = this._addTarget(par, d, targets, 1);
          d.innerHTML = par.h2;
          n.appendChild(d);
        }
        if (par.p) {
          d = document.createElement('p');
          if (!added) {
            this._addTarget(par, d, targets, 1);
          }
          d.innerHTML = par.p;
          n.appendChild(d);
        }
      }
    }
    return n;
  },
  _fillNav: function(nav, targets) {
    var i, li, a, t, ul = [], tar, lastDepth = -1, d, par = nav;
    var cul = nav;

    for (i=0; i<targets.length; i++) {
      tar = targets[i];

      for (d=lastDepth; d<tar.depth; d++) {
        ul.push(cul);
        cul = document.createElement('ul');
        par.appendChild(cul);
        par = cul;
      }
      for (d=lastDepth; d>tar.depth; d--) {
        cul = ul.pop();
      }
      lastDepth = tar.depth;

      li = document.createElement('li');
      cul.appendChild(li);
      a = document.createElement('a');
      li.appendChild(a);
      a.href = tar.href;
      t = document.createTextNode(tar.text);
      a.appendChild(t);
    }
  },
  objToHTML: function(o) {
    var targets = [], sec, i, h;
    var n = document.createElement('article');
    if (o.header) {
      h = this._createHeader(o.header);
      n.appendChild(h);
    }
    if (o.sections) {
      for (i=0; i<o.sections.length; i++) {
        sec = o.sections[i];
        n.appendChild(this._createSection(sec, targets));
      }
    }

    var nav = n.getElementsByTagName('nav')[0];
    if (nav && targets.length !== 0) {
      this._fillNav(nav, targets);
    }

    return n;
  },
*/
