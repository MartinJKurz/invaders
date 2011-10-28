/****************************************************************
 * canvas_helper
 ****************************************************************/

/*global isInt, Element */
"use strict";

var CH = {
  measureLine: function(ctx, font, line) {
    ctx.font = font;
    return ctx.measureText(line);
  },

  // attr: style variant weight
  // sample:
  // CH.fontForWidth(ctx, 'some text', 20, 'italic small-caps bold', 'Trebuchet');
  fontForWidth: function(ctx, line, fs, w, attr, family) {
    var font, count, m;

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
    };
  },
  rotateImage90: function(image, pi05) {
    var canvas, ctx;
    if (!isInt(pi05)) {
      return null;
    }
    if (0 === pi05) {
      return image;
    }
    pi05 = pi05 % 4;
    canvas = new Element('canvas');
    if (1 === pi05 || 3 === pi05) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }
    ctx = canvas.getContext('2d');
    ctx.save();
    ctx.rotate(0.5 * pi05 * Math.PI);
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
  }
};

