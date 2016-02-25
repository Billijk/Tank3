(function () {

	// define constants
	var PORT = 5000;
	var PHYSICS_LOOP_INTERVAL = 15;
	var UPDATE_LOOP_INTERVAL = 45;
	var WORLDSIZE = { WIDTH : 600, HEIGHT : 450 };

	global.window = global.document = global;
	require('./utils.js');

	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var UUID = require('node-uuid');

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
		client.emit('onconnected', { id: client.userid } );
		console.log('socket.io:: player ' + client.userid + ' connected');
		client.on('disconnect', function () {
			console.log('socket.io:: client disconnected ' + client.userid );
		});
	});

	function startgame() {
		physicsLoop();
		updateLoop();
	}

	// update game logics
	function physicsLoop() {
		setTimeout(physicsLoop, PHYSICS_LOOP_INTERVAL);
	}

	// send info to clients
	function updateLoop() {
		setTimeout(updateLoop, UPDATE_LOOP_INTERVAL);
	}
}) ();
