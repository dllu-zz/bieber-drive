
var SPRITE_SIZE = 5;
var GRENADE_SIZE = 3;
var BULLET_SIZE = 1;
var SPRITE_SPEED_MULTIPLIER = 2;

var requestAnimFrame = 
    window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback, element) { setTimeout(callback, 1000/60); };

$(document).ready(function() {
    Engine.init()
});

function Engine(){}

Engine.update = function() {
    // request the next update cycle
    requestAnimFrame(Engine.update);
    // check if engine is running
    if(!Engine.running) return;
    // update the player
    Engine.player.update();

    // update each npc that is alive
    for(var i=0, _i=Engine.npc.length; i<_i; i++) {
        Engine.npc[i].update();
    }

    // update the grenades' fuse countdowns
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        if(!Engine.grenades[i].active) continue;
        Engine.grenades[i].update();

        // for each exploding grenade, we have to make it explode and kill all NPCs in the vicinity
        if(Engine.grenades[i].t>0) continue;

        // compute explosion, remove grenade from the list
        var boom = {
            poly:VisibilityPolygon.compute([Engine.grenades[0].x, Engine.grenades[0].y], Engine.seg),
            t: 30
        }
        Engine.explosions.push(boom);
        // kill all NPCs which are in the explosion
        for(var j=0, _j=Engine.npc.length; j<_j; j++) {
            if(Engine.npc[j].alive && VisibilityPolygon.inPolygon([Engine.npc[j].x, Engine.npc[j].y], Engine.explosions[i].poly)) {
                Engine.npc[j].alive = false;
                Engine.player.aggression++;
            }
        }
        // Remove health of player
        if (VisibilityPolygon.inPolygon([Engine.player.x, Engine.player.y], Engine.explosions[i].poly))
            Engine.player.onTouchExplosion();

        Engine.grenades[i].active = false;
    }

    // update the countdown for the explosions
    // (since we want the explosions to stay on the screen for around 30 frames)
    for(var i=0, _i=Engine.explosions.length; i<_i; i++) {
        Engine.explosions[i].t--;
    }

    // remove all expired weapons
    while(Engine.grenades.length>0 && !Engine.grenades[0].active) {
        Engine.grenades.shift();
    }

    // remove all expired explosions
    while(Engine.explosions.length>0 && Engine.explosions[0].t <=0) {
        Engine.explosions.shift();
    }

    // level up
    if(Engine.dist(Engine.player.x, Engine.player.y, Engine.goal.x, Engine.goal.y) < 5 || Engine.win) {
        Engine.level(Engine.currentlevel+1);
        Engine.win = false;
    }

    Engine.draw();
}

Engine.init = function() {
    // set up the canvas
    Engine.$viewport = $('#viewport');
    Engine.viewport = Engine.$viewport[0];
    Engine.ctx = viewport.getContext('2d');
    Engine.width = 1000;
    Engine.height = 600;

    /* I treat all devices as being Hi-DPI (i.e. a pixel ratio of 2)
    because even on normal displays, this looks better as it is like
    anti-aliasing. */
    Engine.viewport.width = Engine.width * 2;
    Engine.viewport.height = Engine.height * 2;

    Engine.viewport.style.width = Engine.width + 'px';
    Engine.viewport.style.height = Engine.height + 'px';
    Engine.ctx.scale(2, 2);

    // get player element
    Engine.$player = $('#player');

    // set up the new player
    Engine.player = new Player(0,0);

    // initialize first level
    Engine.level(0);

    // start the updates
    Engine.update();
}


Engine.level = function(n) {
    // Level up to level n
    // resets the player, weapon, and all NPCs

    // check if game has been beaten
    if(n>=levels.length) {
        $('#announce').text("Win");
        Engine.$viewport.css({'display':'none'});
        Engine.$player.css({'display':'none'});
        Engine.running = false;
        return;
    }

    // pause the engine to indicate the level
    Engine.running = false;
    Engine.$viewport.css({'display':'none'});

    var level_text = "Level " + (n+1);
    if ("title" in levels[n]) {
        level_text = levels[n].title;
    }
    $('#announce').text(level_text);
    //$('#level').text(n+1);
    window.setTimeout(function(){
        Engine.$viewport.css({'display':'block'});
        Engine.$player.css({'display':'block'});
        Engine.running = true;
    }, 2000);

    // set the current level
    Engine.currentlevel = n;

    // polygons
    Engine.poly = levels[n].poly;
    Engine.seg = VisibilityPolygon.convertToSegments(Engine.poly)

    // clear goal
    Engine.goal = {
        x:-10,
        y:-10
    };

    // set the position of the player
    Engine.player.x = levels[n].start[0];
    Engine.player.y = levels[n].start[1];

    // clear the list of NPCs
    Engine.npc = []; // list of Npc objects

    // clear the list of grenades
    Engine.grenades = []; // list of Weapon objects

    // clear the list of explosions
    Engine.explosions = []; // list of objects {poly:[],t:int}, which are visibility polygons

    // compute hit region by drawing the polygons and checking which pixels are 200
    Engine.draw();
    Engine.imdata = Engine.ctx.getImageData(0, 0, 2*Engine.width, 2*Engine.height).data;

    // insert NPCs
    for(var i=0, _i=levels[n].npc.length; i<_i; i++) {
        Engine.npc.push(new Npc(levels[n].npc[i][0], levels[n].npc[i][1], Engine.player.aggression));
    }

    // goal
    Engine.goal = {
        x:levels[n].goal[0],
        y:levels[n].goal[1]
    };
}

Engine.draw = function() {
    Engine.ctx.beginPath();
    Engine.ctx.rect(0, 0, Engine.width, Engine.height);
    Engine.ctx.fillStyle = '#222';
    Engine.ctx.fill();
    // draw the world
    // draw the first polygon
    var polygon = Engine.poly[0];
    Engine.ctx.beginPath();
    Engine.ctx.moveTo(polygon[0][0], polygon[0][1]);
    for(var k=1, l=polygon.length; k<l; k++) {
        Engine.ctx.lineTo(polygon[k][0], polygon[k][1]);
    }
    Engine.ctx.fillStyle = 'rgb(200,200,200)';
    Engine.ctx.fill();
    // draw the other polygons
    for(var i=1, j=Engine.poly.length; i<j; i++) {
        var polygon = Engine.poly[i];
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(polygon[0][0], polygon[0][1]);
        for(var k=1, l=polygon.length; k<l; k++) {
            Engine.ctx.lineTo(polygon[k][0], polygon[k][1]);
        }
        Engine.ctx.fillStyle = '#222';
        Engine.ctx.fill();
    }

    function renderPlayer(direction, angle){
        Engine.$player.css({
            'top':(Engine.player.y-Engine.$player.height()/2)+'px',
            'left':(Engine.player.x-Engine.$player.width()/2)+'px',
            'transform':'rotate('+angle+'deg)'
        });
        if(!direction) {
            Engine.$player.removeClass('R');
        } else {
            Engine.$player.addClass('R');
        }
    }
    // draw the player
    switch (Engine.player.facing) {
        case FACING_N:
            renderPlayer(true, -90);
        break;
        case FACING_E:
            renderPlayer(true, 0);
        break;
        case FACING_S:
            renderPlayer(false, -90);
        break;
        case FACING_W:
            renderPlayer(false, 0);
        break;
        case FACING_NE:
            renderPlayer(true, -45);
        break;
        case FACING_SE:
            renderPlayer(true, 45);
        break;
        case FACING_SW:
            renderPlayer(false, -45);
        break;
        case FACING_NW:
            renderPlayer(false, 45);
        break;
        default: console.log("MOTHERFUCKING GARBAGE PIECE OF HELL FUCKING SHIT");
    }
    // Engine.ctx.beginPath();
    // Engine.ctx.arc(Engine.player.x, Engine.player.y, SPRITE_SIZE, 0, Math.PI*2, true);
    // Engine.ctx.fillStyle = '#f30';
    // Engine.ctx.fill();

    // draw explosions
    for(var i=0, _i=Engine.explosions.length; i<_i; i++) {
        var polygon = Engine.explosions[i].poly;
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(polygon[0][0], polygon[0][1]);
        for(var k=1, l=polygon.length; k<l; k++) {
            Engine.ctx.lineTo(polygon[k][0], polygon[k][1]);
        }
        Engine.ctx.fillStyle = 'rgba(255,230,0,0.3)';
        Engine.ctx.fill();
    }

    // draw npcs
    for(var i=0, _i=Engine.npc.length; i<_i; i++) {
        if(!Engine.npc[i].alive && Engine.npc[i].deadness>=60) continue;
        Engine.ctx.beginPath();
        Engine.ctx.arc(Engine.npc[i].x, Engine.npc[i].y, SPRITE_SIZE, 0, Math.PI*2, true);
        if(Engine.npc[i].alive) {
            Engine.ctx.fillStyle = '#f30';
        } else {
            Engine.ctx.fillStyle = 'rgba(0,0,0,' + (1-Engine.npc[i].deadness/60.0) +')';
        }
        Engine.ctx.fill();
        Engine.ctx.strokeStyle = '#000';
        Engine.ctx.strokeWidth = '1px';
        Engine.ctx.stroke();
    }

    // draw grenades
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        if(!Engine.grenades[i].active) continue;
        Engine.ctx.beginPath();
        Engine.ctx.arc(Engine.grenades[i].x, Engine.grenades[i].y, GRENADE_SIZE, 0, Math.PI*2, true);
        if(Engine.grenades[i].t%6<3) {
            Engine.ctx.fillStyle = '#f00';
        } else {
            Engine.ctx.fillStyle = '#00f';
        }
        Engine.ctx.fill();
    }

    // draw goal
    Engine.ctx.beginPath();
    Engine.ctx.arc(Engine.goal.x, Engine.goal.y, SPRITE_SIZE, 0, Math.PI*2, true);
    Engine.ctx.fillStyle = '#3f3';
    Engine.ctx.fill();
    Engine.ctx.strokeStyle = '#000';
    Engine.ctx.strokeWidth = '1px';
    Engine.ctx.stroke();

    $("#lives").html("Lives: " + Engine.player.lives);
    $("#health").html("Health: " + Engine.player.health.toFixed(1));
}

Engine.hitTest = function(x, y) {
    x=Math.round(2*x);
    y=Math.round(2*y);
    // console.log(x, y, Engine.imdata[4*(y*2*Engine.width+x)]);
    return Engine.imdata[4*(y*2*Engine.width+x)]!=200;
}

Engine.hitWall = function(obj, x, y) {
    for (var i = 0; i < 10; i++) {
        var theta = i * Math.PI / 5;
        var dx = obj.size * Math.cos(theta);
        var dy = obj.size * Math.sin(theta);
        if (Engine.hitTest(x + dx, y + dy)) {
            //console.log('hit wall', x, y, obj.size, x+dx, x+dy, dx, dy)
            return true;
        }
    }
    return false;
}

Engine.hitObject = function(obj1, obj2) {
    var dx = obj1.x - obj2.x;
    var dy = obj1.y - obj2.y;
    return Math.sqrt((dx * dx) + (dy * dy)) < obj1.size + obj2.size;
}

Engine.dist = function(ax, ay, bx, by) {
    return Math.sqrt((ax-=bx)*ax + (ay-=by)*ay);
}

Engine.randInt = function(lo, hi) {
    return ~~(Math.random() * (hi - lo + 1)) + lo;
}

Engine.win = false;
Engine.die = false;
