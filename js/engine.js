

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
            poly:VisibilityPolygon.compute([Engine.grenades[0].x, Engine.grenades[0].y], Engine.seg),
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

    // level up
    if(Engine.dist(Engine.player.x, Engine.player.y, Engine.goal.x, Engine.goal.y) < 5) {
        Engine.level(Engine.currentlevel+1);
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

    // load the images into the resource cache
    Engine.loadLevelImages(0);

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

Engine.loadLevelImages = function(n){
    Engine.resourceCache = {};
    function load(url){
        if (Engine.resourceCache[url]){
            return Engine.resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function(){
                Engine.resourceCache[url] = img;
            }
        }
        img.src = url;
    }
   // function get(url){
   //     return Engine.resourceCache[url];
   // }
    for (var k in images[n]){
        for (var orien in images[n][k]){
            load(images[n][k][orien]);
        }
    }
}


Engine.level = function(n) {
    // Level up to level n
    // resets the player, weapon, and all NPCs

    // check if game has been beaten
    if(n>=levels.length) {
        $('#announce').text("Win");
        Engine.$viewport.css({'display':'none'});
        Engine.running = false;
        return;
    }

    // pause the engine to indicate the level
    Engine.running = false;
    Engine.$viewport.css({'display':'none'});
    $('#level').text(n+1);
    window.setTimeout(function(){
        Engine.$viewport.css({'display':'block'});
        Engine.running = true;
    }, 2000);

    // set the current level
    Engine.currentlevel = n;

    // goal
    Engine.goal = {
        x:levels[n].goal[0],
        y:levels[n].goal[1]
    };

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
    switch (Engine.player.facing){
        case FACING_N:
            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.N], Engine.player.x, Engine.player.y);
        break;
        case FACING_E:
                    console.log("east,", Engine.player.y);

            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.E], Engine.player.x, Engine.player.y);
        break;
        case FACING_S:
            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.S], Engine.player.x, Engine.player.y);
        break;
        case FACING_W:
            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.W], Engine.player.x, Engine.player.y);
        break;
        case FACING_NE:
            Engine.ctx.save();
            Engine.ctx.translate(Engine.player.x, Engine.player.y);
            Engine.ctx.rotate(270);
            Engine.ctx.translate(-Engine.player.x, -Engine.player.y);
            var img = Engine.resourceCache[images[Engine.currentlevel].character.NE];
            Engine.ctx.drawImage(img, Engine.player.x, Engine.player.y);
            Engine.ctx.restore();
        break;
        case FACING_SE:
            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.SE], Engine.player.x, Engine.player.y);
        break;
        case FACING_SW:
            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.SW], Engine.player.x, Engine.player.y);
        break;
        case FACING_NW:
            Engine.ctx.drawImage(Engine.resourceCache[images[Engine.currentlevel].character.NW], Engine.player.x, Engine.player.y);
        break;
        default: console.log("MOTHERFUCKING GARBAGE PIECE OF HELL FUCKING SHIT");
    }
   // Engine.ctx.beginPath();
   // Engine.ctx.arc(Engine.player.x, Engine.player.y, 5, 0, Math.PI*2, true);
   // Engine.ctx.fillStyle = '#58f';
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
        if(!Engine.npc[i].alive && Engine.npc[i].deadness>60) continue;
        Engine.ctx.beginPath();
        Engine.ctx.arc(Engine.npc[i].x, Engine.npc[i].y, 5, 0, Math.PI*2, true);
        if(Engine.npc[i].alive) {
            Engine.ctx.fillStyle = '#f30';
        } else {
            Engine.ctx.fillStyle = 'rgba(0,0,0,' + (1-Engine.npc[i].deadness/60.0) +')';
        }
        Engine.ctx.fill();
    }

    // draw grenades
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        Engine.ctx.beginPath();
        Engine.ctx.arc(Engine.grenades[i].x, Engine.grenades[i].y, 3, 0, Math.PI*2, true);
        if(Engine.grenades[i].t%6<3) {
            Engine.ctx.fillStyle = '#f30';
        } else {
            Engine.ctx.fillStyle = '#58f';
        }
        Engine.ctx.fill();
    }

    // draw goal
    Engine.ctx.beginPath();
    Engine.ctx.arc(Engine.goal.x, Engine.goal.y, 5, 0, Math.PI*2, true);
    Engine.ctx.fillStyle = '#3f3';
    Engine.ctx.fill();
}

Engine.hitTest = function(x, y) {
    if(!VisibilityPolygon.inPolygon([x,y], Engine.poly[0])) return true;
    for(var i=1, _i=Engine.poly.length; i<_i; i++) {
        if(VisibilityPolygon.inPolygon([x,y], Engine.poly[i])) return true;
    }
    return false;
}

Engine.dist = function(ax, ay, bx, by) {
    return Math.sqrt((ax-=bx)*ax + (ay-=by)*ay);
}

Engine.randInt = function(lo, hi) {
	return ~~(Math.random() * (hi - lo + 1)) + lo;
}
