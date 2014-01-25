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

	this.flag_up = false;
	this.flag_down = false;
	this.flag_right = false;
	this.flag_left = false;

	this.update = function() {
		// NEED TO DETECT FOR COLLISIONS
		var vert = (this.flag_up && !this.flag_down) || (!this.flag_up && this.flag_down);
		var horz = (this.flag_left && !this.flag_right) || (!this.flag_left && this.flag_right);
		var nx, ny;

		if (vert)
			ny = this.y + ((this.flag_up ? -1 : 1) * (horz ? Math.sqrt(0.5) : 1));
		else
			ny = this.y;

		if (horz)
			nx = this.x + ((this.flag_left ? -1 : 1) * (vert ? Math.sqrt(0.5) : 1));
		else
			nx = this.x;

		if (!Engine.hitTest(nx, ny)) {
			this.x = nx;
			this.y = ny;
		}
	}
}
