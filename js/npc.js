function Npc(x,y,a) {
    // spawns an NPC at position x, y with aggression level a
    this.x = x;
    this.y = y;
    this.size = SPRITE_SIZE;
    this.speed = 1;
    this.xdir = Engine.randInt(-1, 1);
    this.ydir = Engine.randInt(-1, 1);
    while(Math.abs(this.xdir) + Math.abs(this.ydir) == 0) {
        this.xdir = Engine.randInt(-1, 1);
        this.ydir = Engine.randInt(-1, 1);
    }
    this.aggression = a;
    this.alive = true;
    this.deadness = 0;
    this.deadparticles = [];
    for(var i=0; i<5; i++) {
        var r = Math.random();
        var t = Math.random()*2*Math.PI;
        this.deadparticles.push([r*Math.sin(t), r*Math.cos(t)]);
    }
    this.openFire = function() {
        this.shooting = true;
    }

    this.ceaseFire = function() {
        this.shooting = false;
    }

    this.shoot = function() {
        var norm = Engine.dist(this.xdir, this.ydir, 0,0);
        Engine.bullets.push(new Weapon(this.x, this.y, this.xdir/norm, this.ydir/norm, 1, 1));
        this.shoot_cooldown = 10;
    }
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
            } else {
                this.x = nx;
                this.y = ny;
            }

            if (Engine.hitObject(this, Engine.player)) {
                Engine.player.onTouchEnemy();
            }
            if(this.shoot_cooldown>0) {
                this.shoot_cooldown--;
            } else if(this.shooting) {
                this.shoot();
                if(Math.random()*30<10) { // fire an expected 3 shots
                    this.ceaseFire();
                }
            } else {
                if(Math.random()*50<this.aggression/60) {
                    this.openFire();
                }
            }
        } else if(this.deadness<60) {
            this.deadness++;
        }
    }
}
