
var App = new Class({
  initialize: function() {
    $(document.body).setStyle('background-color', 'red');
    // $('browser-info').addEvent('click', this.browserInfo.bind(this));
  },
  browserInfo: function() {
    var sizeInfo = this.browserSizeInfo();
    // test:
    //console.log('Sending: ' + sizeInfo);
    // -> to server
    var req = new Request({
      url: '/pages/test_post_browser_info',
      method: 'post',
      //data: json,
      onComplete: function(json_return) {
        if (!JSON.decode(json_return).success) {
          // ERROR
          // handling ??
        }
        // console.log('Server returns: ' + json_return);
        // console.log('Server returns: ' + JSON.decode(json_return).success);
      }
    });
    req.post(sizeInfo);   // will be automatically wrapped as a json object
  },
  browserSizeInfo: function() {
    return {
      screenSize: {
        x: window.screen.width,
        y: window.screen.height
      },
      innerSize: $(document.body).getSize(),    // client size (without scrollbars)
    };
  },
});

// executed after page load:
window.addEvent('domready', function() {
  app = new App();
  app.browserInfo();
});

