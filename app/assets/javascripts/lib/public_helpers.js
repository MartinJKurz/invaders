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

function isInt(val) {
  return (val.toString().search(/^-?[0-9]+$/) == 0);
}


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
  rotateImage90: function(image, pi05) {
    if (!isInt(pi05)) {
      return null;
    }
    if (0 == pi05) {
      return image;
    }
    pi05 = pi05 % 4;
    var canvas = new Element('canvas');
    if (1 == pi05 || 3 == pi05) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.rotate(0.5*pi05*Math.PI);
    switch (pi05) {
      case 1:
        ctx.translate(0, -image.height);
        break;
      case 2:
        ctx.translate(-image.width, -image.height);
        break;
      case 3:
        ctx.translate(-image.width, 0);
        break;
    }
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    ctx.restore();
    return canvas;
  },
}

