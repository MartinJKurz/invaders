function getMetaContents(mn) {
  var m = document.getElementsByTagName('meta');
  for(var i in m){
    if(m[i].name == mn){
      return m[i].content;
    }
  }
}

function rr(f) {
	return f*(Math.random()-0.5);
}

function irand(i) {
	return Math.floor(i*Math.random());
}

function randomColor () {
	return [irand(255), irand(255), irand(255)].rgbToHex();
};


function clamp(val, low, high) {
	if (val < low) {
		return low;
	} else if (val > high) {
		return high;
	}

	return val;
}
/*
    ctx,font: This string uses the same syntax as the CSS font specifier. 

    CSS Font Spevcifier:
    font is a shorthand property for setting
      one word:                     caption | icon | menu | message-box | small-caption | status-bar | inherit
      or a combination:
      font-style,                   normal | italic | oblique | inherit
      font-variant,                 normal | small-caps | inherit
      font-weight,                  normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit

      font-size: xx-small | x-small | small | medium | large | x-large | xx-large
      font-size: smaller | larger
      font-size: <length> | <percentage> | inherit

      line-height: ??

      font-family in a single CSS declaration.
      font-family:  <family-or-generic-name> [, <family-or-generic-name>]* | inherit

italic small-caps bold 40pt Trebuchet

generic family:
serif
    Glyphs have finishing strokes, flared or tapering ends, or have actual serifed endings.
    E.g.  Palatino, "Palatino Linotype", Palladio, "URW Palladio", serif
sans-serif
    Glyphs have stroke endings that are plain.
    E.g. 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif
cursive
    Glyphs in cursive fonts generally have either joining strokes or other cursive
    characteristics beyond those of italic typefaces. The glyphs are partially or
    completely connected, and the result looks more like handwritten pen or brush
    writing than printed letterwork.
fantasy
    Fantasy fonts are primarily decorative fonts that contain playful representations of characters.
monospace
    All glyphs have the same fixed width.
    E.g. "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace 


    The font property stets the element's font to a system font.
font:   [ 
font-style|| 
font-variant|| 
font-weight]? 
font-size[ / 
line-height]? 
font-family

*/

/*
 * opts {
 *  fontStyle: styleName,
 *  fontVariant: variantName,
 *  fontWeight: weighName
 *  fontSize: size in pts - initial value for calculation,
 *  fontFamily: font family spec
 *  bgStyle: style definition
 *  fgStyle: style definition
 * }
 */
var InfoCanvas = new Class({
  initialize: function(opts) {
    this.canvas = new Element('canvas');
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
    this.bound_hide = this.hide.bind(this);
    this.opts = opts ? opts : {};
    if (!this.opts.fontStyle) {
      this.opts.fontStyle = 'normal';
    }
    if (!this.opts.fontVariant) {
      this.opts.fontVariant = 'normal';
    }
    if (!this.opts.fontWeight) {
      this.opts.fontWeight = 'normal';
    }
    if (!this.opts.fontFamily) {
      this.opts.fontFamily = 'Helvetica';
    }
    if (!this.opts.fontSize) {
      this.opts.fontSize = 20;
    }
    if (!this.opts.bgStyle) {
      this.opts.bgStyle = 'rgba(255,255,255,0.5)';
    }
    if (!this.opts.fgStyle) {
      this.opts.fgStyle = 'rgba(0,0,0,1)';
    }
    if (!this.opts.timeout) {
      this.opts.timeout = 0;
    }
    if (!this.opts.cancelable) {
      this.opts.cancelable = false;
    }
    this.hide();
  },
  show: function(immediate) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.opts.bgStyle;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (immediate) {
      this.canvas.setStyle('display', '');
    }
  },
  // opts: timeout, cancelable
  showLines: function(lines, opts) {
    this.hide();
    this.ctx.fillStyle = this.opts.fgStyle;
    this.ctx.textAlign = 'center';
    var px = this.canvas.width / 2;
    var py = this.canvas.height / 2;

    var attr = [this.opts.fontStyle, this.opts.fontVariant, this.opts.fontWeight].join(' ');
    var tmp;
    if (typeof(lines) === 'string') {
      lines = [lines];
    }
    if (!('length' in lines)) {
      return;
    }
    var i, font, tfont;
    for (i=0; i<lines.length; i++) {
      tfont = CH.fontForWidth(this.ctx, lines[i], 20, this.canvas.width*0.9, attr, this.opts.fontFamily);
      if (font) {
        if (tfont.size < font.size) {
          font = tfont;
        }
      } else {
        font = tfont;
      }
    }

    var lineSpacing = 1 + 0.5;
    var H = lines.length * font.size * lineSpacing;
    var H2 = (lines.length-1) * font.size * lineSpacing;
    py += font.size / 2;
    py -= H2*0.5;

    this.ctx.font = font.font;

    for (i=0; i<lines.length; i++) {
      this.ctx.fillText(lines[i], px, py);
      py += font.size * 1.5;
    }

    this.canvas.setStyle('display', '');
    if (opts && opts.timeout && opts.timeout > 0) {
      setTimeout(this.hide.bind(this), opts.timeout);
    }
    this.canvas.removeEventListener('click', this.bound_hide);
    if (opts && opts.cancelable) {
      this.canvas.addEventListener('click', this.bound_hide);
    }
  },
  showMenu: function(items, opts) {
    var i,t,tr,td,b,px,py;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    function cancel() {
      this.hide();
    }
    var bound_cancel = cancel.bind(this);

    if (opts.cancel) {
      items.push({text:'cancel', cb: bound_cancel});
    }

    if (!this.menuDiv) {
      this.menuDiv = new Element('div');
      this.menuDiv.setStyle('position', 'absolute');
      document.body.appendChild(this.menuDiv);
    }
    this.menuDiv.innerHTML = '';

    var box = {
      // w : window.innerWidth * 0.8,
      // h : 0.6 * window.innerHeight * 0.8 / items.length
      w : 0.8*window.innerWidth,
      h : 0.8*window.innerHeight / items.length
    };
    var opts = {
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold'
    }
    var font, tfont;
    for (i=0; i<items.length; i++) {
      tfont = TM.findFontForSize(items[i].text, box, opts);
      if (!font || tfont.size < font.size) {
        font = tfont;
      }
    }

    t = new Element('table');
    this.menuDiv.appendChild(t);
    for (i=0; i<items.length; i++) {
      tr = new Element('tr');
      t.appendChild(tr);
      b = new Element('input');
      b.type = 'button';
      b.setAttribute('class', 'menu-button');
      // b.setStyle('font-size', 70);
      b.setStyle('font-family', opts.fontFamily);
      b.setStyle('font-style', opts.fontStyle);
      b.setStyle('font-variant', opts.fontVariant);
      b.setStyle('font-size', font.size);
      b.setStyle('font-weight', opts.fontWeight);



      b.value = items[i].text;
      tr.appendChild(b);

      if (items[i].cb) {
        //b.addEventListener('click', items[i].cb, items[i].args);
        b.addEventListener('click', items[i].cb.bind(this));
      }
    }

    this.menuDiv.setStyle('display', '');

    px = (window.innerWidth - this.menuDiv.offsetWidth)*0.5;
    py = (window.innerHeight - this.menuDiv.offsetHeight)*0.5;
    this.menuDiv.setStyle('left', px);
    this.menuDiv.setStyle('top', py);

    this.canvas.setStyle('display', '');
    // tbr:
    //setTimeout(this.hideInfo.bind(this), 8000);
  },
  hide: function() {
    this.show(false);
    this.canvas.setStyle('display', 'none');
    if (this.menuDiv) {
      this.menuDiv.setStyle('display', 'none');
    }
  },
  resize: function () {

    if (window.innerWidth !== this.canvas.width || window.innerHeight != this.canvas.height) {
      this.canvas.style.width = window.innerWidth+'px';
      this.canvas.style.height = window.innerHeight+'px';
      this.canvas.width = Math.floor(window.innerWidth);
      this.canvas.height = Math.floor(window.innerHeight);
      this.canvas.style.position = 'absolute';
    }
  },
});

var TMClass = new Class({
  initialize: function() {
    this.test = document.body._measure_text;
    if (!this.test) {
      this.test = new Element('label');
      document.body.appendChild(this.test);
      document.body._measure_text = this.test;
      this.test.setStyle('visibility', 'hidden');
      this.test.setStyle('height', 'auto');
      this.test.setStyle('width', 'auto');
    }
  },
  setOptions: function(opts) {
      this.test.style.fontFamily = opts.fontFamily ? opts.fontFamily : 'Arial';
      this.test.style.fontStyle = opts.fontStyle ? opts.fontStyle : 'normal';
      this.test.style.fontVariant = opts.fontVariant ? opts.fontVariant : 'normal';
      var fs = opts.fontSize ? opts.fontSize : 20;
      this.test.style.fontSize = fs + 'px';
      this.test.style.fontWeight = opts.fontWeight ? opts.fontWeight : 'normal';
  },
  setFontSize: function(size) {
      this.test.style.fontSize = size + 'px';
  },
  measure: function(text, opts) {

    if (opts) {
      this.setOptions(opts);
    }

    this.test.textContent = text;
    var w = this.test.offsetWidth;
    var h = this.test.offsetHeight;
    this.test.textContent = '';
    return {
      w: w,
      h: h
    }
  },
  findFontForSize: function(text, box, opts) {
    this.setOptions(opts);
    var fs = (opts && opts.fontSize) ? opts.fontSize : 20;
    this.setFontSize(fs);
    var m = this.measure(text);
    while (m.w < box.w && m.h < box.h) {
      fs *= 1.1;
      this.setFontSize(fs);
      m = this.measure(text);
    }
    while (m.w > box.w || m.h > box.h) {
      fs /= 1.1;
      this.setFontSize(fs);
      m = this.measure(text);
    }

    return {
      font: this.test.style.font,
      size: fs
    }
  }
});

var TM;
window.addEvent('domready', function() {
    TM = new TMClass();
});


// some canvas helpers
var CH = {
  measureLine: function(ctx, font, line) {
    ctx.font = font;
    return ctx.measureText(line);
  },

  // attr: style variant weight
  // sample:
  // CH.fontForWidth(ctx, 'some text', 20, 'italic small-caps bold', 'Trebuchet');
  fontForWidth: function(ctx, line, fs, w, attr, family) {
    var font, count;

    font = attr + ' ' + fs + 'pt ' + family;

    m = this.measureLine(ctx, font, line);
    
    count = 0;
    while (count < 20 && m.width < w) {
      fs /= 0.9;
      font = attr + ' ' + fs + 'pt ' + family;

      m = this.measureLine(ctx, font, line);
      count++;
    }
    count = 0;
    while (count < 20 && m.width > w) {
      fs *= 0.9;
      font = attr + ' ' + fs + 'pt ' + family;

      m = this.measureLine(ctx, font, line);
      count++;
    }
    return {
      font: font,
      size: fs
    }
  },
}

