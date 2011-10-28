/****************************************************************
 * mt_blockfont
 ****************************************************************/

"use strict";

var BlockFont = new Class({
	initialize: function(k) {
		this.fontData = [
			[ // 32 ' '
				" ",
				" ",
				" ",
				" ",
				" "
			],
			[ // 33 '!'
				"X ",
				"X ",
				"X ",
				"  ",
				"X "
			],
			[ // 34 '"'
				"X X",
				"X X",
				"   ",
				"   ",
				"   "
			],
			[ // 35 '#'
				" X X ",
				"XXXXX",
				" X X ",
				"XXXXX",
				" X X "
			],
			[ // 36 '$'
				" XXX ",
				"X X  ",
				" XXX ",
				"  X X",
				" XXX "
			],
			[ // 37 '%'
				"X X",
				"  X",
				" X ",
				"X  ",
				"X X"
			],
			[ // 38 '&'
				" XX ",
				"X  X",
				" XX ",
				"X XX",
				" XXX"
			],
			[ // 39 "'"
				"X",
				"X",
				" ",
				" ",
				" "
			],
			[ // 40 '('
				" X",
				"X ",
				"X ",
				"X ",
				" X"
			],
			[ // 41 ')'
				"X ",
				" X",
				" X",
				" X",
				"X "
			],
			[ // 42 '*'
				"  X  ",
				"X X X",
				" XXX ",
				"X X X",
				"  X  "
			],
			[ // 43 '+'
				"   ",
				" X ",
				"XXX",
				" X ",
				"   "
			],
			[ // 44 ','
				"  ",
				"  ",
				"  ",
				" X",
				"X "
			],
			[ // 45
				"  ",
				"  ",
				"XX",
				"  ",
				"  "
			],
			[ // 46
				" ",
				" ",
				" ",
				" ",
				"X"
			],
			[ // 47
				"    X",
				"   X ",
				"  X  ",
				" X   ",
				"X    "
			],
			[ // 48
				"XXX",
				"X X",
				"X X",
				"X X",
				"XXX"
			],
			[ // 49
				"  X",
				" XX",
				"  X",
				"  X",
				"  X"
			],
			[ // 50
				"XXX",
				"  X",
				"XXX",
				"X  ",
				"XXX"
			],
			[ // 51
				"XXX",
				"  X",
				"XXX ",
				"  X",
				"XXX"
			],
			[ // 52
				"X  ",
				"X X",
				"XXX",
				"  X",
				"  X"
			],
			[ // 53
				"XXX",
				"X  ",
				"XXX",
				"  X",
				"XXX"
			],
			[ // 54
				"XXX",
				"X  ",
				"XXX",
				"X X",
				"XXX"
			],
			[ // 55
				"XXX",
				"  X",
				" XX",
				" X ",
				" X "
			],
			[ // 56
				"XXX",
				"X X",
				"XXX",
				"X X",
				"XXX"
			],
			[ // 57
				"XXX",
				"X X",
				"XXX",
				"  X",
				"XXX"
			],
			[ // 58
				" ",
				"X",
				" ",
				"X",
				" "
			],
			[ // 59
				"  ",
				" X",
				"  ",
				" X",
				"X "
			],
			[ // 60
				"  X",
				" X ",
				"X  ",
				" X ",
				"  X"
			],
			[ // 61
				"  ",
				"XX",
				"  ",
				"XX",
				"  "
			],
			[ // 62
				"X  ",
				" X ",
				"  X",
				" X ",
				"X  "
			],
			[ // 63
				" XX ",
				"X  X",
				"  X ",
				"    ",
				"  X "
			],
			[ // 64
				" XXX ",
				"X XXX",
				"X X X",
				"X   X",
				" XXX"
			],
			[
				"XXX",
				"X X",
				"XXX",
				"X X",
				"X X"
			],
			[
				"XX ",
				"X X",
				"XX ",
				"X X",
				"XX "
			],
			[
				" X",
				"X ",
				"X ",
				"X ",
				" X"
			],
			[
				"XX ",
				"X X",
				"X X",
				"X X",
				"XX "
			],
			[
				"XXX",
				"X  ",
				"XX ",
				"X  ",
				"XXX"
			],
			[
				"XXX",
				"X  ",
				"XX ",
				"X  ",
				"X  "
			],
			[
				" XX ",
				"X   ",
				"X XX",
				"X  X",
				" XX "
			],
			[
				"X X",
				"X X",
				"XXX",
				"X X",
				"X X"
			],
			[
				"X",
				"X",
				"X",
				"X",
				"X"
			],
			[
				"XX",
				" X",
				" X",
				" X",
				"X "
			],
			[
				"X X",
				"XXX",
				"XX ",
				"XXX",
				"X X"
			],
			[
				"X ",
				"X ",
				"X ",
				"X ",
				"XX"
			],
			[
				"X   X",
				"XX XX",
				"X X X",
				"X   X",
				"X   X"
			],
			[
				"X  X",
				"XX X",
				"X XX",
				"X XX",
				"X  X"
			],
			[
				"XXX",
				"X X",
				"X X",
				"X X",
				"XXX"
			],
			[
				"XXX",
				"X X",
				"XXX",
				"X  ",
				"X  "
			],
			[
				"XXXX",
				"X  X",
				"X  X",
				"X XX",
				"XXXX"
			],
			[
				"XXX",
				"X X",
				"XXX",
				"XX ",
				"X X"
			],
			[
				"XX",
				"X ",
				"XX",
				" X",
				"XX"
			],
			[
				"XXX",
				" X ",
				" X ",
				" X ",
				" X "
			],
			[
				"X X",
				"X X",
				"X X",
				"X X",
				"XXX"
			],
			[
				"X X",
				"X X",
				"X X",
				" X ",
				" X "
			],
			[
				"X   X",
				"X   X",
				"X X X",
				"XX XX",
				"X   X"
			],
			[
				"X X",
				"X X",
				" X ",
				"X X",
				"X X"
			],
			[
				"X X",
				"X X",
				" X ",
				"X  ",
				"X  "
			],
			[ // 90
				"XX",
				" X",
				"XX",
				"X ",
				"XX"
			],
			[ // last
				"XXXXX",
				"X X X",
				"X X X",
				"X X X",
				"XXXXX"
			]
		];

		this.k = k;
	},
	drawChar: function(ctx, ci, X, Y) {
		ci -= 32;
		if (ci >= 0 && ci < this.fontData.length) {
			var fd = this.fontData[ci];
			l = fd[0].length;
			for (y=0; y<5; y++) {
				for (x=0; x<l; x++) {
					if ('X' === fd[y].charAt(x)) {
						ctx.fillRect(X + this.k*(x), Y + this.k*(y), this.k, this.k);
						//ctx.fillRect(this.k*(X+x), this.k*(Y+y), this.k, this.k);
					}
				}
			}
			return this.k*(l+1);
		} else {
			return 0;
		}
	},
	charWidth: function(ci) {
		ci -= 32;
		var fd = this.fontData[ci];
		l = fd[0].length;
		return this.k*(l+1);
	},
	writeLine: function(color, ctx, line, x, y, opt) {
		var newLine = "";
		var i, c, xp = x, w, h, k = this.k, dx;
		line = line.toString();
		line = line.toUpperCase();
		if (opt && opt.bg) {
			w = 2*k + this.textWidth(line);
			h = k*7;
			ctx.fillStyle = opt.bg;
			ctx.fillRect(x-k, y-k, w, h);
		}
		ctx.fillStyle = color;
		for (i=0; i<line.length; i++)  {
			idx = line.charCodeAt(i);
			dx = this.drawChar(ctx, idx, xp, y);
			xp += dx;
			newLine += 0 === dx ? "" : line.charAt(i);
		}
		return newLine;
	},
	textWidth: function(line) {
		line = line.toString();
		line = line.toUpperCase();
		var i, c, xp=0;
		for (i=0; i<line.length; i++)  {
			idx = line.charCodeAt(i);
			xp += this.charWidth(idx);
		}
		return xp;
	}
});

var BlockFontManager = new Class({
	initialize: function() {
		this.fonts = [];
		// this.font4 = new BlockFont(4, '#6666ff');
		// this.font6 = new BlockFont(4, '#6666ff');
	},
	getFont: function(sz) {
		if (!this.fonts[sz]) {
			this.fonts[sz] = new BlockFont(sz, '#6666ff');
		}
		return this.fonts[sz];
	}
});




