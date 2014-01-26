function Weapon(x,y) {
	// Spawns a grenade at position x, y
	this.x = x;
	this.y = y;

	console.log("created a weapon");

	// number of frames until it explodes
	this.t = 120;
	this.update = function() {
		this.t--;
	}
}