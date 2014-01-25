// This file includes all the events..

$(document).keypress(function(event) {
	switch (event.keyCode) {
		case 32:
			console.log("Spacebar was pressed!");
			break;
		case 37:
			Engine.player.moveLeft();
			break;
		case 38:
			// Up
			Engine.player.moveUp();
			break;
		case 39:
			// Right
			Engine.player.moveRight();
			break;
		case 40:
			// Down
			Engine.player.moveDown();
			break;
		default:
			console.log("Key pressed: ", event);
			break;
	}
});
