function Npc(x,y,a) {
    // spawns an NPC at position x, y with aggression level a
    this.x = x;
    this.y = y;
    this.size = SPRITE_SIZE;
    this.speed = 1;
    this.xdir = Engine.randInt(-1, 1);
    this.ydir = Engine.randInt(-1, 1);
    if(Math.abs(this.xdir) + Math.abs(this.ydir) == 0) {
        this.xdir = 1;
    }
    this.aggression = a;
    this.alive = true;
    this.deadness = 0;
    this.update = function() {
        if(this.alive) {
            var cspeed = Math.abs(this.xdir) + Math.abs(this.ydir) == 2 ? Math.sqrt(this.speed/2) : this.speed;
            var nx = this.x + cspeed * this.xdir * SPRITE_SPEED_MULTIPLIER;
            var ny = this.y + cspeed * this.ydir * SPRITE_SPEED_MULTIPLIER;
            
            if(Engine.hitWall(this, nx, ny)) {
                //console.log('NPC hit object at', nx, ny)
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

            if (Engine.hitObject(this, Engine.player)) {
            	Engine.player.onTouchEnemy();
            }
        } else if(this.deadness<60) {
            this.deadness++;
        }
    }
}
