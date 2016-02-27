var socket;

var mainCanvas, mapCanvas, mainContext, mapContext;
var tileSize;
var downkeys = [];
var fired = false;	// this ensures one shoot per click on space key

var game;

// ClientGameCore class
// save game info for clients
var ClientGameCore = function() {
	this.sceneCount = 0;
	this.map = {};
	this.players = {};
	this.bullets = [];

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

		clear(mapContext);
		drawMap();

		update();
	};
	this.onServerUpdate = function(players, bullets) {
		this.players = players;
		this.bullets = bullets;
	}
};

function init() {
	mainCanvas = document.getElementById("mainCanvas");
	mainContext = mainCanvas.getContext("2d");
	mapCanvas = document.getElementById("mapCanvas");
	mapContext = mapCanvas.getContext("2d");

	socket = io();
	socket.on('onconnected', function( data ) {
		console.log('Connected successfully to the socket.io server. My server side ID is ' + data.id);

		socket.on('gameinfo', function( data ) {
			switch(data.type) {
			case 'newscene' : game.onNewScene(data.map, data.players);
							  break;
			case 'serverupdate' : game.onServerUpdate(data.players, data.bullets);
								  break;
			}
		});
	});
	start();
}

function start() {
	onkeyup = onkeydown = function(event) {
		var keyPressed = event.keyCode;
		downkeys[keyPressed] = event.type == 'keydown';
	}
	game = new ClientGameCore();
	startScene();
}

function startScene() {
	game.newScene();
}

function update() {
	clear(mainContext);
	drawGUI();
	handleInput();
	updatePos();
	drawTanks();
	//drawBullets();
	requestAnimFrame(update);
}

function clear(context) {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
function drawGUI() {
}
function drawMap() {
	var n = game.map.n;
	var m = game.map.m;
	var right = game.map.walls.hori;
	var down = game.map.walls.vert;

	mapContext.lineWidth = 3;
	mapContext.strokestyle = "#000000";

	// draw walls
	for (var a=0;a+1<n;a++)
		for (var b=0;b<m;b++)
			if (down[a][b]==1) this.drawLine(mapContext, (a+1)*tileSize,b*tileSize,(a+1)*tileSize,(b+1)*tileSize);
	for (var a=0;a<n;a++)
		for (var b=0;b+1<m;b++)
			if (right[a][b]==1) this.drawLine(mapContext, a*tileSize,(b+1)*tileSize,(a+1)*tileSize,(b+1)*tileSize);

	// draw border
	this.drawLine(mapContext, 0, 0, n*tileSize, 0);
	this.drawLine(mapContext, 0, m*tileSize, n*tileSize, m*tileSize);
	this.drawLine(mapContext, 0, 0, 0, m*tileSize, 0);
	this.drawLine(mapContext, n*tileSize, 0, n*tileSize, m*tileSize);
}
// send client operation to server
function handleInput() {
	var info = {};
	var flag = false;
	if (downkeys[87] || downkeys[38]) info.forward = flag = true;
	if (downkeys[83] || downkeys[40]) info.back = flag = true;
	if (downkeys[65] || downkeys[37]) info.left = flag = true;
	if (downkeys[68] || downkeys[39]) info.right = flag = true;
	if (downkeys[32]) {
		if (!fired) info.fire = fired = flag = true;
	} else fired = false;
	if (flag) {
		console.log(info);
		socket.emit('message', {type: 'move', move : info});
	}
}
function updatePos() {
	// this function is reserved for client prediction and entity enterpolation
	// which will be added in later version
}
function drawTanks() {
	mainContext.lineWidth = 1;
	mainContext.strokestyle = "#000000";
	for (var id in game.players) {
		var x = (game.players[id].pos.x) * tileSize + 5;
		var y = (game.players[id].pos.y) * tileSize + 5;
		var r = tileSize / 6;
		var angle = game.players[id].angle;
		mainContext.beginPath();
		mainContext.arc(x, y, r, 0, Math.PI*2);
		mainContext.moveTo(x, y);
		mainContext.lineTo(x + 2 * r * Math.cos(angle), y + 2 * r * Math.sin(angle));
		mainContext.stroke();
	}
}
function drawBullets() {
	x=game.bullets[0].pos.x;
	y=game.bullets[0].pos.y;
	context.beginPath();
	context.arc(x*tileSize+5,y*tileSize+5,tileSize/100.0,0,Math.PI*2);
	context.stroke();
}

function drawLine(context, x1,y1,x2,y2)
{
	context.moveTo(x1+5,y1+5);
	context.lineTo(x2+5,y2+5);
	context.stroke();
}
