var socket;

var mainCanvas, mapCanvas, mainContext, mapContext;
var tileSize;
var downkeys = [];
var fired = false;	// this ensures one shoot per click on space key
var states = { NONE: 1, WAIT: 2, RUN: 3 };
var currentState = states.NONE;

var game;

var fps_time_point = 0;
var latency_time_point = 0;
var lastTime = 0;
var current_fps;
var latency;

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
		clear(mapContext);
	};
	this.onNewScene = function(map, players) {
		this.map = map;
		this.players = players;
		// calculate tile size
		tileSize=Math.min((mainCanvas.width - 10) / map.m, (mainCanvas.height - 10) / map.n);

		mapContext.clearRect(0,0,500,500);
		drawMap();
		updateGUI();

		if (currentState == states.NONE) {
			currentState = states.WAIT;
			update();
		}

		$('#message').text('');
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
		socket.id = data.id;

		socket.on('userinfo', function( data ) {
			if (data.newplayer) {
				game.players[data.newplayer.id] = data.newplayer;
				updateGUI();
			} else if (data.playerleave) {
				delete game.players[data.playerleave];
				updateGUI();
			} else if (data.newcolor) {
				game.players[data.newcolor.player].color = data.newcolor.color;
				updateGUI();
			}
		});

		socket.on('gameinfo', function( data ) {
			switch(data.type) {
			case 'waitforuser' : $('#message').text('Wait for another user.');
					break;
			case 'startscene' : startScene(); 
							  break;
			case 'newscene' : game.onNewScene(data.map, data.players);
							  break;
			case 'serverupdate' : game.onServerUpdate(data.players, data.bullets);
								  break;
			}
		});

		socket.on('test', function( data ) { 
			if (!latency) latency = (Date.now() - data) / 2;
			else latency = ((Date.now() - data) / 2 + latency) / 2;
			if (Date.now() - latency_time_point > 500) {
				$('#latency').text(latency.toFixed(3) + ' ms');
				latency = 0;
				latency_time_point = Date.now();
			}
		});
	});
	start();
}

function start() {
	fps_time_point = Date.now();
	latency_time_point = Date.now();
	game = new ClientGameCore();
	startScene();
}

function enter() {
	var request = {type: 'join_game', nickname: $('#nickname').val()}
	socket.emit('message', {type: 'req', req: request});
	$('#nickname').val("");
	$('#input').hide();
	onkeyup = onkeydown = function(event) {
		var keyPressed = event.keyCode;
		downkeys[keyPressed] = event.type == 'keydown';
	}
	gameStatus = states.RUN;
}

function startScene() {
	game.newScene();
}

function update() {
	getTimeInfo();
	if (currentState != states.RUN && currentState != states.WAIT) return;

	clear(mainContext);
	drawTanks();
	drawBullets();

	if (currentState != states.RUN) {
		handleInput();
		updatePos();
	}

	requestAnimFrame(update);
}

function getTimeInfo() {
	if (lastTime) {
		if (!current_fps) current_fps = 1000 / (Date.now() - lastTime);
		else current_fps = (1000 / (Date.now() - lastTime) + current_fps) / 2;
		if (Date.now() - fps_time_point > 500) {
			$('#fps').text(current_fps.toFixed(3));
			current_fps = 0;
			fps_time_point = Date.now();
		}
	}
	lastTime = Date.now();
	socket.emit('message', {type : 'latency_test', time : lastTime});
}

function clear(context) {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
function updateGUI() {
	$('#userinfo>li').remove();
	for (var id in game.players) {
		var color = game.players[id].color;
		var name = game.players[id].name;
		var score = game.players[id].score;
		$('#userinfo').append('<li><div id="'+id+'"><span class="color" style="background-color:'+color+'"></span><span class="name">'+name+'</span><span class="score">'+score+'</span></div></li>');
	}
	// add color picker for myself
	$('#' + socket.id + ' .color').ColorPicker({
		color: game.players[socket.id].color,
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			// send info to server
			var req = {
				type: 'change_color',
				color: $('#' + socket.id + ' .color').css('backgroundColor')
			};
			socket.emit('message', {type: 'req', req: req})

			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#' + socket.id + ' .color').css('backgroundColor', '#' + hex);
		}
	});
}
function drawMap() {
	var n = game.map.n;
	var m = game.map.m;
	var right = game.map.walls.hori;
	var down = game.map.walls.vert;

	mapContext.lineWidth = 3;
	mapContext.strokeStyle = "#000000";

	// draw walls
	for (var a=0;a+1<n;a++)
		for (var b=0;b<m;b++)
			if (down[a][b]==1) drawLine(mapContext, (a+1)*tileSize,b*tileSize,(a+1)*tileSize,(b+1)*tileSize);
	for (var a=0;a<n;a++)
		for (var b=0;b+1<m;b++)
			if (right[a][b]==1) drawLine(mapContext, a*tileSize,(b+1)*tileSize,(a+1)*tileSize,(b+1)*tileSize);

	// draw border
	drawLine(mapContext, 0, 0, n*tileSize, 0);
	drawLine(mapContext, 0, m*tileSize, n*tileSize, m*tileSize);
	drawLine(mapContext, 0, 0, 0, m*tileSize, 0);
	drawLine(mapContext, n*tileSize, 0, n*tileSize, m*tileSize);
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
		socket.emit('message', {type: 'move', move : info});
	}
}
function updatePos() {
	// this function is reserved for client prediction and entity enterpolation
	// which will be added in later version
}
function drawTanks() {
	mainContext.lineWidth = 2;
	for (var id in game.players) {
		if (game.players[id].buff==-1) continue;
		var x = (game.players[id].pos.x) * tileSize + 5;
		var y = (game.players[id].pos.y) * tileSize + 5;
		var r = tileSize * game.players[id].radius;
		var angle = game.players[id].angle;
		mainContext.beginPath();
		mainContext.strokeStyle = game.players[id].color;
		mainContext.arc(x, y, r, 0, Math.PI*2);
		mainContext.moveTo(x, y);
		mainContext.lineTo(x + 2 * r * Math.cos(angle), y + 2 * r * Math.sin(angle));
		mainContext.stroke();
		// draw a crosshair on self tank
		if (id == socket.id) {
			mainContext.beginPath();
			mainContext.strokeStyle = "black";
			mainContext.moveTo(x - r / 2, y);
			mainContext.lineTo(x + r / 2, y);
			mainContext.moveTo(x, y - r / 2);
			mainContext.lineTo(x, y + r / 2);
			mainContext.stroke();
		}
	}
}
function drawBullets() {
	mainContext.strokeStyle = "black";
	for (var i = 0; i < game.bullets.length; ++ i)
	{
		x=game.bullets[i].pos.x;
		y=game.bullets[i].pos.y;
		r=game.bullets[i].radius;
		mainContext.beginPath();
		mainContext.arc(x*tileSize+5,y*tileSize+5,tileSize*r,0,Math.PI*2);
		mainContext.fill();
	}
}

function drawLine(context, x1,y1,x2,y2)
{
	context.beginPath();
	context.moveTo(x1+5,y1+5);
	context.lineTo(x2+5,y2+5);
	context.stroke();
}
