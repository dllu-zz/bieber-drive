function Npc(x,y,a) {
	// spawns an NPC at position x, y with aggression level a
	this.x = x;
	this.y = y;
	this.speed = 1;
	this.xdir = Engine.randInt(-1, 1);
	this.ydir = Engine.randInt(-1, 1);
	if(Math.abs(this.xdir) + Math.abs(this.ydir) == 0) {
		this.xdir = 1;
	}
	this.aggression = a;
	this.alive = true;
	this.update = function() {

		var cspeed = Math.abs(this.xdir) + Math.abs(this.ydir) == 2 ? Math.sqrt(this.speed/2) : this.speed;
		var nx = this.x + cspeed * this.xdir;
		var ny = this.y + cspeed * this.ydir;
		
		if(Engine.hitTest(nx, ny)) {
			this.xdir = Engine.randInt(-1, 1);
			this.ydir = Engine.randInt(-1, 1);
			if(Math.abs(this.xdir) + Math.abs(this.ydir) == 0) {
				this.xdir = 1;
			}
		}
		else {
			this.x = nx;
			this.y = ny;
		}

	}
}
