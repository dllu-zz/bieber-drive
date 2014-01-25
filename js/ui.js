// This file includes all the events..

$(document).keydown(function(event) {
	switch (event.keyCode) {
		case 32:
			console.log("Spacebar was pressed!");
			break;
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
			console.log("Spacebar was released!");
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