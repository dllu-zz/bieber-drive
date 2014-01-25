

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
        if(Engine.grenades[i].t <=0) {
            // compute explosion, remove grenade from the list
        }
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
    Engine.npc = [];
    Engine.grenades = [];
}

Engine.draw = function() {
    
}

