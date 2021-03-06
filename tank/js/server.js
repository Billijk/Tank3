(function () {

	// define constants
	var PORT = 5000;
	var PHYSICS_LOOP_INTERVAL = 15;
	var UPDATE_LOOP_INTERVAL = 45;
	var EQUIPMENT_GENERATE_PROB = 0.001;

	global.window = global.document = global;
	require('./bullet.js');
	require('./player.js');
	require('./equipment.js');
	require('./geometry.js');
	require('./utils.js');

	// parse arguments
	var args = process.argv.slice(2);
	var debug_mode = args.indexOf('--debug') != -1;
	if (debug_mode) console.log('[DEBUG] Debug mode is on.');

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
		console.log('[INFO] Express:: Listening on port ' + PORT);
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
		} else {
			game = gameInfo[0].id;
		}
		games[game].userConnect(client);

		client.emit('onconnected', { id: client.userid, map: games[game].map } );
		console.log('[INFO] socket.io:: player ' + client.userid + ' connected');
		console.log('[INFO] Entered game ' + game);

		// a bunch of handlers
		client.on('message', function(msg) {
			switch (msg.type) {
			case 'req':	request(client, msg.req); break;
			case 'move': clientMove(client, msg.move); break;
			case 'latency_test': client.emit('test', msg.time); break;
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
		this.clientCount = 0;
		this.playerCount = 0;
		this.alivePlayers = 0;

		this.gameStatusEnum = { IDLE: 1, WAIT: 2, RUN: 3, TOFINISH: 4, FINISHED: 5 };
		this.gameStatus = this.gameStatusEnum.IDLE;

		this.map = {n: 0, m: 0, walls: {}};
		this.clients = {};
		this.players = {};
		this.bullets = [];
		this.equipments = [];

		this.userConnect = function(client) {
			console.log('[INFO] user connect! ' + client.userid);
			if (!this.clients[client.userid]) {
				this.clients[client.userid] = client;
				this.clientCount ++;
			}
			client.gameid = this.id;
			// send info of other clients
			client.emit('userinfo', {players: this.players});

		}

		this.userJoin = function(client) {
			console.log('[INFO] user join! ' + client.userid);
			// add new player
			this.playerCount ++;
			this.players[client.userid] = new player();
			this.players[client.userid].name = client.name;
			this.players[client.userid].id = client.userid;
			if (this.gameStatus == this.gameStatusEnum.RUN) {
				var positions =  utils.prototype.createPlayer(this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert,1);
				this.players[client.userid].init();
				this.players[client.userid].pos.x = positions[0][0];
				this.players[client.userid].pos.y = positions[0][1];
				this.alivePlayers ++;
			} else if (this.gameStatus == this.gameStatusEnum.TOFINISH) {
				this.players[client.userid].pos = { x: -100, y: -100 };
				this.players[client.userid].buff = -1;
			}

			// if no player before, start new scene
			if (this.gameStatus == this.gameStatusEnum.IDLE) {
				this.gameStatus = this.gameStatusEnum.WAIT;
				client.emit('gameinfo', { type: 'waitforuser' });
			} else if (this.gameStatus == this.gameStatusEnum.WAIT) {
				this.startNewScene();
			}

			// send info to all clients, including this
			for (var id in this.clients) {
				this.clients[id].emit('userinfo', {newplayer: this.players[client.userid]});
			}
		}

			this.userDisconnect = function(client) {
				console.log('[INFO] user disconnected! ' + client.userid);
				if (this.gameStatus == this.gameStatusEnum.RUN &&
						this.players[client.userid] &&
						this.players[client.userid].buff != -1) {
					this.alivePlayers --;
				}
				if (this.players[client.userid]) this.playerCount --;
				if (this.clients[client.userid]) {
					delete this.clients[client.userid];
					delete this.players[client.userid];
					this.clientCount --;

					// broadcast
					for (var id in this.clients) {
						this.clients[id].emit('userinfo', {playerleave: client.userid});
					}
				}
				if (this.clientCount == 1) {
					this.gameStatus = this.gameStatusEnum.WAIT;
					for (var id in this.clients) {
						this.clients[id].emit('gameinfo', {type: 'waitforuser'});
					}
				}
				if (this.clientCount == 0) {
					gameCounts --;
					this.gameStatus = this.gameStatusEnum.FINISHED;
				}
			}

			this.changeColor = function(client, col) {
				if (this.players[client.userid]) {
					if (debug_mode) console.log('[DEBUG] user ' + client.name + ' changed color to ' + col);
					this.players[client.userid].color = col;

					for (var id in this.clients) {
						this.clients[id].emit('userinfo', {newcolor: {player: client.userid, color: col}});
					}
				}
			}

			this.startNewScene = function() {
				if (this.gameStatus == this.gameStatusEnum.FINISHED) return;
				this.alivePlayers = this.playerCount;

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
					i ++;
				}

				// init bullet info
				for (var i in this.bullets)
					delete this.bullets[i];
				this.bullets = [];

				// init equipment info
				for (var i in this.equipments)
					delete this.equipments[i];
				this.equipments = [];

				if (this.gameStatus == this.gameStatusEnum.WAIT) {
					this.gameStatus = this.gameStatusEnum.RUN;
					this.physicsLoop();
					this.updateLoop();
					if (debug_mode == true) this.debugLoop();
				}
				this.gameStatus = this.gameStatusEnum.RUN;

				for (var id in this.clients)
					this.clients[id].emit('gameinfo', {type: 'startscene'});
			}

			this.endScene = function() {
				if (this.gameStatus != this.gameStatusEnum.TOFINISH && this.gameStatus != this.gameStatusEnum.RUN) return;
				for (var id in this.players) {
					this.players[id].score += this.players[id].buff != -1;
				}
				this.startNewScene();
			}

			// update game logics
			this.physicsLoop = function() {
				if (this.gameStatus != this.gameStatusEnum.TOFINISH && this.gameStatus != this.gameStatusEnum.RUN) return;
				
				// check game over
				if (this.alivePlayers <= 1 && this.gameStatus == this.gameStatusEnum.RUN) {
					this.gameStatus = this.gameStatusEnum.TOFINISH;
					setTimeout(this.endScene.bind(this), 5000);
				}

				// generate equipment
				if (Math.random() < EQUIPMENT_GENERATE_PROB) {
					var pos = utils.prototype.createPlayer(this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert, 1);
					var newequip = new equipment();
					newequip.init();
					newequip.pos.x = pos[0][0];
					newequip.pos.y = pos[0][1];
					this.equipments.push(newequip);
					if (debug_mode) {
						console.log("[DEBUG] new equipment: " + pos[0][0], pos[0][1]);
					}
				}

				for (var i = 0; i < this.bullets.length; ++ i)
					this.bullets[i].next(this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert);
				for (var a in this.players) {
					var tank = this.players[a];
					if (tank.buff>=0) {
						// handle operation
						if (tank.operation.forward) {
							tank.next(1,this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert);
						}
						if (tank.operation.back) {
							tank.next(-1,this.map.n,this.map.m,this.map.walls.hori,this.map.walls.vert);
						}
						if (tank.operation.left) tank.angle -= tank.TANK_ROTATE_SPEED;
						if (tank.operation.right) tank.angle += tank.TANK_ROTATE_SPEED;
						if (tank.operation.fire) tank.fire(this.bullets);
						tank.operation = {};
						for (var b=0;b<this.bullets.length;b++)
						{
							GG=tank.CheckGG(this.bullets[b]);
							if (GG) { 
								this.bullets[b].restTime=0;
								this.alivePlayers --;
							}
						}
					}
					if (tank.buff==0)
					{
					}
				}
				help=[];
				for (var i = 0; i < this.bullets.length; i++)
					if (this.bullets[i].restTime!=0) help.push(this.bullets[i]);
					else
					{	
						if (this.bullets[i].owner!=-1 && this.players[this.bullets[i].owner]) this.players[this.bullets[i].owner].restBullets++;
					}
				this.bullets=help;
				setTimeout(this.physicsLoop.bind(this), PHYSICS_LOOP_INTERVAL);
			}

			// send info to clients
			this.updateLoop = function() {
				if (this.gameStatus != this.gameStatusEnum.TOFINISH && this.gameStatus != this.gameStatusEnum.RUN) return;
				var info = {};
				info.type = 'serverupdate';
				info.players = this.players;
				info.bullets = this.bullets;
				info.equipments = this.equipments;
				for (var id in this.clients) {
					this.clients[id].emit('gameinfo', info);
				}
				setTimeout(this.updateLoop.bind(this), UPDATE_LOOP_INTERVAL);
			}

			// print debug info
			this.debugLoop = function() {
				if (this.gameStatus != this.gameStatusEnum.TOFINISH && this.gameStatus != this.gameStatusEnum.RUN) return;
				setTimeout(this.debugLoop.bind(this), UPDATE_LOOP_INTERVAL);
			}
		};

		// deal with client requests
		function request(client, req) {
			switch (req.type) {
				case 'new_scene': 
					if (games[client.gameid] && 
							games[client.gameid].gameStatus != games[client.gameid].gameStatusEnum.IDLE) {
						client.emit('gameinfo', {type: 'newscene', map: games[client.gameid].map, players: games[client.gameid].players});
					}
					break;
				case 'join_game':
					client.name = req.nickname;
					games[client.gameid].userJoin(client);
					break;
				case 'change_color':
					games[client.gameid].changeColor(client, req.color);
					break;
			}
		}
		function clientMove(client, move) {
			var tank = games[client.gameid].players[client.userid];
			tank.operation = move;
		}

		// return a list of games available now
		function findGame() {
			var availableGames = [];
			for (var id in games) {
				if (games[id].gameStatus == games[id].gameStatusEnum.FINISHED) {
					delete games[id];
				} else {
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
