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
	return [$random(0,255), $random(0,255), $random(0,255)].rgbToHex();
};


function clamp(val, low, high) {
	if (val < low) {
		return low;
	} else if (val > high) {
		return high;
	}

	return val;
}
