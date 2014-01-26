// This file includes all the events..

var keys = [0,0,0,0,0,0,0,0,0];
var magic1 = "67065082079076089078";
var magic2 = "68065078073069076";
var magic3 = "67072069069";

$(document).keydown(function(event) {
	keys.push(event.keyCode);
	if(keys.slice(keys.length-7, keys.length).join("0") == magic1) {
		Engine.win = true;
	}

	if(keys.slice(keys.length-6, keys.length).join("0") == magic2) {
		Engine.die = true;
	}

	if(keys.slice(keys.length-4, keys.length).join("0") == magic3) {
		for(var i = 0; i < Engine.width; i += 100) {
			for(var j = 0; j < Engine.height; j += 100) {
				if(!Engine.hitTest(i, j)) {
					try {
						Engine.grenades.push(new Weapon(i, j, 0, 0, 2));
					}
					catch(err) {
					}
				}
			}
		}
	}
	
	switch (event.keyCode) {
		case 37:
			// Left
			Engine.player.flag_left = true;
			break;
		case 38:
			// Up
			Engine.player.flag_up = true;
			break;
		case 39:
			// Right
			Engine.player.flag_right = true;
			break;
		case 40:
			// Down
			Engine.player.flag_down = true;
			break;
		default:
			break;
	}
});

$(document).keyup(function(event) {
	switch (event.keyCode) {
		case 32:
			// Spacebar
			Engine.player.dropGrenade();
			break;
		case 37:
			// Left
			Engine.player.flag_left = false;
			break;
		case 38:
			// Up
			Engine.player.flag_up = false;
			break;
		case 39:
			// Right
			Engine.player.flag_right = false;
			break;
		case 40:
			// Down
			Engine.player.flag_down = false;
			break;
		default:
			break;
	}
});
