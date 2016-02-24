var socket;

var mainCanvas, context;
var downkeys = [];

function init() {
	mainCanvas = document.getElementById("mainCanvas");
	context = mainCanvas.getContext("2d");
	socket = io();
	socket.on('onconnected', function( data ) {
		console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
	});
}

function update() {
	clear();
	drawGUI();
	drawMap();
	handleInput();
	updatePos();
	drawTanks();
	requestAnimFrame(update);
}

function clear() {
	context.clearRect(0, 0, WIDTH, HEIGHT);
}
function drawGUI() {
}
function drawMap() {
}
function handleInput() {
}
function updatePos() {
}
function drawTanks() {
}

function start() {
	onkeyup = onkeydown = function(event) {
		var keyPressed = String.fromCharCode(event.keyCode);
		downkeys[keyPressed] = event.type == 'keydown';
	}
	update();
}
