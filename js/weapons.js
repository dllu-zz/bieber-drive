function Weapon(x,y) {
	// Spawns a grenade at position x, y
	this.x = x;
	this.y = y;

	// number of frames until it explodes
	this.t = 120;
	this.update = function() {
		this.t--;
	}
}