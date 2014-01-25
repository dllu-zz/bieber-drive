// This file includes all the events..

$(document).keydown(function(event) {
	switch (event.keyCode) {
		case 32:
			console.log("Spacebar was pressed!");
			break;
		case 37:
			console.log("Left was pressed!");
			break;
		case 38:
			// Up
			console.log("Up was pressed!");
			break;
		case 39:
			// Right
			console.log("Right was pressed!");
			break;
		case 40:
			// Down
			console.log("Down was pressed!");
			break;
		default:
			console.log("Key pressed: ", event);
			break;
	}
});
