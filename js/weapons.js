var WEAPON_SPEED = [1,10,0];

function Weapon(x,y,vx,vy,kind, who) {
	// Spawns a grenade at position x, y
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;

	// who -- 0: player; 1: npc
	this.who = who;

	// kind -- 0:grenade; 1:bullet; 2: still grenade
	this.kind = kind;

	this.active = true;
	if(this.kind === 0) {
		this.size = GRENADE_SIZE;
	} else if(this.kind === 1) {
		this.size = BULLET_SIZE;
	}

	// console.log("created a weapon",x,y,vx,vy,kind);

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