/*
 * TODO:
 * - Ships:
 *   - Troop - done
 *   - Myself - done
 *   - value field - done
 *   - Mystery - own movement, fires in my direction - done
 *   - Mystery: classic? (move fast, random points, rename)
 *   - bombs - done
 *   	- different bomb shapes
 *   - Screens:
 *   	- Start (with help)
 *   		- 'P'
 *   		- 'left', 'right',
 *   		- 'space'
 *   	- next Level
 *   	- win:
 *   		- show score
 *   		- Name enter, if in best list (minimal edit: capital us-ascii chars, space, del, enter
 *   	- loose
 *   		- show score
 *   	- show high scores
 * - Pause text
 * - shooting: auto ok, or single shot? - one shot only?
 * - Points
 *   - get - done
 *   - show
 *   - highscore
 * - 3 Lives - halfway
 * - User:
 *   - Name
 *   - save score
 * - end: - halfway
 *   - all invaders killed
 *   - invaders reach ground
 *   - invaders kill me
 * - game:
 *   - fasten
 *   - levels:
 *   	- more types ?
 *   	- faster start ? no; deeper
 *   - in pause mode:
 *   	- unpause
 *   	- new game
 * - blocks
 * - sounds:
 *   - my shot
 *   - my shot hit
 *   - trooper bomb
 *   - trooper bomb hit me
 *   - trooper bomb hit block
 *   - fleet walk
 *   - killer appears
 *   - killer torpedo shot
 *   - killer torpedo shot hit me
 *   - killer torpedo shot hit block
 *   - game start
 *   - game paused
 *   - game restart
 *   - i win
 *   - invaders win
 *   - 
 * - effects:
 *   - hit me
 *   - hit trooper
 *   - hit killer
 *   - score count
 *   - new highscore
 *
 * - deploy as ruby app on heroku
 *
 *
 * Next Game:
 * - fly over terrain, kill aliens
 * - up, down, forward, backward, fire, mines?
 *
 *
 */


var constantFire = false;
var userNameLength = 12;



var Colors = {
	bg: 		'black',
	commander:	'orange',
	killer:		'#ccff00',
	trooper:	'#5588ff',
	shot:		'white',
	myself:		'#00ff00',
	text:		'#6666ff',
	block:		'#999'
};

var State = {
	running:	1,
	paused:		2,
	gameOver:	3
};

var numShots = 2;
var shotDelay = 200;
var shotDelta = -7;
var maxScores = 15;


var K = 2;
var maxBombs = 10;

var Shot = new Class({
	initialize: function(x, y, vx, vy) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.active = true;
	},
	draw: function(ctx, color) {
		ctx.fillStyle = color;
		ctx.fillRect(K*(this.x), K*this.y, K*2, K*4);
	},
	update: function(controller) {
		this.x += this.vx;
		this.y += this.vy;
		return controller.checkBlockHit(this.x, this.y, this.vx, this.vy);
	}
});

var Geometry = new Class({
	initialize: function(outline, holes) {
		this.outline = outline;
		this.holes = holes;
		this.cx = 0;
		this.width = 0;
		this.height = 0;
		var i,p;
		for (i=0; i<outline.length; i++) {
			p = outline[i];
			if (p.x > this.width) {
				this.width = p.x;
			}
			if (p.y > this.height) {
				this.height = p.y;
			}
		}
	},
	draw: function(ctx, x, y) {
		var i,p;
		ctx.save();
		ctx.translate(K*x,K*y);

		ctx.beginPath();
		var fr = ctx.fillRule;
		p = this.outline[0];
		ctx.moveTo(K*p.x, K*p.y);
		for (i=1; i<this.outline.length; i++) {
			p = this.outline[i];
			ctx.lineTo(K*p.x, K*p.y);
		}
		ctx.closePath();

		ctx.fill();

		ctx.fillStyle = Colors.bg;
		for (i=0; i<this.holes.length; i++) {
			ctx.fillRect(K*this.holes[i].x, K*this.holes[i].y, K*2, K*2);
		}

		ctx.restore();
	},
});

var mysteryGeo = null;
function createMysteryGeo() {
	if (mysteryGeo) {
		return mysteryGeo;
	}
	var outlineOne = [
		{x: 0,y: 8},
		{x: 0,y:10},
		{x: 4,y:10},
		{x: 4,y:12},
		{x: 6,y:12},
		{x: 6,y:14},
		{x: 8,y:14},
		{x: 8,y:12},
		{x:10,y:12},
		{x:10,y:10},
		{x:14,y:10},
		{x:14,y:12},
		{x:18,y:12},
		{x:18,y:10},
		{x:22,y:10},
		{x:22,y:12},
		{x:24,y:12},
		{x:24,y:14},
		{x:26,y:14},
		{x:26,y:12},
		{x:28,y:12},
		{x:28,y:10},
		{x:32,y:10},
		{x:32,y: 8},
		{x:30,y: 8},
		{x:30,y: 6},
		{x:28,y: 6},
		{x:28,y: 4},
		{x:26,y: 4},
		{x:26,y: 2},
		{x:22,y: 2},
		{x:22,y: 0},
		{x:10,y: 0},
		{x:10,y: 2},
		{x: 6,y: 2},
		{x: 6,y: 4},
		{x: 4,y: 4},
		{x: 4,y: 6},
		{x: 2,y: 6},
		{x: 2,y: 8}
	];
	var holesOne = [
		{x: 6,y:6},
		{x:12,y:6},
		{x:18,y:6},
		{x:24,y:6}
	];
	var one = new Geometry(outlineOne, holesOne);
	mysteryGeo = [one, one];
	return mysteryGeo;
}

var coyoteGeo = null;
function createCoyoteGeo() {
	if (coyoteGeo) {
		return coyoteGeo;
	}
	var outlineOne = [
		{x: 0,y: 4},
		{x: 0,y: 8},
		{x: 2,y: 8},
		{x: 2,y: 6},
		{x: 4,y: 6},
		{x: 4,y: 8},
		{x: 6,y: 8},
		{x: 6,y: 6},
		{x: 8,y: 6},
		{x: 8,y: 8},
		{x:10,y: 8},
		{x:10,y: 6},
		{x:12,y: 6},
		{x:12,y: 8},
		{x:14,y: 8},
		{x:14,y: 6},
		{x:16,y: 6},
		{x:16,y:12},
		{x:14,y:12},
		{x:14,y:10},
		{x:12,y:10},
		{x:12,y:12},
		{x:10,y:12},
		{x:10,y:10},
		{x: 8,y:10},
		{x: 8,y:12},
		{x: 6,y:12},
		{x: 6,y:10},
		{x: 4,y:10},
		{x: 4,y:12},
		{x: 2,y:12},
		{x: 2,y:10},
		{x: 0,y:10},
		{x: 0,y:14},
		{x:22,y:14},
		{x:22,y:12},
		{x:26,y:12},
		{x:26,y:14},
		{x:32,y:14},
		{x:32,y: 2},
		{x:26,y: 2},
		{x:26,y: 0},
		{x:16,y: 0},
		{x:16,y: 4},
	];
	var outlineTwo = [
		{x: 0,y: 6},
		{x: 0,y:12},
		{x:20,y:12},
		{x:20,y:14},
		{x:32,y:14},
		{x:32,y: 2},
		{x:26,y: 2},
		{x:26,y: 0},
		{x:16,y: 0},
		{x:16,y: 6},
	];
	var holesOne = [
		{x:18,y:2},
		{x:18,y:4},
		{x:20,y:2},
		{x:20,y:4},
		{x: 2,y:8},
		{x: 6,y:8},
		{x: 8,y:8},
		{x:10,y:8},
	];
	var holesTwo = [
		{x:18,y:2},
		{x:18,y:4},
		{x:20,y:2},
		{x:20,y:4},
		{x: 2,y:8},
		{x: 6,y:8},
		{x:10,y:8},
		{x:14,y:8},
	];
	var one = new Geometry(outlineOne, holesOne);
	var two = new Geometry(outlineTwo, holesTwo);
    var outlineThree = mirror(outlineOne);
    var outlineFour = mirror(outlineTwo);
    var holesThree = mirror(holesOne, 32)
    var holesFour = mirror(holesTwo, 32)
	var three = new Geometry(outlineThree, holesThree);
	var four = new Geometry(outlineFour, holesFour);
	coyoteGeo = [one, two, three, four];
	return coyoteGeo;
}

var commanderGeo = null;
function createCommanderGeo() {
	if (commanderGeo) {
		return commanderGeo;
	}
	var outlineOne = [
		{x: 0, y: 6},
		{x: 0, y:10},
		{x: 2, y:10},
		{x: 2, y:12},
		{x: 4, y:12},
		{x: 4, y:14},
		{x: 2, y:14},
		{x: 2, y:15},
		{x: 4, y:15},
		{x: 4, y:14},
		{x: 6, y:14},
		{x: 6, y:12},
		{x:10, y:12},
		{x:10, y:14},
		{x:12, y:14},
		{x:12, y:15},
		{x:14, y:15},
		{x:14, y:14},
		{x:12, y:14},
		{x:12, y:12},
		{x:14, y:12},
		{x:14, y:10},
		{x:16, y:10},
		{x:16, y: 6},
		{x:14, y: 6},
		{x:14, y: 4},
		{x:12, y: 4},
		{x:12, y: 2},
		{x:10, y: 2},
		{x:10, y: 0},
		{x: 6, y: 0},
		{x: 6, y: 2},
		{x: 4, y: 2},
		{x: 4, y: 4},
		{x: 2, y: 4},
		{x: 2, y: 6}
	];
	var outlineTwo = [
		{x: 0, y: 6},
		{x: 0, y:10},
		{x: 2, y:10},
		{x: 2, y:12},
		{x: 0, y:12},
		{x: 0, y:14},
		{x: 2, y:14},
		{x: 2, y:15},
		{x: 4, y:15},
		{x: 4, y:14},
		{x: 2, y:14},
		{x: 2, y:12},
		{x: 4, y:12},
		{x: 4, y:10},
		{x: 6, y:10},
		{x: 6, y:12},
		{x:10, y:12},
		{x:10, y:10},
		{x:12, y:10},
		{x:12, y:12},
		{x:14, y:12},
		{x:14, y:14},
		{x:12, y:14},
		{x:12, y:15},
		{x:12, y:15},
		{x:14, y:15},
		{x:14, y:14},
		{x:16, y:14},
		{x:16, y:12},
		{x:14, y:12},
		{x:14, y:10},
		{x:16, y:10},
		{x:16, y: 6},
		{x:14, y: 6},
		{x:14, y: 4},
		{x:12, y: 4},
		{x:12, y: 2},
		{x:10, y: 2},
		{x:10, y: 0},
		{x: 6, y: 0},
		{x: 6, y: 2},
		{x: 4, y: 2},
		{x: 4, y: 4},
		{x: 2, y: 4},
		{x: 2, y: 6}
	];
	var holesOne = [
		{x: 4,y: 6},
		{x: 4,y:10},
		{x:10,y: 6},
		{x:10,y:10}
	];
	var holesTwo = [
		{x: 4,y: 6},
		{x:10,y: 6},
	];
	var one = new Geometry(outlineOne, holesOne);
	var two = new Geometry(outlineTwo, holesTwo);
	commanderGeo = [one, two, one, two];
	return commanderGeo;
}

var trooperGeo = null;
function createTrooperGeo() {
	if (trooperGeo) {
		return trooperGeo;
	}
	var outlineOne = [
		{x: 0, y: 8},
		{x: 0, y:14},
		{x: 2, y:14},
		{x: 2, y:10},
		{x: 4, y:10},
		{x: 4, y:14},
		{x: 6, y:14},
		{x: 6, y:16},
		{x: 8, y:16},
		{x: 8, y:14},
		{x: 6, y:14},
		{x: 6, y:12},
		{x:14, y:12},
		{x:14, y:14},
		{x:12, y:14},
		{x:12, y:16},
		{x:14, y:16},
		{x:14, y:14},
		{x:16, y:14},
		{x:16, y:10},
		{x:18, y:10},
		{x:18, y:14},
		{x:20, y:14},
		{x:20, y: 8},
		{x:18, y: 8},
		{x:18, y: 6},
		{x:16, y: 6},
		{x:16, y: 4},
		{x:14, y: 4},
		{x:14, y: 2},
		{x:16, y: 2},
		{x:16, y: 0},
		{x:14, y: 0},
		{x:14, y: 2},
		{x:12, y: 2},
		{x:12, y: 4},
		{x: 8, y: 4},
		{x: 8, y: 2},
		{x: 6, y: 2},
		{x: 6, y: 0},
		{x: 4, y: 0},
		{x: 4, y: 2},
		{x: 6, y: 2},
		{x: 6, y: 4},
		{x: 4, y: 4},
		{x: 4, y: 6},
		{x: 2, y: 6},
		{x: 2, y: 8}
	];
	var outlineTwo = [
		{x: 0, y: 3},
		{x: 0, y: 9},
		{x: 2, y: 9},
		{x: 2, y:11},
		{x: 4, y:11},
		{x: 4, y:15},
		{x: 2, y:15},
		{x: 2, y:16},
		{x: 4, y:16},
		{x: 4, y:15},
		{x: 6, y:15},
		{x: 6, y:13},
		{x:14, y:13},
		{x:14, y:15},
		{x:16, y:15},
		{x:16, y:16},
		{x:18, y:16},
		{x:18, y:15},
		{x:16, y:15},
		{x:16, y:11},
		{x:18, y:11},
		{x:18, y: 9},
		{x:20, y: 9},
		{x:20, y: 3},
		{x:18, y: 3},
		{x:18, y: 7},
		{x:16, y: 7},
		{x:16, y: 5},
		{x:14, y: 5},
		{x:14, y: 3},
		{x:16, y: 3},
		{x:16, y: 1},
		{x:14, y: 1},
		{x:14, y: 3},
		{x:12, y: 3},
		{x:12, y: 5},
		{x: 8, y: 5},
		{x: 8, y: 3},
		{x: 6, y: 3},
		{x: 6, y: 1},
		{x: 4, y: 1},
		{x: 4, y: 3},
		{x: 6, y: 3},
		{x: 6, y: 5},
		{x: 4, y: 5},
		{x: 4, y: 7},
		{x: 2, y: 7},
		{x: 2, y: 3}
	];
	var holesOne = [
		{x: 6,y: 6},
		{x:12,y: 6}
	];
	var holesTwo = [
		{x: 6,y: 6},
		{x:12,y: 6}
	];
	var one = new Geometry(outlineOne, holesOne);
	var two = new Geometry(outlineTwo, holesTwo);
	trooperGeo = [one, two];
	return trooperGeo;
}

var myGeo = null;
function createMyGeo() {
	if (myGeo) {
		return myGeo;
	}
	var outlineOne = [
		{x: 0, y: 8},
		{x: 0, y:14},
		{x: 2, y:14},
		{x: 2, y:16},
		{x:26, y:16},
		{x:26, y:14},
		{x:28, y:14},
		{x:28, y: 8},
		{x:24, y: 8},
		{x:24, y: 6},
		{x:20, y: 6},
		{x:20, y: 4},
		{x:18, y: 4},
		{x:18, y: 6},
		{x:16, y: 6},
		{x:16, y: 2},
		{x:15, y: 2},
		{x:15, y: 0},
		{x:13, y: 0},
		{x:13, y: 2},
		{x:12, y: 2},
		{x:12, y: 6},
		{x:10, y: 6},
		{x:10, y: 4},
		{x: 8, y: 4},
		{x: 8, y: 6},
		{x: 4, y: 6},
		{x: 4, y: 8}
	];
	var holesOne = [
      {x: 4, y:10},
      {x: 4, y:12},
      {x: 6, y:10},
      {x: 6, y:12},
      {x:20, y:10},
      {x:20, y:12},
      {x:22, y:10},
      {x:22, y:12},
	];
	var one = new Geometry(outlineOne, holesOne);
	var two = new Geometry(outlineOne, holesOne);
	myGeo = [one, two];
	return myGeo;
}
/*
function createMyGeo() {
	if (myGeo) {
		return myGeo;
	}
	var outlineOne = [
		{x: 0, y: 8},
		{x: 0, y:16},
		{x:28, y:16},
		{x:28, y: 8},
		{x:26, y: 8},
		{x:26, y: 6},
		{x:17, y: 6},
		{x:17, y: 2},
		{x:15, y: 2},
		{x:15, y: 0},
		{x:13, y: 0},
		{x:13, y: 2},
		{x:11, y: 2},
		{x:11, y: 6},
		{x: 2, y: 6},
		{x: 2, y: 8},
	];
	var holesOne = [
	];
	var one = new Geometry(outlineOne, holesOne);
	var two = new Geometry(outlineOne, holesOne);
	myGeo = [one, two];
	return myGeo;
}
*/


function mirror(ol, width) {
  var i, xm = 0, r = [];
  if (width) {
    xm = width;
  } else {
    for (i=0; i<ol.length; i++) {
      if (ol[i].x > xm) {
        xm = ol[i].x;
      }
    }
  }
  for (i=0; i<ol.length; i++) {
    r.push({x:xm-ol[i].x, y:ol[i].y});
  }
  return r;
}

var duckGeo = null;
function createDuckGeo() {
	if (duckGeo) {
		return duckGeo;
	}
	var outlineOne = [
		{x: 0,y: 4},
		{x: 0,y: 6},
		{x: 6,y: 6},
		{x: 6,y:12},
		{x: 8,y:12},
		{x: 8,y:14},
		{ x:10,y:14},
		{ x:10,y:16},
		{ x:14,y:16},
		{ x:14,y:14},
		{x:18,y:14},
		{x:18,y:12},
		{x:20,y:12},
		{x:20,y: 4},
		{x:18,y: 4},
		{x:18,y: 6},
		{x:16,y: 6},
		{x:16,y: 8},
		{x:10,y: 8},
		{x:10,y: 0},
		{x: 4,y: 0},
		{x: 4,y: 4}
	];
	var outlineTwo = [
		{x: 0,y: 4},
		{x: 0,y: 6},
		{x: 6,y: 6},
		{x: 6,y:12},
		{x: 8,y:12},
		{x: 8,y:14},
		{ x:14,y:14},
		{ x:14,y:16},
		{ x:18,y:16},
		{ x:18,y:14},
		{x:18,y:14},
		{x:18,y:12},
		{x:20,y:12},
		{x:20,y: 4},
		{x:18,y: 4},
		{x:18,y: 6},
		{x:16,y: 6},
		{x:16,y: 8},
		{x:10,y: 8},
		{x:10,y: 0},
		{x: 4,y: 0},
		{x: 4,y: 4}
	];
	var holesOne = [
		{x: 6,y:2},
	];
	var holesTwo = [
		{x:12,y:2},
	];
	var one = new Geometry(outlineOne, holesOne);
	var two = new Geometry(outlineTwo, holesOne);
    var outlineThree = mirror(outlineOne);
    var outlineFour = mirror(outlineTwo);
	var three = new Geometry(outlineThree, holesTwo);
	var four = new Geometry(outlineFour, holesTwo);
	duckGeo = [one, two, three, four];
	return duckGeo;
}


var monkeyGeo = null;
function createMonkeyGeo() {
	if (monkeyGeo) {
		return monkeyGeo;
	}
	var outlineOne = [
		{x: 0,y: 4},
		{x: 0,y:10},
		{x: 2,y:10},
		{x: 2,y:14},
		{x: 4,y:14},
		{x: 4,y:16},
		{x:14,y:16},
		{x:14,y:14},
		{x:16,y:14},
		{x:16,y:10},
		{x:18,y:10},
		{x:18,y: 4},
		{x:16,y: 4},
		{x:16,y: 2},
		{x:14,y: 2},
		{x:14,y: 0},
		{x: 4,y: 0},
		{x: 4,y: 2},
		{x: 2,y: 2},
		{x: 2,y: 4},
	];
	var holesOne = [
		{x: 2,y: 4},
		{x: 2,y: 4},
		{x: 2,y: 6},
		{x: 2,y: 6},
		{x: 4,y: 4},
		{x: 4,y: 4},
		{x: 4,y: 6},
		{x: 4,y: 6},
		{x:12,y: 4},
		{x:12,y: 4},
		{x:12,y: 6},
		{x:12,y: 6},
		{x:14,y: 4},
		{x:14,y: 4},
		{x:14,y: 6},
		{x:14,y: 6},

		{x:8,y:2},
		{x:8,y:4},

		{x: 6,y:10},
		{x: 6,y:12},
		{x: 8,y:10},
		{x: 8,y:12},
		{x:10,y:10},
		{x:10,y:12},
	];
	var holesTwo = [
		{x: 2,y: 4},
		{x: 2,y: 4},
		{x: 2,y: 6},
		{x: 2,y: 6},
		{x: 4,y: 4},
		{x: 4,y: 4},
		{x: 4,y: 6},
		{x: 4,y: 6},
		{x:12,y: 4},
		{x:12,y: 4},
		{x:12,y: 6},
		{x:12,y: 6},
		{x:14,y: 4},
		{x:14,y: 4},
		{x:14,y: 6},
		{x:14,y: 6},

		{x:8,y:2},
		{x:8,y:4},

		{x: 8,y:10},
	];
	var one = new Geometry(outlineOne, holesOne);
    var two = new Geometry(outlineOne, holesTwo);
	monkeyGeo = [one, two, one, two];
	return monkeyGeo;
}

var monkeyGeo2 = null;
function createMonkeyGeo2() {
	if (monkeyGeo2) {
		return monkeyGeo2;
	}
	var outlineOne = [
		{x: 0,y: 0},
		{x: 0,y: 2},
		{x: 2,y: 2},
		{x: 2,y: 4},
		{x: 0,y: 4},
		{x: 0,y: 8},
		{x: 2,y: 8},
		{x: 2,y:14},
		{x: 4,y:14},
		{x: 4,y:16},
		{x:14,y:16},
		{x:14,y:14},
		{x:16,y:14},
		{x:16,y: 8},
		{x:18,y: 8},
		{x:18,y: 4},
		{x:16,y: 4},
		{x:16,y: 2},
		{x:18,y: 2},
		{x:18,y: 0},
		{x:12,y: 0},
		{x:12,y: 2},
		{x: 6,y: 2},
		{x: 6,y: 0},
	];
	var holesOne = [
		{x: 2,y: 4},
		{x: 2,y: 4},
		{x: 2,y: 6},
		{x: 2,y: 6},
		{x: 4,y: 4},
		{x: 4,y: 4},
		{x: 4,y: 6},
		{x: 4,y: 6},
		{x:12,y: 4},
		{x:12,y: 4},
		{x:12,y: 6},
		{x:12,y: 6},
		{x:14,y: 4},
		{x:14,y: 4},
		{x:14,y: 6},
		{x:14,y: 6},

		{x:8,y:2},
		{x:8,y:4},

		{x: 6,y:10},
		{x: 6,y:12},
		{x: 8,y:10},
		{x: 8,y:12},
		{x:10,y:10},
		{x:10,y:12},
	];
	var holesTwo = [
		{x: 2,y: 4},
		{x: 2,y: 4},
		{x: 2,y: 6},
		{x: 2,y: 6},
		{x: 4,y: 4},
		{x: 4,y: 4},
		{x: 4,y: 6},
		{x: 4,y: 6},
		{x:12,y: 4},
		{x:12,y: 4},
		{x:12,y: 6},
		{x:12,y: 6},
		{x:14,y: 4},
		{x:14,y: 4},
		{x:14,y: 6},
		{x:14,y: 6},

		{x:8,y:2},
		{x:8,y:4},

		{x: 8,y:10},
	];
	var one = new Geometry(outlineOne, holesOne);
    var two = new Geometry(outlineOne, holesTwo);
	monkeyGeo2 = [one, two, one, two];
	return monkeyGeo2;
}
var Ship = new Class({
	initialize: function(x, y, geoi, value) {
		this.x = x;
		this.y = y;
		this.geo = geo;
		this.active = true;
		this.width = this.geo[0].width;
		this.height = this.geo[0].height;
		this.cx = this.geo[0].width / 2;
		this.cy = this.geo[0].height / 2;
		this.value = value;
	},
	draw: function(ctx, idx, X, Y) {
		ctx.fillStyle = this.color;
		this.geo[idx].draw(ctx, X + this.x, Y + this.y);
	},
	checkHit: function(x, y, ox, oy) {
		var sx, sy;
		sx = this.x + ox;
		sy = this.y + oy;
		if (this.active && x >= sx && x <= sx+this.width && y >= sy && y <= sy+this.height) {
			return true;
		}
		return false;
	}
});

var Mystery = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createMysteryGeo();
		this.parent(x, y, geo, 100);
		this.color = Colors.mystery;
	}
});

var Commander = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createCommanderGeo();
		this.parent(x, y, geo, 50);
		this.color = Colors.commander;
	}
});

var Trooper = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createTrooperGeo();
		this.parent(x, y, geo, 20);
		this.color = Colors.trooper;
	}
});

var Monkey = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createMonkeyGeo();
		this.parent(x, y, geo, 50);
		this.color = Colors.commander;
	}
});

var Monkey2 = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createMonkeyGeo2();
		this.parent(x, y, geo, 50);
		this.color = Colors.commander;
	}
});

var Coyote = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createCoyoteGeo();
		this.parent(x, y, geo, 50);
		this.color = Colors.commander;
	}
});

var Duck = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createDuckGeo();
		this.parent(x, y, geo, 20);
		this.color = Colors.trooper;
	}
});

var MyShip = new Class({
	Extends: Ship,
	initialize: function(x, y) {
		geo = createMyGeo();
		this.parent(x, y, geo, 0);
		this.color = Colors.myself;
	}
});

var Fleet = new Class({
	initialize: function(controller, level) {
		var i, j;
		this.ships = [];
		for (i=0; i<12; i++) {
			this.ships.push(new Monkey2(i*26, 24));
			//this.ships.push(new Commander(i*26, 24));
		}
		for (j=0; j<6; j++) {
			for (i=0; i<12; i++) {
				//this.ships.push(new Trooper(i*26, 44 + j*20));
				this.ships.push(new Duck(i*26, 44 + j*20));
			}
		}
		this.x = 0;
		this.y = (level-1)*7;
		this.left = 0;
		this.right = 26*11 + this.ships[13].width;
		this.top = 20;
		this.bottom = 40+5*20 + this.ships[13].height;
		this.hstep = 5;
		this.vstep = 10;
		this.calculateSize();
		this.numShips = 12*7;
		this.controller = controller;
	},
    march_sound_org: function() {
		this.controller.sounds.play('fastinvader1');
		this.controller.sounds.play('fastinvader2');
		this.controller.sounds.play('fastinvader3');
		this.controller.sounds.play('fastinvader4');
    },
    march_sound: function() {
		this.controller.sounds.play('march');
    },
	march: function() {
		this.x += this.hstep;
        this.march_sound();
		if (K*(this.x + this.right) > this.controller.width || K*(this.x + this.left) < 0) {
			this.hstep = -this.hstep;
			this.x += this.hstep;
			this.y += this.vstep;
			if (K*(this.y + this.bottom) > this.controller.height) {
				this.controller.state = State.gameOver;
				this.controller.sounds.play('explosion');
			}
		}
	},
	draw: function(ctx, idx) {
		var i, ship;
        var plus = this.hstep > 0 ? 2 : 0;
		for (i=0; i<this.ships.length; i++) {
			ship = this.ships[i];
			if (ship.active) {
				ship.draw(ctx, idx+plus, this.x, this.y);
				if (Math.random() < 0.0025) {
					this.controller.dropBomb(this.x + ship.x + ship.cx, this.y + ship.y + ship.height, 0, 2);
				}
			}
		}
	},
	checkHit: function(x, y) {
		var i, ship;
		for (i=0; i<this.ships.length; i++) {
			ship = this.ships[i];
			if (ship.checkHit(x, y, this.x, this.y)) {
				return i;
			}
		}
		return -1;
	},
	deleteShip: function(idx) {
		this.ships[idx].active = false;
		this.calculateSize();
		this.numShips--;
		return this.ships[idx].value;
	},
	calculateSize: function() {
		var i, ship, sx, sy, l, r, t, b;
		this.left = 1000;
		this.right = -1000;
		this.top = 1000;
		this.bottom = -1000;
		for (i=0; i<this.ships.length; i++) {
			ship = this.ships[i];
			if (ship.active) {
				l = ship.x;
				r = ship.x + ship.width;
				t = ship.y;
				b = ship.y + ship.height;
				if (l < this.left) {
					this.left = l;
				}
				if (r > this.right) {
					this.right = r;
				}
				if (b > this.bottom) {
					this.bottom = b;
				}
				if (t < this.top) {
					this.top = t;
				}
			}
		}
	}
});

var Table = new Class({
	initialize: function(rows, cols) {
		var r, c;
		this.content = [];
		this.rowOpts = [];
		this.colOpts = [];
		for (c=0; c<cols; c++) {
			this.content.push([]);				// one column
			this.colOpts.push(null);
			for (r=0; r < rows; r++) {
				this.content[c].push(' ');
			}
		}
		for (r=0; r<rows; r++) {
			this.rowOpts.push(null);
		}
	},
	setRowOptions: function(row, opt) {
		this.rowOpts[row] = opt;
	},
	setColumnOptions: function(col, opt) {
		this.colOpts[col] = opt;
	},
	getRowOptions: function(row) {
		return this.rowOpts[row];
	},
	getColumnOptions: function(col) {
		return this.colOpts[col];
	},
	setCell: function(row, col, text) {
		this.content[col][row] = text;
	},
	getCell: function(row, col) {
		return this.content[col][row];
	},
	numRows: function() {
		return this.content[0].length;
	},
	numColumns: function() {
		return this.content.length;
	}
});

var Controller = new Class({
	initialize: function(parentDiv, full, width, height) {

		this.sounds = new Sounds();
        this.getUserFromServer();

        // testing
        this.getSessionInfo();

		this.step = 300;

        if (full) {
          this.setupCanvasesFull(parentDiv);
        } else {
          this.setupCanvases(parentDiv, width, height);
        }

		this.deltaX = 4;
		this.newShip();
		this.myShip.color = Colors.myself;
		this.fm = new BlockFontManager();

		this.idx = 0;
		this.curSel = 0;
		this.oldSel = -1;
		this.selectionText = [];
		this.selectionCB = [];

		this.fm.getFont(4);
		this.fm.getFont(5);
		this.fm.getFont(6);
		this.fm.getFont(7);
		this.fm.getFont(8);
		this.fm.getFont(9);
		this.fm.getFont(10);
		this.selecting = false;
		this.highscores = [];

		//this.readHighscores();
	    this.clearHighscores();
		this.saveHighscores();

		this.level = 1;
		this.loadSounds();
		this.sounds.setVolume(0.25);

        this.sounds.on = false;

        this.userName = null;
	},

    postScore_uu_not_working: function() {

      var url = 'pages/post_score';
      var ctrl = this;
      var token = getMetaContents('csrf-token');

      var myAjax = new Request({
        url:url,
        method: 'post',
        data: 'message from client',
        headers: {
	      'X-CSRF-Token': token
        },

        onComplete: function(json) {
          var obj = JSON.decode(json);
        }
      });

      myAjax.send('XXXX', 'YYYY');
    },

    postScoreJS : function() {
      var req = new XMLHttpRequest();
      var ctrl = this;

      req.open('post', '/pages/post_score');
      function handleStateChange() {
        var i, entry;
        if (4 === req.readyState && 200 === req.status) {
          var json = req.responseText;
          var obj = JSON.decode(json);

          if (obj.success) {
            ctrl.highscores = [];
            for (i=0; i<obj.highscores.length; i++) {
              entry = obj.highscores[i];
              ctrl.highscores.push({name: entry.name, score: entry.score});
            }
            ctrl.user_highscores = obj.user_highscores;
          }
        }
      }

      req.onreadystatechange = handleStateChange;
      req.setRequestHeader('Content-type', 'application/json');

      var token = getMetaContents('csrf-token');
      req.setRequestHeader("X-CSRF-Token", token);

      var t = {game_id: 1, score: this.points};
      var d = JSON.encode(t);
      req.send(d);
    },

    getUserFromServer: function() {

      var url = '/pages/get_current_user.json';
      var ctrl = this;

      var myAjax = new Request({
        url:url,
        method: 'get',
        onComplete: function(json) {
          var obj = JSON.decode(json);
          var logged_in = null !== obj;
          if (logged_in) {
            ctrl.userName = obj.name;
            ctrl.sounds.on = obj.sound;
            ctrl.sounds.setVolume(obj.volume);
            //ctrl.addHighscore();
          } else {
            ctrl.userName = null;
          }
          //ctrl.showNewGame(logged_in);
          //ctrl.state = State.gameOver;
        }
      });

      myAjax.send();
    },

    // testing
    getSessionInfo: function() {

      var url = '/pages/get_session_info.json';
      var ctrl = this;

      var myAjax = new Request({
        url:url,
        method: 'get',
        onComplete: function(json) {
          var obj = JSON.decode(json);
        }
      });

      myAjax.send();
    },
	setupCanvases: function(parentDiv, width, height) {

		parentDiv.setStyle('width', width + 'px');
		parentDiv.set('class', 'container');


		var canvas = new Element('canvas');
		canvas.set('class', 'app');
		canvas.setStyle('outline', 'none');

		setupHiddenCursor(canvas);

		// internal pixels - always the same:
		canvas.width = 800;
		canvas.height = 800;
		parentDiv.appendChild(canvas);
		// visible size - depending on available space:
		canvas.setStyle('width', width + 'px');
		canvas.setStyle('height', height + 'px');

		canvas.setStyle('box-shadow', '8px 8px 8px #666;');
		canvas.setStyle('shadow', '-webkit-box-shadow: 5px 5px 10px 10px #000fff');
		canvas.setStyle('border', '');

		this.ctx = canvas.getContext('2d');

		this.width = this.ctx.canvas.width;
		this.height = this.ctx.canvas.height;
		this.ctx.canvas.addEvent('keydown', this.keydownMain.bind(this));
		this.ctx.canvas.addEvent('keyup', this.keyupMain.bind(this));
		this.ctx.canvas.set('tabindex', '0');

		// canvas position
		var posX = canvas.getOffsets().x;
		var posY = canvas.getOffsets().y;


		// overlay canvas, for dialogs
		this.overlayCanvas = new Element('canvas');
		this.overlayCanvas.setStyle('outline', 'none');
		this.overlayCanvas.setStyle('position', 'absolute');
		this.overlayCanvas.setStyle('left', posX + 'px');
		this.overlayCanvas.setStyle('top', posY + 'px');

		setupHiddenCursor(this.overlayCanvas);

		// internal pixels - always the same:
		this.overlayCanvas.width = 800;
		this.overlayCanvas.height = 800;
		parentDiv.appendChild(this.overlayCanvas);
		// visible size - depending on available space:
		this.overlayCanvas.setStyle('width', width + 'px');
		this.overlayCanvas.setStyle('height', height + 'px');

		this.overlayCtx = this.overlayCanvas.getContext('2d');

		this.overlayCanvas.addEvent('keydown', this.keydownOverlay.bind(this));
		this.overlayCanvas.addEvent('keyup', this.keyupOverlay.bind(this));
		this.overlayCanvas.set('tabindex', '0');
	},
    fullResize: function() {
        var awidth = window.innerWidth;
        var aheight = window.innerHeight;

        var wh = Math.min(awidth, aheight);
        wh -= 4;

        this.wh = wh;

        var canvas = this.ctx.canvas;

        this.parentDiv.setStyle('width', wh + 'px');
		
        // visible size - depending on available space:
		canvas.setStyle('width', wh + 'px');
		canvas.setStyle('height', wh + 'px');

		// canvas position
		var posX = canvas.getOffsets().x;
		var posY = canvas.getOffsets().y;

		this.overlayCanvas.setStyle('left', posX + 'px');
		this.overlayCanvas.setStyle('top', posY + 'px');

		// visible size - depending on available space:
		this.overlayCanvas.setStyle('width', wh + 'px');
		this.overlayCanvas.setStyle('height', wh + 'px');
    },
	setupCanvasesFull: function(parentDiv) {

        this.parentDiv = parentDiv;
		window.addEvent('resize', this.fullResize.bind(this));


		parentDiv.set('class', 'container');
        document.body.setStyle('margin', '0 0 0 0');
        document.body.setStyle('background-image', 'url(../assets/background.png)');
        //document.body.setStyle('background-image', 'url(background.png)');
        //document.body.setStyle('background-image', 'url(assets/images/background.png)');
        //document.body.setStyle('background-image', 'url(images/background.png)');


		var canvas = new Element('canvas');
		canvas.set('class', 'app_full');
		canvas.setStyle('outline', 'none');

		setupHiddenCursor(canvas);

		// internal pixels - always the same:
		canvas.width = 800;
		canvas.height = 800;
		parentDiv.appendChild(canvas);

		this.ctx = canvas.getContext('2d');

		this.width = this.ctx.canvas.width;
		this.height = this.ctx.canvas.height;
		this.ctx.canvas.addEvent('keydown', this.keydownMain.bind(this));
		this.ctx.canvas.addEvent('keyup', this.keyupMain.bind(this));
		this.ctx.canvas.set('tabindex', '0');

		// overlay canvas, for dialogs
		this.overlayCanvas = new Element('canvas');
		this.overlayCanvas.setStyle('outline', 'none');
		this.overlayCanvas.setStyle('position', 'absolute');
		setupHiddenCursor(this.overlayCanvas);
		// internal pixels - always the same:
		this.overlayCanvas.width = 800;
		this.overlayCanvas.height = 800;
		parentDiv.appendChild(this.overlayCanvas);
		this.overlayCtx = this.overlayCanvas.getContext('2d');

		this.overlayCanvas.addEvent('keydown', this.keydownOverlay.bind(this));
		this.overlayCanvas.addEvent('keyup', this.keyupOverlay.bind(this));
		this.overlayCanvas.set('tabindex', '0');

        this.fullResize();
	},
	loadSounds: function() {
		if (!this.sounds.supported) {
			return;
		}
		this.sounds.createSound('explosion', '/invader_sounds/explosion_2-short.ogg', 1, 10);
		this.sounds.createSound('invaderkilled', '/invader_sounds/ogg/duck_1.ogg', 1, 10);
		this.sounds.createSound('shoot', '/invader_sounds/ogg/gunshot.ogg', 1, 10);
		this.sounds.createSound('ufo_highpitch', '/invader_sounds/ogg/chimpanzee_1_1.ogg', 1, 10);
		this.sounds.createSound('ufo_lowpitch', '/invader_sounds/ogg/coyote-short.ogg', 1, 10);
		this.sounds.createSound('march', '/invader_sounds/ogg/clock_single.ogg', 1.0, 10);
		this.sounds.createSound('laughter', '/invader_sounds/ogg/laughter-2-short.ogg', 1.0, 10);
		this.sounds.createSound('applause-4.0', '/invader_sounds/ogg/applause-3-4.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-3.0', '/invader_sounds/ogg/applause-3-3.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-2.0', '/invader_sounds/ogg/applause-3-2.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-1.5', '/invader_sounds/ogg/applause-3-1.5s.ogg', 1.0, 10);
		this.sounds.createSound('applause-1.0', '/invader_sounds/ogg/applause-3-1.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-0.5', '/invader_sounds/ogg/applause-3-0.5s.ogg', 1.0, 10);
		this.sounds.createSound('doh', '/invader_sounds/ogg/doh.ogg', 1.0, 10);
	},
	loadSounds_org: function() {
		if (!this.sounds.supported) {
			return;
		}
		this.sounds.createSound('explosion', '/invader_sounds/explosion.ogg', 0.5, 10);
		this.sounds.createSound('fastinvader1', '/invader_sounds/fastinvader1.ogg', 1.0, 10);
		this.sounds.createSound('fastinvader2', '/invader_sounds/fastinvader2.ogg', 1.0, 10);
		this.sounds.createSound('fastinvader3', '/invader_sounds/fastinvader3.ogg', 1.0, 10);
		this.sounds.createSound('fastinvader4', '/invader_sounds/fastinvader4.ogg', 1.0, 10);
		this.sounds.createSound('invaderkilled', '/invader_sounds/invaderkilled.ogg', 0.5, 10);
		this.sounds.createSound('shoot', '/invader_sounds/shoot.ogg', 0.5, 10);
		this.sounds.createSound('ufo_highpitch', '/invader_sounds/ufo_highpitch.ogg', 0.5, 10);
		this.sounds.createSound('ufo_lowpitch', '/invader_sounds/ufo_lowpitch.ogg', 0.5, 10);
	},
    /*
	loadSounds: function() {
		if (!this.sounds.supported) {
			return;
		}
		this.sounds.createSound('explosion', '/invader_sounds/ogg/explosion_2-short.ogg', 1, 10);
		this.sounds.createSound('invaderkilled', '/invader_sounds/ogg/duck_1.ogg', 1, 10);
		this.sounds.createSound('shoot', '/invader_sounds/ogg/gunshot.ogg', 1, 10);
		this.sounds.createSound('ufo_highpitch', '/invader_sounds/ogg/chimpanzee_1_1.ogg', 1, 10);
		this.sounds.createSound('ufo_lowpitch', '/invader_sounds/ogg/coyote-short.ogg', 1, 10);
		this.sounds.createSound('march', '/invader_sounds/ogg/clock_single.ogg', 1.0, 10);
		this.sounds.createSound('laughter', '/invader_sounds/ogg/laughter-2-short.ogg', 1.0, 10);
		this.sounds.createSound('applause-4.0', '/invader_sounds/ogg/applause-3-4.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-3.0', '/invader_sounds/ogg/applause-3-3.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-2.0', '/invader_sounds/ogg/applause-3-2.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-1.5', '/invader_sounds/ogg/applause-3-1.5s.ogg', 1.0, 10);
		this.sounds.createSound('applause-1.0', '/invader_sounds/ogg/applause-3-1.0s.ogg', 1.0, 10);
		this.sounds.createSound('applause-0.5', '/invader_sounds/ogg/applause-3-0.5s.ogg', 1.0, 10);
		this.sounds.createSound('doh', '/invader_sounds/ogg/doh.ogg', 1.0, 10);
	},
	loadSounds_org: function() {
		if (!this.sounds.supported) {
			return;
		}
		this.sounds.createSound('explosion', '/invader_sounds/explosion.ogg', 0.5, 10);
		this.sounds.createSound('fastinvader1', '/invader_sounds/fastinvader1.ogg', 1.0, 10);
		this.sounds.createSound('fastinvader2', '/invader_sounds/fastinvader2.ogg', 1.0, 10);
		this.sounds.createSound('fastinvader3', '/invader_sounds/fastinvader3.ogg', 1.0, 10);
		this.sounds.createSound('fastinvader4', '/invader_sounds/fastinvader4.ogg', 1.0, 10);
		this.sounds.createSound('invaderkilled', '/invader_sounds/invaderkilled.ogg', 0.5, 10);
		this.sounds.createSound('shoot', '/invader_sounds/shoot.ogg', 0.5, 10);
		this.sounds.createSound('ufo_highpitch', '/invader_sounds/ufo_highpitch.ogg', 0.5, 10);
		this.sounds.createSound('ufo_lowpitch', '/invader_sounds/ufo_lowpitch.ogg', 0.5, 10);
	},
    */
	clearHighscores: function() {
		//this.highscores = [{name:'dummy',score:1230}];
		this.saveHighscores();
	},
	readHighscores: function() {
		if (!$defined(window.localStorage)) {
			// console.log('localStorage not supported');
			return;
		}
		var json = localStorage['invaderhighscores'];
		if (!$defined(json)) {
			/*
			this.highscores.push({name:'hugo',score:92040});
			this.highscores.push({name:'bert',score:77510});
			this.highscores.push({name:'hugo',score:40540});
			this.highscores.push({name:'hj',score:35670});
			this.highscores.push({name:'x',score:12000});
			this.highscores.push({name:'hugo',score:8000});
			this.highscores.push({name:'sfs',score:3500});
			this.highscores.push({name:'Z',score:100});
			this.highscores.push({name:'olga',score:80});
			*/
		} else {
			this.highscores = JSON.decode(json);
		}
	},
	saveHighscores: function() {
		if (!$defined(window.localStorage)) {
			return;
		}
		var json = JSON.encode(this.highscores);
		localStorage['invaderhighscores'] = json;
	},
	start: function() {
		this.step = 300;
		this.fleet = new Fleet(this, 0);
		this.createBlocks();
		this.ctx.canvas.focus();
		this.left = false;
		this.right = false;
		this.space = false;
		this.state = State.running;
		this.shots = [numShots];
		this.lastShot = 0;
		this.freeShotIndex = 0;
		this.points = 0;
		this.mysteries = [];
		this.bombs = [];
		this.lives = 2;
		this.unpause();
	},
	dropBomb: function(x, y, vx, vy) {
		if (this.bombs.length > maxBombs) {
			return;
		}
		this.bombs.push(new Shot(x, y, vx, vy));
	},
	updateBombs: function() {
		var i, b, tbr = [];
		for (i=0;i<this.bombs.length; i++) {
			b = this.bombs[i];
			b.draw(this.ctx, Colors.bg);
			
			if (b.update(this)) {
				tbr.push(b);
			} else {

				if (b.x < 0 || b.x > 400 || b.y < 0 || b.y > 400) {
					tbr.push(b);
				} else {
					b.draw(this.ctx, Colors.shot);
					if (b.x >= this.myShip.x &&
						b.x <= this.myShip.x + this.myShip.width &&
						b.y >= this.myShip.y) {
						this.lostShip();
						tbr.push(b);
					}
				}
			}
		}
		for (i=0;i<tbr.length; i++) {
			b = tbr[i];
			this.bombs.erase(b);
		}
	},
	lostShip: function() {
		this.lives--;
		this.sounds.play('explosion');
		if (0 === this.lives) {
			this.state = State.gameOver;
            if (this.points > 10000) {
    		  this.sounds.play('applause-4.0');
            } else if (this.points > 5000) {
    		  this.sounds.play('applause-3.0');
            } else if (this.points > 3000) {
    		  this.sounds.play('applause-2.0');
            } else if (this.points > 2000) {
    		  this.sounds.play('applause-1.5');
            } else if (this.points > 1000) {
    		  this.sounds.play('applause-1.0');
            } else if (this.points > 750) {
    		  this.sounds.play('applause-0.5');
            } else if (this.points > 500) {
    		  this.sounds.play('laughter');
            } else if (this.points > 300) {
    		  this.sounds.play('laughter');
            } else if (this.points > 200) {
    		  this.sounds.play('laughter');
            } else {
    		  this.sounds.play('laughter');
            }


            if (this.points < 1000) {
    		  this.sounds.play('laughter');
            } else {
    		  this.sounds.play('applause');
            }
		} else {
			this.nextShip();
		}
	},
	nextShip: function() {
		var f = this.fleet;
		var a = f.left + f.x;
		var b = 400-(f.right+f.x);
		
		this.myShip.x = (a > b) ? 0 : 400 - this.myShip.width;
	},
	newShip: function() {
		this.myShip = new MyShip(30, 380);
	},
	unpause: function() {
		// several timers:
		this.hideOverlay();
		this.run();
		this.update();
	},
	updateMyShip: function() {
		var x = this.myShip.x;

		if (this.left && this.myShip.x > -this.myShip.cx+2) {
			x -= this.deltaX;
			if (this.shift) {
				x -= this.deltaX;
			}
		} 
		if (this.right && this.myShip.x < 400-this.myShip.cx-3) {
			x += this.deltaX;
			if (this.shift) {
				x += this.deltaX;
			}
		}

		this.updateFire();

		if (constantFire && this.space) {
			this.fire();
		}


		if (x !== this.myShip.x) {
			this.myShip.color = Colors.bg;
			this.myShip.draw(this.ctx, 0, 0, 0);
			this.myShip.x = x;
			this.myShip.color = Colors.myself;
			this.myShip.draw(this.ctx, 0, 0, 0);
		}
	},
	updateMysteries: function() {
		var i, k, tbd = [], dx, dy, d, offset, idx;
		if (Math.random() < 0.01 && this.mysteries.length < 3) {
			//k = new Mystery(300, 5);
			k = new Coyote(300, 5);
            k.idx = 0;
    		this.sounds.play('ufo_lowpitch');
			k.vx = rr(5);
			this.mysteries.push(k);
		}
		for (i=0; i<this.mysteries.length; i++) {
			k = this.mysteries[i];

			k.color = Colors.bg;
			// k.draw(this.ctx, 0, 0, 0);
                offset = k.vx > 0 ? 2 : 0;
                k.idx = (k.idx + 1) % M;
                idx = k.idx < M2 ? 1 : 0;
                idx += offset;
				k.draw(this.ctx, idx, 0, 0);

			k.vx += rr(1);
			k.x += k.vx;
			if (K*(k.x + k.width) < 0 || (K*k.x > this.width)) {
				tbd.push(k);
			} else {
                var M = 20;
                var M2 = M / 2;
				dx = this.myShip.x + this.myShip.cx - (k.x + k.cx);
				dy = this.myShip.y + this.myShip.cy - (k.y + k.cy);
				d = Math.sqrt(dx*dx+dy*dy);
				dx = 3*dx/d + rr(0.9);
				dy = 3*dy/d + rr(0.9);
				if (Math.random() < 0.01) {
					this.dropBomb(k.x + k.cx, k.y + k.height, dx, dy);
				}
				k.color = Colors.killer;
                offset = k.vx > 0 ? 2 : 0;
                k.idx = (k.idx + 1) % M;
                idx = k.idx < M2 ? 1 : 0;
                idx += offset;
				k.draw(this.ctx, idx, 0, 0);
			}
		}
		for (i=0; i<tbd.length; i++) {
			k = tbd[i];
			this.mysteries.erase(k);
		}
	},
	update: function() {
		this.updateMyShip();
		this.updateMysteries();
		this.updateBombs();

		switch (this.state) {
			case State.running:
				this.update.delay(20, this);
				break;
		}
	},
	updateFire: function() {
		var i, shot, hit;
		this.freeShotIndex = -1;
		for (i=0; i<numShots; i++) {
			shot = this.shots[i];
			if (shot && shot.active) {
				if (shot.y < 0) {
					shot.active = false;
					shot.draw(this.ctx, Colors.bg);
				} else {
					shot.draw(this.ctx, Colors.bg);
					if (shot.update(this)) {
						shot.active = false;
					} else {
						shot.draw(this.ctx, Colors.shot);

						hit = this.fleet.checkHit(shot.x, shot.y);
						if (-1 != hit) {
							this.points += this.fleet.deleteShip(hit);
                            if (hit < 12) {
							  this.sounds.play('ufo_highpitch');
                            } else {
                              this.sounds.play('invaderkilled');
                            }
							//this.sounds.play('invaderkilled');
							shot.active = false;
							shot.draw(this.ctx, Colors.bg);
							if (0 === this.fleet.numShips) {
								this.nextLevel();
							}
						}
						if (shot.active) {
							hit = this.checkMysteryHit(shot.x, shot.y);
							if (-1 != hit) {
								this.points += this.mysteries[hit].value;
								this.mysteries.erase(this.mysteries[hit]);
								//this.sounds.play('explosion');
								this.sounds.play('doh');
								shot.active = false;
								shot.draw(this.ctx, Colors.bg);
							}
						}
					}
				}
			} else {
				this.freeShotIndex = i;
			}
		}
	},
	nextLevel: function() {
		this.lives++;
		this.level++;
		this.fleet = new Fleet(this, this.level);
	},
	checkMysteryHit: function(x, y) {
		var i, ship;
		for (i=0; i<this.mysteries.length; i++) {
			ship = this.mysteries[i];
			if (ship.checkHit(x, y, 0, 0)) {
				return i;
			}
		}
		return -1;
	},
	fire: function() {
		var i;
		var now = Date.now();
		if (now - this.lastShot < shotDelay) {
			return;
		}
		if (-1 === this.freeShotIndex) {
			return;
		}
		this.lastShot = now;
		this.shots[this.freeShotIndex] = new Shot(this.myShip.x + this.myShip.cx-1, 380, 0, shotDelta);
		this.sounds.play('shoot');
	},
	run: function() {
		this.ctx.fillStyle = Colors.bg;
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.fleet.march();
		this.fleet.draw(this.ctx, this.idx);
		this.myShip.draw(this.ctx, 0, 0, 0);
		this.drawBlocks();

		this.showLine(this.ctx, 5, 'score: ' + this.points, 20, 20, null);
		this.showLine(this.ctx, 5, 'lives: ' + this.lives + '   ' + 'wave: ' + this.level, 250, 20, null);


		this.idx = (this.idx+1)%2;

		switch (this.state) {
			case State.running:
				this.step = this.fleet.numShips*2 + 25;
				this.run.delay(this.step, this);
				break;
			case State.gameOver:
				this.showGameOver();
				break;
			case State.paused:
				this.showGamePaused();
				break;
		}
	},
	addHighscore: function() {
		var scoreSort = function(a,b) {
			return b.score - a.score;
		};
		var hs = {name:this.userName, score:this.points};
		this.highscores.push(hs);
		this.highscores.sort(scoreSort);
		this.highscores = this.highscores.slice(0,maxScores);
		this.saveHighscores();
	},
	addHighscoreLocal: function() {
		var scoreSort = function(a,b) {
			return b.score - a.score;
		};
		var hs = {name:this.userName, score:this.points};
		this.highscores.push(hs);
		this.highscores.sort(scoreSort);
		this.highscores = this.highscores.slice(0,maxScores);
		this.saveHighscores();
	},
	showNewGame: function(logged_in) {
		var text = logged_in ? ['new Game',	'show Highscores'] : ['new Game'];
		var cb = [
			this.start,
			this.showHighscore
		];
		this.clearOverlay();
		this.showOverlayText(7, text);
		this.oldSel = -1;
		this.setupSelection(text, cb);
		this.showSelection();
	},
	showGameOver: function() {

		var ls, n;

        this.postScoreJS();

		n = this.highscores.length;

		ls = n === 0 ? null : this.highscores[this.highscores.length-1];
		if ((n < maxScores || ls && ls.score < this.points) && this.points > 100) {
			if ($defined(this.userName)) {
				this.addHighscore();
				this.showNewGame(this.userName !== null);
			} else {
		        this.showNewGame(false);
			}
		} else {
		  this.showNewGame(this.userName !== null);
        }
	},

	showHighscore: function() {
		var table;
		var i, la, lu, l;

        la = this.highscores.length;
        lu = this.user_highscores.length;
        l = Math.max(la, 1+lu);

		table = new Table(l, 3);
		table.setColumnOptions(1, {align:'right'});
		table.setColumnOptions(2, {align:'right'});

		table.setCell(0, 2, this.userName + ':');
		for (i=0; i<l; i++) {
            if (i < la) {
  			  table.setCell(i, 0, this.highscores[i].name);
			  table.setCell(i, 1, this.highscores[i].score);
            }
            if (i < lu) {
			  table.setCell(i+1, 2, this.user_highscores[i].score);
            }
		}
		this.clearOverlay();
		this.showTable(this.overlayCtx, 4, table);
		this.showOverlay();

		// 
		this.oldSel = -1;
		this.setupSelection([], []);
		this.showSelection();
	},
	showHighscore_old: function() {
		var table = new Table(this.highscores.length, 2);
		var i;

		table.setColumnOptions(1, {align:'right'});

		for (i=0; i<this.highscores.length; i++) {
			table.setCell(i, 0, this.highscores[i].name);
			table.setCell(i, 1, this.highscores[i].score);
		}
		this.clearOverlay();
		this.showTable(this.overlayCtx, 6, table);
		this.showOverlay();

		// 
		this.oldSel = -1;
		this.setupSelection([], []);
		this.showSelection();
	},
	clearOverlay: function() {
		this.overlayCtx.clearRect(0,0,this.width, this.height);
	},
	showOverlay: function() {
		this.overlayCanvas.setStyle('display', '');
		this.overlayCanvas.focus();
	},
	hideOverlay: function() {
		this.overlayCanvas.setStyle('display', 'none');
		this.ctx.canvas.focus();
	},
	// outline
	showSelection_1: function() {
		var y = this.selectionY + this.selectionH * this.curSel;
		this.ctx.strokeStyle = 'red';
		this.ctx.lineWidth = 4;
		this.ctx.strokeStyle = randomColor();
		this.ctx.strokeRect(this.selectionX, y, this.selectionW, this.selectionH);
	},
	// red text
	showSelection: function() {
		var x, y;
		this.selecting = true;
		if (!$defined(this.selectionText) || 0 === this.selectionText.length)  {
			return;
		}
		x = this.selectionX + this.selectionBD;
		if (-1 !== this.oldSel) {
			y = this.selectionY + this.selectionH * this.oldSel + this.selectionBD;
			this.showLine(this.overlayCtx, this.selectionSZ, this.selectionText[this.oldSel], x, y, {bg:'white'});
		}
		y = this.selectionY + this.selectionH * this.curSel + this.selectionBD;
		this.showLine(this.overlayCtx, this.selectionSZ, this.selectionText[this.curSel], x, y, {bg:'red'});
	},
	showGamePaused: function() {
		var text = [
			'paused',
			"press 'p' to continue"
		];
		this.showOverlayText(8, text);
	},
	showLine: function(ctx, sz, line, x, y, opt) {
		var font = this.fm.getFont(sz);
		font.writeLine(Colors.text, ctx, line, x, y, opt);
	},
	getTextBlockSize: function(sz, text, bds) {
		var bd = bds*sz;
		var line, i, h;
		var font = this.fm.getFont(sz);
		var w = 0;
		for (i=0; i<text.length; i++) {
			line = text[i];
            if (line) {
              w = Math.max(w, font.textWidth(line));
            }
		}
		w += 2*bd;
		h = (text.length-1)*sz*7 + sz*5;
		h += 2*bd;

		return {width:w, height:h};
	},
	showOverlayText: function(sz, text) {
		var i, line, yp, w, h, x, y, bd, font;
		this.overlayCtx.fillStyle = 'white';

		this.clearOverlay();

		var box = this.getTextBlockSize(sz, text, 2);
		w = box.width;
		h = box.height;
		bd = sz*2;
		
		font = this.fm.getFont(sz);

		x = (this.ctx.canvas.width - w) / 2;
		y = (this.ctx.canvas.height - h) / 2;
		yp = y;

		this.overlayCtx.fillRect(x-bd, y-bd, w, h);
		for (i=0; i<text.length; i++) {
			line = text[i];
			this.showLine(this.overlayCtx, sz, line, x, yp, null);
			yp += 7*sz;
		}

		this.selectionX = x-bd;
		this.selectionY = y-bd;
		this.selectionW = w;
		this.selectionH = 7*sz;
		this.selectionSZ = sz;
		this.selectionBD = bd;

		this.showOverlay();
	},

	showTable: function(ctx, sz, table) {
		var i, line, yp, w=0, h=0, colwidth = [], x, y, bd, font, box, opt, tx, ar;
		ctx.fillStyle = 'white';
		
		if (ctx === this.overlayCtx) {
			this.clearOverlay();
		}
		
		var w = 0;
		for (c=0; c<table.numColumns(); c++) {
			box = this.getTextBlockSize(sz, table.content[c], 2);
			colwidth.push(box.width);
			w += box.width;
		}
		h = box.height;
		bd = sz*2;
		
		font = this.fm.getFont(sz);

		x = (this.ctx.canvas.width - w) / 2;
		y = (this.ctx.canvas.height - h) / 2;

		ctx.fillRect(x-bd, y-bd, w, h);

		for (c=0; c<table.numColumns(); c++) {
			yp = y;
			opt = table.getColumnOptions(c);
			ar = opt && opt.align && opt.align === 'right';
			for (r=0; r<table.numRows(); r++) {
				line = table.getCell(r,c);
                if (line) {
    				tx = ar ? x + colwidth[c] - font.textWidth(line) - 2*bd : x;
	    			this.showLine(ctx, sz, line, tx, yp, null);
		    		yp += 7*sz;
                }
			}
			x += colwidth[c];
		}
		if (ctx === this.overlayCtx) {
			this.showOverlay();
		}
	},

	setupSelection: function(text, cb) {
		this.selectionText = text;
		this.selectionCB = cb;
		this.curSel = 0;
	},

	useSelection: function() {
		var fn;
		this.selecting = false;

		this.hideOverlay();

		if (this.selectionCB.length > 0) {
			fn = this.selectionCB[this.curSel];
			fn.apply(this);
		} else {
			this.start();
		}
	},
	toggleSound: function() {
		this.sounds.on = !this.sounds.on;
	},
	keydownMain: function(ev) {
		switch (ev.code) {
			case 37:
				this.left = true;
				break;
			case 39:
				this.right = true;
				break;
			case 32:
				if (!this.space) {
					this.space = true;
					if (!constantFire) {
						this.fire();
					}
				}
				break;
			case 83: // 's'
				this.toggleSound();
				break;
			case 80:
				switch (this.state) {
					case State.running:
						this.state = State.paused;
						break;
				}
				break;
			case 16:
				this.shift = true;
				break;
			default:
				;
		}
	},
	keyupMain: function(ev) {
		switch (ev.code) {
			case 37:
				this.left = false;
				break;
			case 39:
				this.right = false;
				break;
			case 32:
				this.space = false;
				break;
			case 16:
				this.shift = false;
				break;
			default:
		}
	},
    keydownOverlay: function(ev) {

      switch (ev.code) {
        case 38: // up
          if (this.state === State.gameOver) {
            this.changeSelection(-1);
          }
          break;
        case 40: // down
          if (this.state === State.gameOver) {
            this.changeSelection(1);
          }
          break;
        case 13:
          if (this.selecting) {
            this.useSelection();
          }
          break;
        case 83: // 's'
          this.toggleSound();
          break;
        case 80:
          switch (this.state) {
            case State.paused:
              this.state = State.running;
              this.unpause();
              break;
            case State.gameOver:
              this.start();
              break;
            case State.running:
              this.state = State.paused;
              break;
          }
          break;
        default:
          ;
      }
    },
	keyupOverlay: function(ev) {
		switch (ev.code) {
			default:
				;
		}
	},
	changeSelection: function(d) {
		if (!$defined(this.selectionText) || 0 === this.selectionText.length)  {
			return;
		}
		this.oldSel = this.curSel;
		this.curSel = clamp(this.curSel+d, 0, this.selectionText.length-1);
		this.showSelection();
	},


	createBlocks: function() {
		var i, x, y;
		var W = 25;
		var H = 20;
		this.block = [];
		for (i=0; i<4; i++) {
			this.block[i] = [];
			for (y=0; y<H; y++) {
				this.block[i][y] = [];
				for (x=0; x<W; x++) {
					this.block[i][y].push(true);
				}
			}
		}
	},
	drawBlocks: function() {
		var i, x, y, left, right, top, bottom;
		var KK = 2*K;
		bottom = 200 - 25;
		top = bottom - 20;
		var W = 25;
		var H = 20;
		this.ctx.fillStyle = Colors.block;
		for (i=0; i<4; i++) {
			left = i*50 + 12;
			right = left + 25;
			for (y=0; y<H; y++) {
				for (x=0; x<W; x++) {
					if (this.block[i][y][x]) {
						this.ctx.fillRect(KK*(left+x), KK*(top+y), KK, KK);
					}
				}
			}
		}
	},
	checkBlockHit: function(px, py) {
		px /= 2;
		py /= 2;
		var i, x, y, left, right, top, bottom, ii, jj, X, Y, Z=2;
		var KK = 2*K;
		bottom = 200 - 25;
		top = bottom - 20;
		var W = 25;
		var H = 20;

		if (py < top || py >= bottom) {
			return false;
		}

		for (i=0; i<4; i++) {
			left = i*50 + 12;
			right = left + 25;
			if (px < left || px > right) {
				continue;
			}

			x = Math.floor(px - left);
			y = Math.floor(py - top);
			try {
				if (this.block[i][y][x]) {
					for (jj=-Z; jj<=Z; jj++) {
						Y = jj+y;
						if (Y>=0 && Y<H) {
							for (ii=-Z; ii<=Z; ii++) {
								X = ii+x;
								if (X>=0 && X<W) {
									this.block[i][Y][X] = false;
								}
							}
						}
					}
					return true;
				}
			} catch (e) {
				// console.log(e);
			}
		}
		return false;
	}
});

function setupHiddenCursor(el) {
	var myTimer = null;
	var hideCursor = function() {
		el.setStyle('cursor', 'none');
	}

	hideCursor();

	el.addEvent('mousemove', function() {
		if (myTimer) {
	    	myTimer = $clear(myTimer);
		}
		el.setStyle('cursor', '');
	    myTimer = hideCursor.delay(3000);
	});
}

function startApp() {

	var parentDiv = $('app');
	parentDiv.innerHTML = '';

	//var controller = new Controller(parentDiv, 500, 500);
	var controller = new Controller(parentDiv, true, 500, 500);
	controller.clearHighscores();
	controller.start();
}

