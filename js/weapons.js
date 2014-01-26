var WEAPON_SPEED = [1,10];

function Weapon(x,y,vx,vy,kind) {
	// Spawns a grenade at position x, y
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;

	// kind -- 0:grenade; 1:bullet
	this.kind = kind;

	this.active = true;

	console.log("created a weapon",x,y,vx,vy,kind);

	// number of frames until it explodes
	this.t = 120;
	this.update = function() {
		this.t--;
		var speed = WEAPON_SPEED[this.kind];
		if(Engine.hitTest(this.x+speed*this.vx, this.y+speed*this.vy)) {
			console.log('Weapon of kind', this.kind, 'hit the wall');
			this.t=0;
		} else {
			this.x += speed*this.vx;
			this.y += speed*this.vy;
		}
	}
}