var socket;

var mainCanvas, context;
var tileSize;
var downkeys = [];
var game;

var xxx;

// ClientGameCore class
// save game info for clients
var ClientGameCore = function() {
	this.sceneCount = 0;
	this.map = {};
	this.players = {};
	this.bullets = {};

	this.newScene = function() {
		this.sceneCount ++;
		this.map = {};
		var request = {};
		request.type = 'new_scene';
		request.scene_num = this.sceneCount;
		socket.emit('message', {type: 'req', req: request});
	};
	this.onNewScene = function(map, players) {
		this.map = map;
		this.players = players;
		// calculate tile size
		tileSize=Math.min((mainCanvas.width - 10) / map.m, (mainCanvas.height - 10) / map.n);
		update();
	};
	this.onServerUpdate = function(players, bullets) {
		this.players = players;
		this.bullets = bullets;
	}
};

function init() {
	mainCanvas = document.getElementById("mainCanvas");
	context = mainCanvas.getContext("2d");
	socket = io();
	socket.on('onconnected', function( data ) {
		console.log('Connected successfully to the socket.io server. My server side ID is ' + data.id);

		socket.on('gameinfo', function( data ) {
			switch(data.type) {
			case 'newscene' : game.onNewScene(data.map, data.players);
							  break;
			case 'serverupdate' : game.onServerUpdate();
								  break;
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
	startScene();
}

function startScene() {
	game.newScene();
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
	var n = game.map.n;
	var m = game.map.m;
	var right = game.map.walls.hori;
	var down = game.map.walls.vert;

	context.lineWidth = 3;
	context.strokestyle = "#000000";

	// draw walls
	for (var a=0;a+1<n;a++)
		for (var b=0;b<m;b++)
			if (down[a][b]==1) this.drawLine(context, (a+1)*tileSize,b*tileSize,(a+1)*tileSize,(b+1)*tileSize);
	for (var a=0;a<n;a++)
		for (var b=0;b+1<m;b++)
			if (right[a][b]==1) this.drawLine(context, a*tileSize,(b+1)*tileSize,(a+1)*tileSize,(b+1)*tileSize);

	// draw border
	this.drawLine(context, 0, 0, n*tileSize, 0);
	this.drawLine(context, 0, m*tileSize, n*tileSize, m*tileSize);
	this.drawLine(context, 0, 0, 0, m*tileSize, 0);
	this.drawLine(context, n*tileSize, 0, n*tileSize, m*tileSize);
}
// send client operation to server
function handleInput() {
	var info = {};
	if (downkeys['w'] || downkeys['up']) info.forward = true;
	if (downkeys['s'] || downkeys['down']) info.back = true;
	if (downkeys['a'] || downkeys['left']) info.left = true;
	if (downkeys['d'] || downkeys['right']) info.right = true;
	if (downkeys['space']) info.fire = true;
	socket.emit('message', {type: 'move', move : info});
}
function updatePos() {
	// this function is reserved for client prediction and entity enterpolation
	// which will be added in later version
}
function drawTanks() {
	context.lineWidth = 1;
	for (var id in game.players) {
		var x = (game.players[id].pos.x + 0.5) * tileSize + 5;
		var y = (game.players[id].pos.y + 0.5) * tileSize + 5;
		var r = tileSize / 6;
		context.beginPath();
		context.arc(x, y, r, 0, Math.PI*2);
		context.stroke();
	}
}
function drawBullets() {
	x=game.bullets.pos.x;
	y=game.bullets.pos.y;
	context.moveTo(x*perWidth+perWidth+5,y*perWidth+perWidth/2+5);
	context.arc(x*perWidth+perWidth/2+5,y*perWidth+perWidth/2+5,perWidth/2,Math.PI*2,false);
	context.stroke();
}

function drawLine(context, x1,y1,x2,y2)
{
	context.moveTo(x1+5,y1+5);
	context.lineTo(x2+5,y2+5);
	context.stroke();
}
