
var SPRITE_SIZE = 8;
var GRENADE_SIZE = 5;
var BULLET_SIZE = 2;
var SPRITE_SPEED_MULTIPLIER = 2;
var PARTICLE_SIZE = 3;

var requestAnimFrame = 
    window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback, element) { setTimeout(callback, 1000/60); };

$(document).ready(function() {
    var texts = ["It is the end of days,<br>my Fallen Child...", "Now, I send you to walk the road to salvation."];
    Engine.showMessage(0, texts, function() {
        $('#announce').css({'display': 'block'});
        $('#player').css({'display': 'block'});
        $('#viewport').css({'display': 'block'});
        $('#bottom-ui').css({'display': 'block'});
        Engine.init();
    });
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

    // update the countdown for the explosions
    // (since we want the explosions to stay on the screen for around 30 frames)
    for(var i=0, _i=Engine.explosions.length; i<_i; i++) {
        Engine.explosions[i].t--;
    }

    // update bullet trajectories
    for(var i=0, _i=Engine.bullets.length; i<_i; i++) {
        if(!Engine.bullets[i].active) continue;
        var ax = Engine.bullets[i].x, ay = Engine.bullets[i].y;
        Engine.bullets[i].update();
        if(Engine.bullets[i].t<=0) {
            Engine.bullets[i].active = false;
        } else if(Engine.bullets[i].who===0) {
            // for bullets fired by the player, check for collision with enemy
            var bx = Engine.bullets[i].x, by = Engine.bullets[i].y;
            for(var j=0; j<=10; j++) {
                var x = (ax*j+bx*(10-j))/10, y = (ay*j+by*(10-j))/10;
                for(var k=0, _k=Engine.npc.length; k<_k; k++) {
                    if(Engine.npc[k].alive && Engine.dist(x,y,Engine.npc[k].x, Engine.npc[k].y) < BULLET_SIZE+SPRITE_SIZE) {
                        Engine.npc[k].alive = false;
                        Engine.player.aggression++;
                        Engine.player.killz++;
                        Engine.bullets[i].active = false;
                        j=999;
                        break;
                    }
                }
            }
        } else {
            // for bullets fired by the NPCs, check for collision with player
            var bx = Engine.bullets[i].x, by = Engine.bullets[i].y;
            for(var j=0; j<=10; j++) {
                var x = (ax*j+bx*(10-j))/10, y = (ay*j+by*(10-j))/10;
                if(Engine.dist(x,y,Engine.player.x, Engine.player.y) < BULLET_SIZE+SPRITE_SIZE) {
                    Engine.player.onTouchBullet();
                    Engine.bullets[i].active = false;
                    break;
                }
            }
        }
    }    
    // remove all expired bullets
    while(Engine.bullets.length>0 && !Engine.bullets[0].active) {
        Engine.bullets.shift();
    }

    // update the grenades' fuse countdowns
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        if(!Engine.grenades[i].active) continue;
        Engine.grenades[i].update();

        // for each exploding grenade, we have to make it explode and kill all NPCs in the vicinity
        if(Engine.grenades[i].t>0) continue;

        // compute explosion, remove grenade from the list
        var boom = {
            poly:VisibilityPolygon.compute([Engine.grenades[i].x, Engine.grenades[i].y], Engine.seg),
            t: 30
        }
        Engine.explosions.push(boom);
        // kill all NPCs which are in the explosion
        for(var j=0, _j=Engine.npc.length; j<_j; j++) {
            if(Engine.npc[j].alive && VisibilityPolygon.inPolygon([Engine.npc[j].x, Engine.npc[j].y], Engine.explosions[i].poly)) {
                Engine.npc[j].stunned = 200;
                Engine.player.aggression+=0.1;
            }
        }
        // Remove health of player
        if (VisibilityPolygon.inPolygon([Engine.player.x, Engine.player.y], Engine.explosions[i].poly))
            Engine.player.onTouchExplosion();

        Engine.grenades[i].active = false;
    }

    // remove all expired grenades
    while(Engine.grenades.length>0 && !Engine.grenades[0].active) {
        Engine.grenades.shift();
    }

    // remove all expired explosions
    while(Engine.explosions.length>0 && Engine.explosions[0].t <=0) {
        Engine.explosions.shift();
    }

    // level up
    if(Engine.dist(Engine.player.x, Engine.player.y, Engine.goal.x, Engine.goal.y) < 2*SPRITE_SIZE || Engine.win) {
        Engine.level(Engine.currentlevel+1);
        Engine.win = false;
    }
    Engine.los = VisibilityPolygon.compute([Engine.player.x, Engine.player.y], Engine.seg);
    if (levels[Engine.currentlevel].title === "Triumph"){
        Engine.draw(100); 
    }
    else Engine.draw(34);
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

Engine.showMessage = function (i, texts, callback) {
    //Engine.$viewport.css({'display':'none'});
    //Engine.$player.css({'display':'none'});
    Engine.running = false;
    $('#message').css({'display': 'block'});
    $('#announce').css({'display': 'none'});
    $('#player').css({'display': 'none'});
    $('#viewport').css({'display': 'none'});
    $('#bottom-ui').css({'display': 'none'});

    if (i < texts.length) {
        $('#message').html(texts[i]);
        setTimeout(function() {
            Engine.showMessage(i+1, texts, callback);
        }, 3000);
    }
    else {
        setTimeout(function() {
            $('#message').css({'display': 'none'});
            //$('#bottom-ui').css({'display': 'block'});
            callback();
         }, 3000);
    }
    /*window.setTimeout(function(){
        Engine.$viewport.css({'display':'block'});
        Engine.$player.css({'display':'block'});
        Engine.running = true;
    }, 3400);*/
}


Engine.level = function(n) {
    // Level up to level n
    // resets the player, weapon, and all NPCs

    $("#announce").css({'display': 'block'});
    // check if game has been beaten
    if(n>=levels.length) {
        //$('#announce').text("win");
        Engine.$viewport.css({'display':'none'});
        Engine.$player.css({'display':'none'});
        Engine.running = false;
        Engine.showMessage(0,["In the end, the only person who can save you...", "... is yourself...", "You have found salvation."],function(){Engine.running = false;});
        return;
    }

    // check if user has lost
    if(Engine.die) {
        /*$('#announce').text('Welcome to the end');*/
        Engine.$viewport.css({'display':'none'});
        Engine.$player.css({'display':'none'});
        Engine.running = false;
        Engine.showMessage(0,["Welcome to the end...", "GAME OVER"],function(){Engine.running = false;});
        return;
    }

    // pause the engine to indicate the level
    Engine.running = false;
    Engine.$viewport.css({'display':'none'});
    Engine.$player.css({'display':'none'});

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
    }, 3400);

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

    // clear line of sight;
    Engine.los = undefined;

    // clear the list of NPCs
    Engine.npc = []; // list of Npc objects

    // clear the list of bullets
    Engine.bullets = [];

    // clear the list of grenades
    Engine.grenades = []; // list of Weapon objects

    // clear the list of explosions
    Engine.explosions = []; // list of objects {poly:[],t:int}, which are visibility polygons

    // compute hit region by drawing the polygons and checking which pixels are 34
    Engine.draw(40);
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

    // player visibility
    Engine.los = VisibilityPolygon.compute([Engine.player.x, Engine.player.y], Engine.seg);
}

Engine.draw = function(bg) {
    Engine.ctx.beginPath();
    Engine.ctx.rect(0, 0, Engine.width, Engine.height);
    Engine.ctx.fillStyle = '#222';
    Engine.ctx.fill();
    if(bg !== 34) {
        // draw the world
        // draw the first polygon
        var polygon = Engine.poly[0];
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(polygon[0][0], polygon[0][1]);
        for(var k=1, l=polygon.length; k<l; k++) {
            Engine.ctx.lineTo(polygon[k][0], polygon[k][1]);
        }
        Engine.ctx.fillStyle = 'rgb('+bg+','+bg+','+bg+')';
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
    }
    // draw line of sight
    if(Engine.los) {
        var polygon = Engine.los;
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(polygon[0][0], polygon[0][1]);
        for(var k=1, l=polygon.length; k<l; k++) {
            Engine.ctx.lineTo(polygon[k][0], polygon[k][1]);
        }
        Engine.ctx.fillStyle = '#ccc';
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
    // Engine.ctx.fillStyle = 'rgb(34,34,34)';
    // Engine.ctx.fill();

    // draw explosions
    for(var i=0, _i=Engine.explosions.length; i<_i; i++) {
        var polygon = Engine.explosions[i].poly;
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(polygon[0][0], polygon[0][1]);
        for(var k=1, l=polygon.length; k<l; k++) {
            Engine.ctx.lineTo(polygon[k][0], polygon[k][1]);
        }
        Engine.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        Engine.ctx.fill();
    }

    // draw goal
    if(Engine.los && Engine.visible(Engine.goal.x, Engine.goal.y)) {
        Engine.ctx.beginPath();
        Engine.ctx.rect(Engine.goal.x-SPRITE_SIZE+2, Engine.goal.y-SPRITE_SIZE+2, 2*SPRITE_SIZE-4, 2*SPRITE_SIZE-4);
        Engine.ctx.fillStyle = '#888';
        Engine.ctx.fill();
        Engine.ctx.strokeStyle = '#000';
        Engine.ctx.lineWidth = 1;
        Engine.ctx.stroke();
    }

    // draw npcs
    for(var i=0, _i=Engine.npc.length; i<_i; i++) {
        if(!Engine.npc[i].alive && Engine.npc[i].deadness>=60) continue;
        var npc = Engine.npc[i];
        if(npc.alive && (Engine.visible2(npc) || npc.stunned>0)) {
            Engine.ctx.beginPath();
            Engine.ctx.arc(npc.x, npc.y, SPRITE_SIZE, 0, Math.PI*2, true);
            Engine.ctx.fillStyle = 'rgb(34,34,34)';
            if(npc.stunned>0 && npc.stunned%6<3) {
                Engine.ctx.fillStyle = '#444';
            }
            Engine.ctx.fill();
        } else if(!npc.alive) {
            for(var j=0, _j=npc.deadparticles.length; j<_j; j++) {
                var d = npc.deadness, dd = 1.5*Math.sqrt(d)+0.1*d;
                Engine.ctx.beginPath();
                Engine.ctx.arc(
                    npc.x+npc.deadparticles[j][0]*dd, 
                    npc.y+npc.deadparticles[j][1]*dd, 
                    SPRITE_SIZE*(60-d)/60, 0, Math.PI*2, true);
                Engine.ctx.fillStyle = 'rgba(34,34,34,' + (1-npc.deadness/60.0) +')';
                Engine.ctx.fill();
            }
        }
    }

    // draw grenades
    for(var i=0, _i=Engine.grenades.length; i<_i; i++) {
        if(!Engine.grenades[i].active) continue;
        Engine.ctx.beginPath();
        Engine.ctx.arc(Engine.grenades[i].x, Engine.grenades[i].y, GRENADE_SIZE, 0, Math.PI*2, true);
        if(Engine.grenades[i].t%6<2) {
            Engine.ctx.fillStyle = '#fff';
        } else {
            Engine.ctx.fillStyle = '#000';
        }
        Engine.ctx.fill();
    }

    // draw bullets
    for(var i=0, _i=Engine.bullets.length; i<_i; i++) {
        if(!Engine.bullets[i].active || !Engine.visible(Engine.bullets[i].x, Engine.bullets[i].y)) continue;
        Engine.ctx.beginPath();
        Engine.ctx.arc(Engine.bullets[i].x, Engine.bullets[i].y, BULLET_SIZE, 0, Math.PI*2, true);
        if(Engine.bullets[i].who===0) {
            Engine.ctx.fillStyle = '#000';
        } else {
            Engine.ctx.fillStyle = 'rgb(34,34,34)';
        }
        Engine.ctx.fill();
    }

    var s = '';
    for(var i=0; i<Engine.player.lives; i++) {
        s += '♥'
    }
    $("#lives").html(s);
    //$("#health").html("Health: " + Engine.player.health.toFixed(1));
    $('#healthbar').css({'width': (Engine.player.health/PLAYER_MAX_HEALTH*850)+'px'})
    $("#killz").html(Engine.player.killz);
}

Engine.visible = function(x, y) {
    return VisibilityPolygon.inPolygon([x,y],Engine.los);
}

Engine.visible2 = function(obj) {
    var x = obj.x, y = obj.y;
    for (var i = 0; i < 10; i++) {
        var theta = i * Math.PI / 5;
        var dx = obj.size * Math.cos(theta);
        var dy = obj.size * Math.sin(theta);
        if (VisibilityPolygon.inPolygon([x + dx, y + dy], Engine.los)) {
            //console.log('hit wall', x, y, obj.size, x+dx, x+dy, dx, dy)
            return true;
        }
    }
    return false;
}

Engine.hitTest = function(x, y) {
    x=Math.round(2*x);
    y=Math.round(2*y);
    // console.log(x, y, Engine.imdata[4*(y*2*Engine.width+x)]);
    return Engine.imdata[4*(y*2*Engine.width+x)]!=40;
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
    return Engine.dist(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.size + obj2.size;
}

Engine.dist = function(ax, ay, bx, by) {
    return Math.sqrt((ax-=bx)*ax + (ay-=by)*ay);
}

Engine.randInt = function(lo, hi) {
    return ~~(Math.random() * (hi - lo + 1)) + lo;
}

Engine.win = false;
Engine.die = false;
