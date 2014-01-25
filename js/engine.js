

var requestAnimFrame = 
    window.requestAnimFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback, element) { setTimeout(callback, 1000/60); };

$(document).ready(Engine.init)

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
    while(Engine.grenades[0].t <=0) {
        // compute explosion, remove grenade from the list
        var boom = {
            poly:VisibilityPolygon.compute([grenades[0].x, grenades[0].y], Engine.world),
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
    while(Engine.explosions[0].t <=0) {
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
    Engine.$viewport = $('#viewport');
    Engine.viewport = $viewport[0];
    Engine.ctx = viewport.getContext('2d');
    $viewport.css({'height':window.innerHeight+'px', 'width':window.innerWidth+'px'});

    Engine.player = new Player(0,0);
    Engine.level(0);
    Engine.update();
}

Engine.level = function(n) {
    // Level up to level n
    // resets the player, weapon, and all NPCs

    // set the current level
    Engine.currentlevel = n;

    // set the position of the player
    Engine.player.x = levels[n].start[0];
    Engine.player.y = levels[n].start[1];

    // clear the list of NPCs
    Engine.npc = []; // list of Npc objects
    for(var i=0, _i=levels[n].npc.length; i<_i; i++) {
        Engine.npc.push(new Npc(levels[n].npc[i][0], levels[n].npc[i][1], player.aggression));
    }

    // clear the list of grenades
    Engine.grenades = []; // list of Weapon objects

    // clear the list of explosions
    Engine.explosions = []; // list of objects {poly:[],t:int}, which are visibility polygons
}

Engine.draw = function() {
    Engine.ctx.beginPath();
    Engine.ctx.rect(0, 0, width, height);
    Engine.ctx.fillStyle = "#333";
    Engine.ctx.fill();
    // draw the player
    // draw each explosion
    // draw 
}

