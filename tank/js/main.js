var socket;

var mainCanvas, context;
var downkeys = [];
var game;

var xxx;

// ClientGameCore class
// save game info for clients
var ClientGameCore = function() {
	var sceneCount = 0;
	var map = {};
};

function init() {
	mainCanvas = document.getElementById("mainCanvas");
	context = mainCanvas.getContext("2d");
	socket = io();
	socket.on('onconnected', function( data ) {
		console.log('Connected successfully to the socket.io server. My server side ID is ' + data.id);
		utils.prototype.drawMap(context, data.map);

		socket.on('gameinfo', function( data ) {
			switch(data.type) {
			case 'newscene' : break;
			}
		});
	});
	start();
}

function start() {
	onkeyup = onkeydown = function(event) {
		var keyPressed = String.fromCharCode(event.keyCode);
		downkeys[keyPressed] = event.type == 'keydown';
	}
	game = new ClientGameCore();
	xxx = new bullet();
	xxx.pos.x=Math.random()*game.map.n;
	xxx.pos.y=Math.random()*game.map.m;
	xxx.angle=Math.random()*2*Math.PI;
	update();
}

function update() {
	clear();
	drawGUI();
	drawMap();
	handleInput();
	updatePos();
	drawTanks();
	drawBullets();
	requestAnimFrame(update);
}

function clear() {
	context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
}
function drawGUI() {
}
function drawMap() {
	utils.prototype.drawMap(context, game.map);
}
// send client operation to server
function handleInput() {
	var info = {};
	if (downkeys['w'] || downkeys['up']) info.forward = true;
	if (downkeys['s'] || downkeys['down']) info.back = true;
	if (downkeys['a'] || downkeys['left']) info.left = true;
	if (downkeys['d'] || downkeys['right']) info.right = true;
	if (downkeys['space']) info.fire = true;
	socket.emit('message', {move : info});
}
function updatePos() {
	// this function is reserved for client prediction and entity enterpolation
	// which will be added in later version
}
function drawTanks() {
}

function drawBullets() {
	x=game.bullets.pos.x;
	y=game.bullets.pos.y;
	context.moveTo(x*perWidth+perWidth+5,y*perWidth+perWidth/2+5);
	context.arc(x*perWidth+perWidth/2+5,y*perWidth+perWidth/2+5,perWidth/2,Math.PI*2,false);
	context.stroke();
}

