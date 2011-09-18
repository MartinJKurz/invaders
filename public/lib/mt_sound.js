
var Sounds = new Class({
	initialize: function() {
		var au = new Element('audio');
		// this.supported = $defined(au.play);
		// this.supported = au.play !== undefined;  // ok!
		this.supported = $defined(au.play);
		this.sounds = {};
		this.on = true;
		this.vol = 1;
	},
	createSound: function(name, filename, vol, n) {
		if (!this.supported || !this.on) {
			return;
		}
		var i;
		this.sounds[name] = {};
		this.sounds[name].s = [];
		this.sounds[name].idx = 0;
		this.sounds[name].n = n;
		this.sounds[name].vol = vol;
		for (i=0; i<n; i++) {
			this.sounds[name].s.push(new Element('audio', {src: filename, volume: vol*this.vol}));
		}
	},
	setVolume: function(vol) {
		var i, name, s;
		this.vol = vol;
		var fn = function(val, key) {
			var myVol = val.vol;
			for (i=0; i<val.n; i++) {
				s = val.s[i];
				s.setAttribute('volume', myVol*this.vol);
				s.volume = myVol*this.vol;
			}
		};
		Object.each(this.sounds, fn.bind(this));
	},
	play: function(name) {
		if (!this.supported || !this.on) {
			return;
		}
		if (!$defined(this.sounds[name])) {
			return;
		}
		var info = this.sounds[name];
		var s = info.s[info.idx];
		s.play();
		info.idx = (info.idx+1) % info.n;
	},
	mute: function(on) {
		this.on = on;
	}
});

