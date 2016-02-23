var mainCanvas, context;
var downkeys = [];

function init() {
	mainCanvas = document.getElementById("mainCanvas");
	context = mainCanvas.getContext("2d");

	gameInit();
}

function update() {
	clear();
	gameUpdate();
	requestAnimFrame(update);
}

function clear() {
	context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
}

function start() {
	onkeyup = onkeydown = function(event) {
		var keyPressed = String.fromCharCode(event.keyCode);
		downkeys[keyPressed] = event.type == 'keydown';
	}
	gameStart();
	update();
}
