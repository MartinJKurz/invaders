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


