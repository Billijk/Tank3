(function () {

	// define constants
	var PORT = 5000;
	var PHYSICS_LOOP_INTERVAL = 15;
	var UPDATE_LOOP_INTERVAL = 45;

	global.window = global.document = global;
	require('./utils.js');

	// server instances
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var UUID = require('node-uuid');

	// variables with games
	var games = {};
	var gameCounts = 0;

	// set up Express server
	http.listen(PORT, function() {
		console.log('Express:: Listening on port ' + PORT);
	});
	app.get('/', function(req, res) {
		res.sendFile('index.html', {root: '../'});
	});
    app.get( '/*' , function( req, res, next ) {
        var file = req.params[0];
        res.sendFile( file, {root: '../'} );
	});

	// set up Socket.IO server
	io.on('connection', function(client) {
		client.userid = UUID();
		var gameInfo = findGame();
		var game;
		
		// TODO: add a game chooser
		if (gameInfo.length == 0) {
			game = createNewGame();
			games[game].userConnect(client);
			games[game].startNewScene();
		} else {
			game = gameInfo[0].id;
			games[game].userConnect(client);
		}

		client.emit('onconnected', { id: client.userid, map: games[game].map } );
		console.log('socket.io:: player ' + client.userid + ' connected');

		// a bunch of handlers
		client.on('message', function(msg) {
			switch (msg.type) {
			case 'req':	request(client, msg.req); break;
			case 'move': clientMove(client, msg.move); break;
			}

		});// on server received message
		client.on('disconnect', function () {
			games[client.gameid].userDisconnect(client);
			console.log('socket.io:: client disconnected ' + client.userid );
		});// on client disconnected

	});

	// game_core class deals with game logic on server side
	// each instance is an independent game
	var game_core = function() {

		this.id = UUID();
		this.sceneCount = 0;
		this.alivePlayers = 0;
		this.clientCount = 0;
		this.clients = {};

		this.gameStatusEnum = { IDLE: 1, RUN: 2, TOFINISH: 3, FINISHED: 4 };
		this.gameStatus = this.gameStatusEnum.IDLE;

		this.map = {n: 0, m: 0, walls: {}};
		this.players = {};
		this.bullets = [];

		this.userConnect = function(client) {
			if (!this.clients[client.userid]) {

				this.clients[client.userid] = client;
				this.clientCount ++;
				client.gameid = this.id;

				// add new player
				this.players[client.userid] = new player();
				this.players[client.userid].id = client.userid;
				if (this.gameStatus == this.gameStatusEnum.RUN) {
					var positions =  utils.prototype.createPlayer(this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert,1);
					this.players[client.userid].init();
					this.players[client.userid].pos.x = positions[0][0];
					this.players[client.userid].pos.y = positions[0][1];
					this.alivePlayers ++;
				}

				// send info of other clients
				client.emit('userinfo', {players: this.players});

				// send info to all clients, including this
				for (var id in this.clients) {
					this.clients[id].emit('userinfo', {newplayer: this.players[client.userid]});
				}
			}
		}
		this.userDisconnect = function(client) {
			if (this.gameStatus == this.gameStatusEnum.RUN) {
				this.alivePlayers --;
			}
			if (this.clients[client.userid]) {
				delete this.clients[client.userid];
				delete this.players[client.userid];
				this.clientCount --;
			}
			if (this.clientCount == 0) {
				gameCounts --;
				this.gameStatus = this.gameStatusEnum.FINISHED;
			}
		}

		this.startNewScene = function() {
			this.sceneCount ++;
			this.alivePlayers = this.clientCount;
			this.gameStatus = this.gameStatusEnum.RUN;

			// build map
			this.map.n = Math.floor(Math.random() * 10 + 3);
			this.map.m = Math.max(this.map.n + Math.floor(Math.random() * 8 - 4), 3); //m viberates a little around n , at least 3
			this.map.walls = utils.prototype.createMap(this.map.n, this.map.m);
			var positions = utils.prototype.createPlayer(this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert,this.clientCount);

			// init player info
			var i = 0;
			for (var id in this.players) {
				this.players[id].init();
				this.players[id].pos.x = positions[i][0];
				this.players[id].pos.y = positions[i][1];
			}

			this.physicsLoop();
			this.updateLoop();
		}

		this.endScene = function() {
			for (var id in this.clients) {
				this.clients[id].emit('gameinfo', {type: 'endscene'});
			}
			this.startNewScene();
		}

		// update game logics
		this.physicsLoop = function() {
			if (this.alivePlayers <= 1 && this.gameStatus == this.gameStatusEnum.RUN) {
				this.gameStatus = this.gameStatusEnum.TOFINISH;
				setTimeout(this.endScene.bind(this), 2500);
			}
			for (var i = 0; i < this.bullets.length; ++ i)
				this.bullets[i].next(this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert);
			setTimeout(this.physicsLoop.bind(this), PHYSICS_LOOP_INTERVAL);
		}

		// send info to clients
		this.updateLoop = function() {
			var info = {};
			info.type = 'serverupdate';
			info.players = this.players;
			info.bullets = this.bullets;
			for (var id in this.clients) {
				this.clients[id].emit('gameinfo', info);
			}
			setTimeout(this.updateLoop.bind(this), UPDATE_LOOP_INTERVAL);
		}
	};

	// deal with client requests
	function request(client, req) {
		switch (req.type) {
			case 'new_scene': 
				if (req.scene_num == games[client.gameid].sceneCount) {
					client.emit('gameinfo', {type: 'newscene', map: games[client.gameid].map, players: games[client.gameid].players});
				} else {
					setTimeout(function() { request(client, req) }, 100);
				}	
				break;
		}
	}
	function clientMove(client, move) {
		var tank = games[client.gameid].players[client.userid];
		if (tank) {
			if (move.forward) {
				tank.pos.x += tank.TANK_SPEED * Math.cos(tank.angle);
				tank.pos.y += tank.TANK_SPEED * Math.sin(tank.angle);
			}
			if (move.back) {
				tank.pos.x -= tank.TANK_SPEED * Math.cos(tank.angle);
				tank.pos.y -= tank.TANK_SPEED * Math.sin(tank.angle);
			}
			if (move.left) tank.angle -= tank.TANK_ROTATE_SPEED;
			if (move.right) tank.angle += tank.TANK_ROTATE_SPEED;
			if (move.fire) tank.fire();
		}
	}

	// return a list of games available now
	function findGame() {
		var availableGames = [];
		for (var id in games) {
			if (games[id].gameStatus == games[id].gameStatusEnum.FINISHED) delete games[id];
			else {
				// TODO: add a filter
				availableGames.push(games[id]);
			}
		}
		return availableGames;
	};

	function createNewGame() {
		gameCounts ++;
		var game = new game_core();
		games[game.id] = game;

		return game.id;
	}

	function startGame(gameid) {
		var game = games[gameid];
		if (game) {
			game.startNewScene();
		}
	}

	function endGame(gameid) {
		var game = games[gameid];
		if (game) {
			gameCounts --;
			delete games[gameid];
		}
	}

}) ();
