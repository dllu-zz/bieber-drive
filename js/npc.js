function Npc(x,y,a) {
	// spawns an NPC at position x, y with aggression level a
	this.x = x;
	this.y = y;
	this.xdir = Engine.randInt(-1, 1);
	this.ydir = Engine.randInt(-1, 1);
	this.aggression = a;
	this.alive = true;
	this.update = function() {

		

	}
}
