var game;
var myId=0;
var play=false;

var land;
var skin=0;

var player;
var name;
var car;
var turret;
var shadow;
var carsList;
var explosions;

var misiles;
var items;
var maxCarga = 700;
var totalCarga = 0;
var gasolina = 1500, maxGasolina = 5000;

var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;

// Tiempos
var tRecargaMisiles = 0;

//var textMisiles, textGasolina;
var textPlayersName;

var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var spikeballs;
var primero;
var datosSpikeballs = [];
var numSpikeballs = 100;

// Graphics //
var barEnergy;

var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();
	
	eurecaClient.ready(function (proxy) {		
		eurecaServer = proxy;
		
	});

	eurecaClient.exports.setId = function(id, bol)
	{
		myId = id;
		primero = bol;
		//name = prompt("Please enter your name", "Anonymous");
		skin = Math.floor(1+Math.random()*8);
		eurecaServer.handshake();
		create();	
		ready = true;
	}	

	eurecaClient.exports.kill = function(id)
	{
		if (carsList[id]) {
			carsList[id].kill();
			delete carsList[id];
			console.log('killing ', id, carsList[id]);
		}
	}

	eurecaClient.exports.spawnEnemy = function(i, data)
	{
		
		if (i == myId || (i in carsList)) return; //this is me
		
		console.log('SPAWN');

		var cr = new Car(i, game, car, data);
		carsList[i] = cr;
	}

	eurecaClient.exports.updateState = function(id, state)
	{
		if (carsList[id])  {			
			if(state.bol){
				carsList[id].cursor = state;
				carsList[id].car.x = state.x;
				carsList[id].car.y = state.y;
				carsList[id].car.angle = state.angle;
				
			}
			carsList[id].turret.rotation = state.rot;
			carsList[id].car.loadTexture('enemy'+state.skin, 0);
			carsList[id].skin = state.skin;
			carsList[id].name = state.name;
			carsList[id].spikes = state.spikes;
			carsList[id].bol = state.bol;
			carsList[id].update();
		}
	}


}

Car = function (index, game, player, data) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		down:false,
		fire:false	
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		down:false,
		fire:false	
	}

	//var x = x;
	//var y = y;

	this.game = game;
	this.health = 1;
	this.player = player;
	this.bullets = game.add.group();
	this.bullets.enableBody = true;
	this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
	this.bullets.createMultiple(20, 'bullet', 0, false);
	this.bullets.setAll('anchor.x', 0.5);
	this.bullets.setAll('anchor.y', 0.5);
	this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    //this.bullets.callAll('animations.add', 'animations', 'spin', [0, 1], 11, true);
	//this.bullets.callAll('animations.play', 'animations', 'spin');	
	this.name = data.name;
    this.level = 1;
    this.shoot = false;
	this.cantMisiles = 6;
	this.maxMisiles = 6;
	this.giro = 5;
	this.recargaMisil = 300;
	this.velocMisil = 700;
    this.currentSpeed =270;
    this.fireRate = 800;
    this.nextFire = 0;
    this.alive = true;
    this.gasolina = 1500
    this.accelerationSpeed = 600;
    this.skin = data.skin;
    this.test = false;
    this.spikes = data.spikes;
    this.energy = 360;

    this.shadow = game.add.sprite(data.x, data.y, 'shadow');
    this.car = game.add.sprite(data.x, data.y, 'enemy'+data.skin);
    this.turret = game.add.sprite(data.x, data.y, 'turret');

    this.shadow.anchor.set(0.5);
    this.car.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.car.id = index;
    game.physics.enable(this.car, Phaser.Physics.ARCADE);
    this.car.body.immovable = false;
    this.car.body.collideWorldBounds = true;
    //this.car.body.bounce.setTo(0,0);

    this.car.angle = data.angle;	
    this.turret.angle = data.rotation;
    //this.car.angle = 0;

}

Car.prototype.update = function() {
	/*var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.down != this.input.down ||
		this.cursor.fire != this.input.fire
	);
	
	
	if (inputChanged || !this.test)
	{
		//Handle input change here
		//send new values to the server		
		if (this.car.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.car.x;
			this.input.y = this.car.y;
			this.input.angle = this.car.angle;
			this.input.rot = this.turret.rotation;
			
	
			eurecaServer.handleKeys(this.input);
			
		}
		this.test = true;
	}*/
	var c = 1;
	for(var i in carsList)
	{	
		if(carsList[i].car.id != myId)
			c++;
	}

	if (this.cursor.left)
    {
        this.car.angle -= this.giro/c;
    }
    else if (this.cursor.right)
    {
        this.car.angle += this.giro/c;
    }

    if (this.cursor.up && this.energy > 0)
    {    
        if(this.energy > 0){
        	this.energy -= 1/c;
        	this.currentSpeed = this.accelerationSpeed;
        	if(this.energy < 0)
        		this.energy = 0;
        }
    }
    else if(!this.cursor.up || this.energy <= 0)
    {
        if (this.currentSpeed > 270)
        {
            this.currentSpeed -= 7/c;
        }
        if(this.energy < 360 && !this.cursor.up){
        	this.energy += 0.5/c;
        }    
    }

    if (this.cursor.fire)
    {	
		this.fire({x:this.cursor.tx, y:this.cursor.ty});		
    }
    else
    {
    	this.shoot = false;
    }

    if (this.cursor.down)
    {
        if (this.currentSpeed > 130)
        {
            this.currentSpeed -= 10/c;
        }
    }
    else
    {
    	if (this.currentSpeed < 270)
        {
            this.currentSpeed += 10/c;
        }
    }

    game.physics.arcade.velocityFromRotation(this.car.rotation, this.currentSpeed, this.car.body.velocity)
	
    /*if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }	
	else
	{
		game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
	}*/	
	
    this.shadow.x = this.car.x;
    this.shadow.y = this.car.y;
    this.shadow.rotation = this.car.rotation;

    this.turret.x = this.car.x;
    this.turret.y = this.car.y;
}

Car.prototype.fire = function(target) {
	if (!this.alive || this.shoot) return;
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        this.nextFire = this.game.time.now + this.fireRate;
        this.shoot = true;
        var bullet = this.bullets.getFirstDead();
        bullet.reset(this.turret.x, this.turret.y);
        //bullet.kill();

		bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, this.velocMisil);
    }
}

Car.prototype.kill = function() {
	this.alive = false;
	this.car.kill();
	this.turret.kill();
	this.shadow.kill();
}

game = new Phaser.Game(window.outerWidth, window.outerHeight, Phaser.AUTO, 'gamediv');

Play = function () {
	
}

Play.prototype = {  
	preload: function(){preload()},
	create: function(){eurecaClientSetup()},
	update: function(){update()}
};

function preload(){
	game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	game.load.image("fondo", "assets/fondo01.jpg");
	game.load.image('car', 'assets/sprites/car1.png');
	for(var i = 1; i <= 8; i++)
	{
		game.load.image('enemy'+i,'assets/sprites/car'+i+'.png');
	}	
	game.load.image('turret', 'assets/sprites/turret.png');
	game.load.image('shadow', 'assets/sprites/shadow.png');
	//game.load.spritesheet('bullet', 'assets/sprites/bullet.png', 60, 16);
	game.load.image('bullet', 'assets/sprites/bullet01.png');
	game.load.spritesheet('kaboom', 'assets/sprites/explosion.png', 64, 64, 23);

	game.load.image('spikeball', 'assets/sprites/spikeball.png')
}

function create(){
	// Collision
	//game.physics.startSystem(Phaser.Physics.ARCADE);

	game.world.setBounds(0, 0, 10000, 10000);
	game.stage.disableVisibilityChange = true;

	land = game.add.tileSprite(0, 0, 10000, 10000, 'fondo');
	land.fixedToCamera = true;

	carsList = {};
	textPlayersName = [];
    explosions = game.add.group();	

	var data = {x: 0, y: 0, angle: 0, rotation: 0, skin: skin, name: name, spikes: []}
	player = new Car(myId, game, car, data);
	carsList[myId] = player;
	car = player.car;
	turret = player.turret;
	car.x=200;
	car.y=500;
	bullets = player.bullets;
	shadow = player.shadow;
	datosSpikeballs = player.spikes;

	//  Explosion pool

    /*for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }*/

    car.bringToTop();
    turret.bringToTop();

  	spikeballs = [];
  	//spikeballs.enableBody = true;
  	
	if(primero){
		for (var i = 0; i < numSpikeballs; i++)
		{
			createSpikeball();
			
		}
  	}

  	// TEST //

  	barEnergy = game.add.graphics(0, 0);
    barEnergy.lineStyle(6, 0x00CC00);
    barEnergy.arc(0, 0, 75, game.math.degToRad(0), game.math.degToRad(360), false);

  	//////////

    game.camera.follow(car);
   	//game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
   	//game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    player.input.skin = player.skin;
	player.input.name = player.name;
	player.input.spikes = player.spikes;

    game.time.events.loop(40, act, this);

}

function update(){
	//do not update if client not ready
	if (!ready) return;

	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.down = cursors.down.isDown;
	player.input.fire = game.input.activePointer.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;

	turret.rotation = game.physics.arcade.angleToPointer(turret);
	game.physics.arcade.velocityFromRotation(car.rotation, car.currentSpeed, car.body.velocity)
	land.tilePosition.x = -game.camera.x;
	land.tilePosition.y = -game.camera.y;

	

	player.spikes = datosSpikeballs;
	
	for(var i = 0; i < textPlayersName.length; i++)
	{
		textPlayersName[i].destroy();
		textPlayersName.splice(i,1);
	}

	var posY = 50;
	for (var i in carsList)
    {
	    var text = game.add.text(window.outerWidth-100, posY, carsList[i].name, {font:"21px Revalia", fill: getColor(carsList[i].skin)})
    	text.fixedToCamera = true;
    	text.anchor.set(0.5);
    	text.stroke = '#000000';
    	text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    	text.fontWeight = 'bold';
    	posY += 40;
    	textPlayersName.push(text);
    }

    // Colision
	for (var i in carsList)
    {
		if (!carsList[i]) continue;
		var curBullets = carsList[i].bullets;
		var curCar = carsList[i].car;

		for(var j in spikeballs)
		{
			if(!spikeballs[j]) continue;
			var targetSpikeball = spikeballs[j];
			game.physics.arcade.overlap(curCar, targetSpikeball, PlayerHitSpikeball, null, this);
			game.physics.arcade.overlap(curBullets, targetSpikeball, bulletHitSpikeball, null, this);
		}

		for (var j in carsList)
		{
			if (!carsList[j]) continue;
			if (j!=i) 
			{
			
				var targetCar = carsList[j].car;
				
				game.physics.arcade.overlap(curBullets, targetCar, bulletHitPlayer, null, this);
				game.physics.arcade.collide(curCar, targetCar, PlayerHitPlayer, null, this);
				//game.physics.arcade.collide(curBullets, targetCar, bulletHitPlayer)
			
			}
			if (carsList[j].alive)
			{
				carsList[j].update();
			}			
		}
    }
    
	//player.spikes = datosSpikeballs;

    if(!primero && spikeballs.length<=0){  	
  		for(var i in carsList){
  			if(carsList[i].car.id != myId){
		  		//for (var j = 0; j < 50; j++)
				//{
				if (!carsList[i]) continue;
				for(var j=0; j < carsList[i].spikes.length;j++)
				{
					var spike = carsList[i].spikes[j];

					var posX = spike.x
					var posY = spike.y;
					var vPosX = spike.vx;
					var vPosY = spike.vy;

					var sprite = game.add.sprite(posX, posY, 'spikeball');

					var rand = spike.scale;
				    sprite.scale.setTo(rand, rand);

					sprite.health = spike.health;
				    //sprite.enableBody = true;
				    game.physics.enable(sprite, Phaser.Physics.ARCADE);

				    sprite.name = 'sb' + sprite;
				    sprite.body.collideWorldBounds = true;
				    sprite.body.bounce.setTo(1, 1);
				    sprite.body.velocity.x = vPosX;
				    sprite.body.velocity.y = vPosY;

				    spikeballs.push(sprite);
				    datosSpikeballs.push({x: posX, y: posY, vx: vPosX, vy: vPosY, health: sprite.health, scale: rand});
				}	   
				break;
			}
			
		}
	}
	
	for (var i = 0; i< spikeballs.length; i++) {
		datosSpikeballs[i].x = spikeballs[i].x
		datosSpikeballs[i].y = spikeballs[i].y
		datosSpikeballs[i].vx = spikeballs[i].body.velocity.x;
		datosSpikeballs[i].vy = spikeballs[i].body.velocity.y;
		datosSpikeballs[i].health = spikeballs[i].health;
	}

	// Energy //
	if(player.alive){
		barEnergy.clear();
		barEnergy.destroy();
		barEnergy = game.add.graphics(car.x, car.y);
	    barEnergy.lineStyle(5, 0x00CC00);
		barEnergy.arc(0, 0, 75, game.math.degToRad(0), game.math.degToRad(player.energy), false);
		barEnergy.angle = -90;
		barEnergy.alpha = 0;
		if(player.energy >= 360){
			barEnergy.alpha = 0;
		}else{
			barEnergy.alpha = 1;
			
		}
	}

}

function bulletHitPlayer (car, bullet) {

    bullet.kill();
}

function PlayerHitPlayer (car, car2) {
	
}

function PlayerHitSpikeball (car, spike) {
	gameover();
}

function bulletHitSpikeball (spike, bullet) {
	bullet.kill();
	spike.health -= 1;
	if(spike.health <= 0){		
		var kaboom = explosions.create(spike.x, spike.y, 'kaboom');
    	kaboom.animations.add('kaboom');
    	kaboom.play('kaboom', 25, false);

		spike.kill();
		createSpikeball();
		game.time.events.repeat(Phaser.Timer.SECOND*1, 1, function(){removeAnimation(kaboom)}, this);
	}
}

function removeAnimation(sprite){
	explosions.remove(sprite, true);

}

function getPlayersName() {
	var playersName = "";
	for(i in carsList)
	{
		if(carsList[i])
			playersName += carsList[i].name + "\n";
	}
	return playersName;
}

function getColor(sk)
{
	var color = "";
	switch(sk)
	{
		case 1:
			color = "#D41C1C";
			break;
		case 2:
			color = "#2D76DD";
			break;
		case 3:
			color = "#2DDD50";
			break;
		case 4:
			color = "#E5EB1E";
			break;
		case 5:
			color = "#EF2ACB";
			break;
		case 6:
			color = "#F7A334";
			break;
		case 7:
			color = "#3FF0DE";
			break;
		case 8:
			color = "#7D0EAD";
			break;

	}
	return color;
}

function test(){
	if (player.car.id == myId)
	{
		// send latest valid state to the server
		player.input.x = player.car.x;
		player.input.y = player.car.y;
		player.input.angle = player.car.angle;
		player.input.rot = player.turret.rotation;
		

		eurecaServer.handleKeys(this.input);
		
	}
}

function act(){
	
	var inputChanged = (
		player.cursor.left != player.input.left ||
		player.cursor.right != player.input.right ||
		player.cursor.up != player.input.up ||
		player.cursor.down != player.input.down ||
		player.cursor.fire != player.input.fire
	);

	if (player.car.id == myId )
	{
		if(inputChanged || !player.test){
			player.input.x = player.car.x;
			player.input.y = player.car.y;
			player.input.angle = player.car.angle;
			
		}
		player.input.rot = player.turret.rotation;
		player.input.spikes = player.spikes;
		player.input.bol = inputChanged 

		//eurecaServer.handleK(player.input.spikes);
		eurecaServer.handleKeys(player.input);
		player.test = true;	
	}


}

function createSpikeball() {
	var posX = game.world.randomX;
	var posY = game.world.randomY;	
	//var vPosX = 100 + Math.random() * 500;
	//var vPosY = 100 + Math.random() * 500;	

    var sprite = game.add.sprite(posX, posY, 'spikeball');
    var rand = game.rnd.realInRange(0.5, 5);
    sprite.scale.setTo(rand, rand);

    var vPosX = 420/rand;
	var vPosY = 420/rand;

	if(rand <= 1)
		sprite.health = 1;
	else if (rand > 1 && rand <= 2)
		sprite.health = 2;
	else if (rand > 2 && rand <= 3)
		sprite.health = 3;
	else if (rand > 3 && rand <= 4)
		sprite.health = 4;
	else if (rand > 4 && rand <= 5)
		sprite.health = 5;

    //sprite.enableBody = true;
    game.physics.enable(sprite, Phaser.Physics.ARCADE);

    sprite.name = 'sb' + sprite;
    sprite.body.collideWorldBounds = true;
    sprite.body.bounce.setTo(1, 1);
    sprite.body.velocity.x = vPosX;
    sprite.body.velocity.y = vPosY;

    spikeballs.push(sprite);
    datosSpikeballs.push({x: posX, y: posY, vx: vPosX, vy: vPosY, health: sprite.health, scale: rand});
}

function gameover() {
	player.kill();
	barEnergy.clear();
	barEnergy.destroy();
	game.state.start('Over');
	document.getElementById("main").style.display = 'block';

}


/*game.state.add('mainState', mainState)

game.state.start('mainState')*/