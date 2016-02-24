(function () {
	var Consts = require('./constants.js');

	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var UUID = require('node-uuid');

	// set up Express server
	http.listen(Consts.PORT, function() {
		console.log('Express:: Listening on port ' + Consts.PORT);
	});

	app.get('/', function(req, res) {
		res.sendFile('index.html', {root: '../'});
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
}) ();

function startgame() {
	physicsLoop();
	updateLoop();
}

// update game logics
function physicsLoop() {
	setTimeout(physicsLoop, Consts.PHYSICS_LOOP_INTERVAL);
}

// send info to clients
function updateLoop() {
	setTimeout(updateLoop, Consts.UPDATE_LOOP_INTERVAL);
}
