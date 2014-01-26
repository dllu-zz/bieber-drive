function Weapon(x,y, kind) {
	// Spawns a grenade at position x, y
	this.x = x;
	this.y = y;
	// kind -- 0:grenade; 1:bullet
	this.kind = kind;

	this.active = true;

	console.log("created a weapon");

	// number of frames until it explodes
	this.t = 120;
	this.update = function() {
		this.t--;
		if(Engine.hitTest(this.x, this.y)) {
			this.t=0;
		}
	}
}