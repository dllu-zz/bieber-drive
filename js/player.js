// Constants
var FACING_N = 0;
var FACING_E = 1;
var FACING_S = 2;
var FACING_W = 3;
var FACING_NE = 4;
var FACING_SE = 5;
var FACING_SW = 6;
var FACING_NW = 7;

function Player(x,y) {
    // Spawns a Player at x,y
    this.x = x;
    this.y = y;
    this.size = SPRITE_SIZE;
    this.aggression = 0;
    this.lives = 3;
    this.facing = FACING_E;

    this.flag_up = false;
    this.flag_down = false;
    this.flag_right = false;
    this.flag_left = false;

    this.dropGrenade = function() {
        Engine.grenades.push(new Weapon(this.x, this.y));
    }

    this.update = function() {
        var vert = (this.flag_up && !this.flag_down) || (!this.flag_up && this.flag_down);
        var horz = (this.flag_left && !this.flag_right) || (!this.flag_left && this.flag_right);
        var nx = 0;
        var ny = 0;

        if (vert)
            ny = SPRITE_SPEED_MULTIPLIER * ((this.flag_up ? -1 : 1) * (horz ? Math.sqrt(0.5) : 1));
        if (horz)
            nx = SPRITE_SPEED_MULTIPLIER * ((this.flag_left ? -1 : 1) * (vert ? Math.sqrt(0.5) : 1));

        if (!Engine.hitWall(this, this.x + nx, this.y + ny)) {
            this.x += nx;
            this.y += ny;
            if (nx > 0) {
                if (ny > 0)
                    this.facing = FACING_SE;
                else if (ny < 0)
                    this.facing = FACING_NE;
                else
                    this.facing = FACING_E;
            } else if (nx < 0) {
                if (ny > 0)
                    this.facing = FACING_SW;
                else if (ny < 0)
                    this.facing = FACING_NW;
                else
                    this.facing = FACING_W;
            } else {
                if (ny > 0)
                    this.facing = FACING_S;
                else if (ny < 0)
                    this.facing = FACING_N;
            }
        }
    }
}
