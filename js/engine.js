

var requestAnimFrame = 
    window.requestAnimFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback, element) { setTimeout(callback, 1000/60); };

$(document).ready(Engine.init)

function Engine(){}

Engine.update = function() {
    requestAnimFrame(Engine.update);
    Engine.player.update();
    for(var i=0, _i=Engine.npc.length; i<_i; i++) {
        Engine.npc[i].update();
    }
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        Engine.grenades[i].update();
    }
    while(Engine.grenades[0].t <=0) {
        // compute explosion, remove grenade from the list
        Engine.explosions.push(VisibilityPolygon.compute([grenades[0].x, grenades[0].y], Engine.world))
        Engine.grenades.shift();
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
    $('#viewport').css({'height':window.innerHeight+'px', 'width':window.innerWidth+'px'});
    Engine.level(0);
    Engine.update();
}

Engine.level = function(n) {
    // Level up to level n
    // resets the player, weapon, and all NPCs
    Engine.currentlevel = n;
    Engine.player = new Player();
    Engine.npc = []; // list of Npc objects
    Engine.grenades = []; // list of Weapon objects
    Engine.explosions = []; // list of polygons
}

Engine.draw = function() {
    // 
    // draws the player

}

