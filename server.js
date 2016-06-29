var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));

  
//get EurecaServer class
var Eureca = require('eureca.io');

//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'kill', 'updateState', 'createNewSpikeball']});
var clients = {};
var primero = false;
var count = 0;
var timeCreateSpike = 0;

//attach eureca.io to our http server
eurecaServer.attach(server);

//eureca.io provides events to detect clients connect/disconnect


//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	clients[conn.id] = {id:conn.id, remote:remote};

	count++;

	if(count == 1)
		primero = true;
	else
		primero = false;
	//here we call setId (defined in the client side)
	remote.setId(conn.id, primero);	

});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
   
    if(clients[conn.id]){
    	console.log('Client disconnected ', conn.id);
    
	    var removeId = clients[conn.id].id;
		
		delete clients[conn.id];

		count--;
		
		for (var c in clients)
		{
			var remote = clients[c].remote;
			
			//here we call kill() method defined in the client side
			remote.kill(conn.id);
		}
	}
});

eurecaServer.exports.update = function(numSpike)
{
	timeCreateSpike += 1/count;
	if(timeCreateSpike >= 2 && numSpike < 500){
		var x = 1+Math.random()*9999;
		var y = 1+Math.random()*9999;

		var rand = (Math.random()*5) + 0.5;

		var data = {x: x, y:y, rand:rand}

		for (var c in clients)
		{
			var remote = clients[c].remote;
			remote.createNewSpikeball(data);
		}

		console.log('Create New Spikeball')

		timeCreateSpike = 0;
	}
}

eurecaServer.exports.handshake = function()
{
	//var conn = this.connection;
	for (var c in clients)
	{
		var remote = clients[c].remote;
		for (var cc in clients)
		{		
			//send latest known position
			var bol = clients[cc].laststate ? clients[cc].laststate.bol:  true;
			if(bol){
				var x = clients[cc].laststate ? clients[cc].laststate.x:  0;
				var y = clients[cc].laststate ? clients[cc].laststate.y:  0;
				var angle = clients[cc].laststate ? clients[cc].laststate.angle:  0;						
				var name = clients[cc].laststate ? clients[cc].laststate.name:  '';
			}
			var skin = clients[cc].laststate ? clients[cc].laststate.skin:  1;
			var rotation = clients[cc].laststate ? clients[cc].laststate.rot:  0;
			var spikes = clients[cc].laststate ? clients[cc].laststate.spikes:  [];
			var box = clients[cc].laststate ? clients[cc].laststate.box:  [];
			var ball = clients[cc].laststate ? clients[cc].laststate.balls:  [];
			var points = clients[cc].laststate ? clients[cc].laststate.points:  0;
			var gas = clients[cc].laststate ? clients[cc].laststate.gasoline:  260;

			var data = {x: x, y: y, angle: angle, rotation: rotation, skin: skin, name: name, spikes: spikes, box: box, ball: ball, points:points, gasoline: gas};

			remote.spawnEnemy(clients[cc].id, data);		
		}
	}
}

eurecaServer.exports.handleKeys = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);
		
		//keep last known state so we can send it to new connected clients
		clients[c].laststate = keys;
	}
}

/*eurecaServer.exports.handleK = function (spike) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		remote.updateStateTwo(updatedClient.id, spike);
		
		//keep last known state so we can send it to new connected clients
		clients[c].laststate.spikes = spike;
	}
}*/

eurecaServer.exports.disconnected = function (id) {
	
	if(clients[id]){

		console.log('Client disconnected ', id);

	    var removeId = clients[id].id;
		
		delete clients[id];

		count--;
		
		for (var c in clients)
		{
			var remote = clients[c].remote;
			
			//here we call kill() method defined in the client side
			remote.kill(id);
		}
	}
}


server.listen(8000);