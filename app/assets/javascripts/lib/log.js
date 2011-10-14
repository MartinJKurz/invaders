
/*
 * on page log output
 */
var Log = new Class({
  initialize: function(parentEl) {

    function makeTextSelectable(els) {
      var i, el;
      for (i=0; i<els.length; i++) {
        el = els[i];
        el.setStyle('user-select', 'text');
        el.setStyle('-webkit-user-select', 'text');
        el.setStyle('-khtml-user-select', 'text');
        el.setStyle('-o-user-select', 'text');
        el.setStyle('-moz-user-select', 'text');
      }
    }

    this.div = new Element('div');
    if (parentEl) {
      parentEl.appendChild(this.div);
    } else {
      document.body.appendChild(this.div);
    }

    //this.div.setStyle('height', '100%');
    
    var table = new Element('table');
    //table.setStyle('height', '100%');
    this.div.appendChild(table);
    var head = new Element('tr');
    table.appendChild(head);
    var headTD = new Element('td');
    head.appendChild(headTD);

    this.clearButton = new Element('button');
    this.clearButton.textContent = 'clear';
    headTD.appendChild(this.clearButton);
    this.clearButton.addEventListener('click', this.clear.bind(this));

    this.hideButton = new Element('button');
    this.hideButton.textContent = 'hide';
    headTD.appendChild(this.hideButton);
    this.hideButton.addEventListener('click', this.hide.bind(this));

    var content = new Element('tr');
    table.appendChild(content);
    var contentTD = new Element('td');
    content.appendChild(contentTD);

    this.text = new Element('textarea');
    this.text.rows = 17;
    //contentTD.style.height = '100%';
    //this.text.style.height = '100%';
    contentTD.appendChild(this.text);

    var fs = Math.min(12, Math.max(7, window.innerWidth / 25));
    this.text.setStyle('font-size', fs);


    //this.text.setStyle('font-family', 'Courier');
    this.text.setStyle('font-family', 'monospace');
    this.text.setStyle('font-weight', 'bold');
    this.text.setStyle('background-color', 'rgba(0,0,0,0.0)');

    this.div.setStyle('position', 'absolute');
    this.div.setStyle('z-index', '10000');
    this.div.setStyle('background-color', 'rgba(222,255,200,0.5)');

    makeTextSelectable([this.div, table, content, contentTD, this.text]);

    this.visible = true;

    this.log('font size: ' + fs);
  },
  clear: function() {
    this.text.value = '';
  },
  hide: function() {
    this.div.setStyle('display', 'none');
    this.visible = false;
  },
  show: function(where) {
    this.div.setStyle('display', '');
    this.visible = false;
    if (where) {
      this.div.setStyle(where, '0px');
    }
  },
  toggle: function() {
    if (this.visible) {
      this.div.setStyle('display', 'none');
      this.visible = false;
    } else {
      this.div.setStyle('display', '');
      this.visible = true;
    }
  },
  log: function(line) {
    this.text.value += line + '\n';
    this.text.scrollTop = this.text.scrollHeight - this.text.clientHeight;
  },
});
