(function () {

	// define constants
	var PORT = 5000;
	var PHYSICS_LOOP_INTERVAL = 15;
	var UPDATE_LOOP_INTERVAL = 45;
	var WORLDSIZE = { WIDTH : 600, HEIGHT : 450 };

	global.window = global.document = global;
	require('./utils.js');

	// server instances
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var UUID = require('node-uuid');

	// variables with games
	var games = [];
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
		//var gameInfo = findGame();
		
		//!!! now debug! directly into new game
		var game = createNewGame();
		games[game].userConnect(client);
		games[game].startNewScene();

		client.emit('onconnected', { id: client.userid, map: games[game].map } );
		console.log('socket.io:: player ' + client.userid + ' connected');

		// a bunch of handlers
		client.on('message', function(msg) {

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
		this.clientCount = 0;
		this.clients = [];

		this.gameStatusEnum = { IDLE: 1, RUN: 2 };
		this.gameStatus = this.gameStatusEnum.IDLE;

		this.map = {n: 0, m: 0, walls: {}};

		this.userConnect = function(client) {
			if (!this.clients[client.userid]) {
				this.clients[client.userid] = client;
				this.clientCount ++;
				client.gameid = this.id;
			}
		}
		this.userDisconnect = function(client) {
			if (this.clients[client.userid]) {
				delete this.clients[client.userid];
				this.clientCount --;
			}
		}

		this.startNewScene = function() {
			this.sceneCount ++;
			this.map.n = Math.floor(Math.random() * 10 + 3);
			this.map.m = Math.max(this.map.n + Math.floor(Math.random() * 8 - 4), 3);
			this.map.walls = utils.prototype.createMap(this.map.n, this.map.m);
			this.physicsLoop();
			this.updateLoop();
		}

		// update game logics
		this.physicsLoop = function() {
			setTimeout(this.physicsLoop.bind(this), PHYSICS_LOOP_INTERVAL);
		}

		// send info to clients
		this.updateLoop = function() {
			var info = undefined;
			for (var id in this.clients) {
				this.clients[id].emit('gameinfo', info);
			}
			setTimeout(this.updateLoop.bind(this), UPDATE_LOOP_INTERVAL);
		}
	};

	// return a list of games available now
	function findGame() {
		var availableGames = [];

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
