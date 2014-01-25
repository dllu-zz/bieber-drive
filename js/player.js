// Constants
var FACING_UP = 0;
var FACING_RIGHT = 1;
var FACING_DOWN = 2;
var FACING_LEFT = 3;

function Player(x,y) {
	// Spawns a Player at x,y
	this.x = x;
	this.y = y;
	this.aggression = 0;
	this.lives = 3;
	this.facing = FACING_RIGHT;
	this.update = function() {

	}
	this.moveRight = function() {
		this.facing = FACING_RIGHT;
		this.x += 2;
	}
	this.moveLeft = function() {
		this.facing = FACING_LEFT;
		this.x -= 2;
	}
	this.moveUp = function() {
		this.facing = FACING_UP;
		this.y -= 2;
	}
	this.moveDown = function() {
		this.facing = FACING_DOWN;
		this.y += 2;
	}
}
