

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

    // update the player
    Engine.player.update();

    // update each npc that is alive
    for(var i=0, _i=Engine.npc.length; i<_i; i++) {
        if(Engine.npc[i].alive) {
            Engine.npc[i].update();
        }
    }

    // update the grenades' fuse countdowns
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        Engine.grenades[i].update();
    }

    // update the countdown for the explosions
    // (since we want the explosions to stay on the screen for around 30 frames)
    for(var i=0, _i=Engine.explosions.length; i<_i; i++) {
        Engine.explosions[i].t--;
    }

    // for each exploding grenade, we have to make it explode and kill all NPCs in the vicinity
    while(Engine.grenades.length>0 && Engine.grenades[0].t <=0) {
        // compute explosion, remove grenade from the list
        var boom = {
            poly:VisibilityPolygon.compute([grenades[0].x, grenades[0].y], Engine.seg),
            t: 30
        }
        Engine.explosions.push(boom);
        Engine.grenades.shift();
        // kill all NPCs which are in the explosion
        for(var i=0, _i=Engine.npc.length; i<_i; i++) {
            if(Engine.npc[i].alive && VisibilityPolygon.inPolygon([Engine.npc[i].x, Engine.npc[i].y], boom.poly)) {
                Engine.npc[i].alive = false;
                Engine.player.aggression++;
            }
        }
        // TODO: kill player
    }

    // remove all expired explosions
    while(Engine.explosions.length>0 && Engine.explosions[0].t <=0) {
        Engine.explosions.shift();
    }
    /*
    // level up
    if(dist(Engine.player.x, Engine.player.y, Engine.goal.x, Engine.goal.y) < 30) {
        Engine.level(Engine.currentlevel+1);
    }
    */
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

    // set the current level
    Engine.currentlevel = n;

    // polygons
    Engine.poly = levels[n].poly;
    Engine.seg = VisibilityPolygon.convertToSegments(Engine.poly)

    // set the position of the player
    Engine.player.x = levels[n].start[0];
    Engine.player.y = levels[n].start[1];

    // clear the list of NPCs
    Engine.npc = []; // list of Npc objects
    for(var i=0, _i=levels[n].npc.length; i<_i; i++) {
        Engine.npc.push(new Npc(levels[n].npc[i][0], levels[n].npc[i][1], Engine.player.aggression));
    }

    // clear the list of grenades
    Engine.grenades = []; // list of Weapon objects

    // clear the list of explosions
    Engine.explosions = []; // list of objects {poly:[],t:int}, which are visibility polygons
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
    Engine.ctx.fillStyle = '#888';
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
    // draw the player
    Engine.ctx.beginPath();
    Engine.ctx.arc(Engine.player.x, Engine.player.y, 5, 0, Math.PI*2, true);
    Engine.ctx.fillStyle = '#58f';
    Engine.ctx.fill();

    // draw each explosion
    // draw 
}

Engine.hitTest = function(point, polygon) {
    return VisibilityPolygon.inPolygon(point, polygon);
}

Engine.dist = function(ax, ay, bx, by) {
    return Math.sqrt((ax-=bx)*ax + (ay-=by)*ay);
}

Engine.randInt = function(lo, hi) {
	return ~~(Math.random() * (hi - lo + 1)) + lo;
}
