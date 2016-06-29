var nBack = nBack || {};

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
		//var o = new nBack.Game();
		//o.createGame();
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

		var cr = new Car(i, nBack.game, car, data);
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
			/*for(var i in carsList[id].spikes){
				if(spikeballs.length>0)
					spikeballs[i].health = carsList[id].spikes[i].health
					if(spikeballs[i].health <= 0){					
						var kaboom = explosions.create(spikeballs[i].x, spikeballs[i].y, 'kaboom');
						kaboom.scale.setTo(spikeballs[i].size/1.5, spikeballs[i].size/1.5);
				    	kaboom.animations.add('kaboom');
				    	kaboom.play('kaboom', 25, false);
				    	//sp.alive = false;
				    	//datosSpikeballs[sp.id].alive = false;
						spikeballs[i].kill();
						createSpikeball();
						nBack.game.time.events.repeat(Phaser.Timer.SECOND*1.1, 1, function(){removeAnimation(kaboom)}, this);
					}

			}*/
			carsList[id].update();
		}
	}

	eurecaClient.exports.createNewSpikeball = function(data)
	{
		createSpikeball(data, 1);
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
	this.giro = 3.5;
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
    this.newSpike = [];

    this.shadow = game.add.sprite(data.x, data.y, 'shadow');
    this.car = game.add.sprite(data.x, data.y, 'enemy'+data.skin);
    this.turret = game.add.sprite(data.x, data.y, 'turret');

    this.shadow.anchor.set(0.5);
    this.car.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.car.id = index;
    game.physics.enable(this.car, Phaser.Physics.ARCADE);
    //this.car.body.setRectangle(100, 50); 
    this.car.body.immovable = false;
    //this.car.inputEnabled = true;
    //this.car.input.enableDrag();
    this.car.body.collideWorldBounds = true;
    this.car.body.bounce.setTo(0,0);

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
    	//this.car.body.rotation -= this.giro/c;
        //this.car.body.angularVelocity -= this.giro/c;
    }
    else if (this.cursor.right)
    {
        this.car.angle += this.giro/c;
        //this.car.body.rotation += this.giro/c;
        //this.car.body.angularVelocity += this.giro/c;
    }
    /*else{
    	this.car.body.angularVelocity = 0;
    }*/

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

    nBack.game.physics.arcade.velocityFromRotation(this.car.rotation, this.currentSpeed, this.car.body.velocity)
	
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



nBack.Game = function() {


};

nBack.Game.prototype = {
	//preload: preload,
	create: function(){
		//this.game.time.events.add(480, eurecaClientSetup, this);
		eurecaClientSetup();
	},

	update: update,
	resize: function(){
      this.game.scale.setResizeCallback(this.gameResizedMobile, this);
  	}, 
  	gameResizedMobile: function(manager= Phaser.ScaleManager, bounds= Phaser.Rectangle){ 
  		sc = Math.min(window.innerWidth / nBack.game.width, window.innerHeight / nBack.game.height);

	    manager.setUserScale(sc, sc, 0, 0);
	    car.scale.setTo(1*sc, 1*sc);
	    turret.scale.setTo(1*sc, 1*sc);
	    shadow.scale.setTo(1*sc, 1*sc);
	    land.scale.setTo(1*sc, 1*sc);

	    //this.game.camera.scale.setTo(1*sc, 1*sc);
	    //this.game.camera.follow(car, Phaser.Camera.FOLLOW_LOCKON);
  	},
  	render: function(){
  		/*if(car)
  			this.game.debug.body(car);*/
  		for(var i in carsList){
  			this.game.debug.body(carsList[i].car);
  		}
  	}
}

/*function preload(){
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
}*/

function create(){
	// Collision
	nBack.game.physics.startSystem(Phaser.Physics.ARCADE);

	nBack.game.world.setBounds(0, 0, 10000, 10000);
	nBack.game.stage.disableVisibilityChange = true;

	land = nBack.game.add.tileSprite(0, 0, 10000, 10000, 'fondo');
	land.fixedToCamera = true;
	land.alpha = 0.1;

	carsList = {};
	textPlayersName = [];
    explosions = nBack.game.add.group();	

	var data = {x: 0, y: 0, angle: 0, rotation: 0, skin: skin, name: name, spikes: []}
	player = new Car(myId, nBack.game, car, data);
	carsList[myId] = player;
	car = player.car;
	turret = player.turret;
	car.x=200;
	car.y=500;
	car.alpha = 0.1;
	bullets = player.bullets;
	shadow = player.shadow;
	datosSpikeballs = player.spikes;

    car.bringToTop();
    turret.bringToTop();

  	spikeballs = [];
  	//spikeballs.enableBody = true;
  	
	if(primero){
		for (var i = 0; i < numSpikeballs; i++)
		{
			var data = {x: nBack.game.world.randomX, y: nBack.game.world.randomY, rand: nBack.game.rnd.realInRange(0.5, 5)}
			createSpikeball(data, 0.1);	
		}
  	}

  	// TEST //

  	barEnergy = nBack.game.add.graphics(0, 0);
    barEnergy.lineStyle(6, 0x00CC00);
    barEnergy.arc(0, 0, 75, nBack.game.math.degToRad(0), nBack.game.math.degToRad(360), false);

  	//////////

    nBack.game.camera.follow(car, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
   	//game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
   	//game.camera.focusOnXY(0, 0);

    cursors = nBack.game.input.keyboard.createCursorKeys();
    player.input.skin = player.skin;
	player.input.name = player.name;
	player.input.spikes = player.spikes;

	nBack.game.add.tween(land).to( { alpha: 1 }, 1000, "Linear", true);
	nBack.game.add.tween(car).to( { alpha: 1 }, 1000, "Linear", true);

	for(var i in spikeballs)
	{
		nBack.game.add.tween(spikeballs[i]).to( { alpha: 1 }, 1000, "Linear", true);
	}
	
	sc = Math.min(window.innerWidth / nBack.game.width, window.innerHeight / nBack.game.height); 

    car.scale.setTo(1*sc, 1*sc);
    turret.scale.setTo(1*sc, 1*sc);
    shadow.scale.setTo(1*sc, 1*sc);
    land.scale.setTo(1*sc, 1*sc);

    nBack.game.time.events.loop(40, act, this);
    nBack.game.time.events.loop(1000, act2, this);

}

function update(){
	//do not update if client not ready
	if (!ready) return;



	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.down = cursors.down.isDown;
	player.input.fire = nBack.game.input.activePointer.isDown;
	player.input.tx = nBack.game.input.x+ nBack.game.camera.x;
	player.input.ty = nBack.game.input.y+ nBack.game.camera.y;

	turret.rotation = nBack.game.physics.arcade.angleToPointer(turret);
	nBack.game.physics.arcade.velocityFromRotation(car.rotation, car.currentSpeed, car.body.velocity)
	land.tilePosition.x = -nBack.game.camera.x;
	land.tilePosition.y = -nBack.game.camera.y;

	

	player.spikes = datosSpikeballs;
	
	for(var i = 0; i < textPlayersName.length; i++)
	{
		textPlayersName[i].destroy();
		textPlayersName.splice(i,1);
	}

	var posY = 50;
	for (var i in carsList)
    {
	    var text = nBack.game.add.text(window.outerWidth-100, posY, carsList[i].name, {font:"21px Revalia", fill: getColor(carsList[i].skin)})
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
			nBack.game.physics.arcade.overlap(curCar, targetSpikeball, PlayerHitSpikeball, null, this);
			nBack.game.physics.arcade.overlap(curBullets, targetSpikeball, bulletHitSpikeball, null, this);
		}

		for (var j in carsList)
		{
			if (!carsList[j]) continue;
			if (j!=i) 
			{
			
				var targetCar = carsList[j].car;
				
				
				/*if (checkOverlap(curBullets, targetCar))
			    {
			    	//curBullets.kill();
			        //text.text = 'Drag the sprites. Overlapping: true';
			        console.log("TOCADO");
			    }*/
			    nBack.game.physics.arcade.overlap(curBullets, targetCar, bulletHitPlayer, null, this);
				nBack.game.physics.arcade.collide(curCar, targetCar, PlayerHitPlayer, null, this);
				//nBack.game.physics.arcade.collide(curBullets, targetCar, bulletHitPlayer)
			
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

					var sprite = nBack.game.add.sprite(posX, posY, 'spikeball');

					var rand = spike.scale;
				    sprite.scale.setTo(rand, rand);

					sprite.health = spike.health;
				    //sprite.enableBody = true;
				    nBack.game.physics.enable(sprite, Phaser.Physics.ARCADE);

				    sprite.id = spikeballs.length;
				    sprite.name = 'sb' + sprite;
				    sprite.alive = true;
				    sprite.body.collideWorldBounds = true;
				    sprite.body.bounce.setTo(1, 1);
				    sprite.body.velocity.x = vPosX;
				    sprite.body.velocity.y = vPosY;

				    spikeballs.push(sprite);
				    datosSpikeballs.push({x: posX, y: posY, vx: vPosX, vy: vPosY, health: sprite.health, scale: rand, alive: true});
				}	   
				break;
			}
			
		}

		for(var i in spikeballs)
		{
			nBack.game.add.tween(spikeballs[i]).to( { alpha: 1 }, 1000, "Linear", true);
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
		barEnergy = nBack.game.add.graphics(car.x, car.y);
	    barEnergy.lineStyle(5, 0x00CC00);
		barEnergy.arc(0, 0, 75, nBack.game.math.degToRad(0), nBack.game.math.degToRad(player.energy), false);
		barEnergy.angle = -90;
		barEnergy.alpha = 0;
		if(player.energy >= 360){
			barEnergy.alpha = 0;
		}else{
			barEnergy.alpha = 1;
			
		}
	}

	eurecaServer.update(spikeballs.length);

}

function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

}

function bulletHitPlayer (car, bullet) {

    bullet.kill();
    console.log("ENTRA");
}

function PlayerHitPlayer (car, car2) {
	
}

function PlayerHitSpikeball (car, spike) {
	carsList[car.id].kill();
	delete carsList[car.id];
	
	var kaboom = explosions.create(car.x, car.y, 'kaboom2');
	kaboom.scale.setTo(1, 1);
	kaboom.anchor.set(0.5);
    kaboom.animations.add('kaboom2');
    kaboom.play('kaboom2', 33, false);

	nBack.game.time.events.repeat(Phaser.Timer.SECOND*1.5, 1, function(){removeAnimation(kaboom)}, this);

	if(car.id == myId){
		
		//player.kill();
		barEnergy.clear();
		barEnergy.destroy();
			
		nBack.game.time.events.repeat(Phaser.Timer.SECOND*2, 1, function(){
		//player.alive = false;			
		eurecaServer.disconnected(myId);
		nBack.game.destroy();
		//myId = 0;
		nBack.game = new Phaser.Game(window.outerWidth, window.outerHeight, Phaser.CANVAS, 'gamediv');

		nBack.game.state.add('Boot', nBack.Boot);
		nBack.game.state.add('Preload', nBack.Preload);
		nBack.game.state.add('Menu', nBack.Menu);
		nBack.game.state.add('Game', nBack.Game);

		nBack.game.state.start('Boot');
		//nBack.game.stateTransition.to('Preload');
		
		//nBack.game.state.start('Menu');
	}, this);
	}

	
}

function bulletHitSpikeball (sp, bullet) {
	bullet.kill();
	sp.health -= 1;
	if(sp.health <= 0){		
		var kaboom = explosions.create(sp.x, sp.y, 'kaboom');
		kaboom.scale.setTo(sp.size/1.5, sp.size/1.5);
		//kaboom.anchor.set(0.5);
    	kaboom.animations.add('kaboom');
    	kaboom.play('kaboom', 25, false);
    	//sp.alive = false;
    	//datosSpikeballs[sp.id].alive = false;
		sp.kill();
		//createSpikeball();
		nBack.game.time.events.repeat(Phaser.Timer.SECOND*1.3, 1, function(){removeAnimation(kaboom)}, this);
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

function act(){
	
	inputChanged = (
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
		player.input.bol = inputChanged;
		

		//eurecaServer.handleK(player.input.spikes);
		eurecaServer.handleKeys(player.input);
		player.test = true;

	}


}

function act2(){
	if (player.car.id == myId && !inputChanged)
	{	
		player.input.x = player.car.x;
		player.input.y = player.car.y;
		player.input.angle = player.car.angle;			
		player.input.rot = player.turret.rotation;
		player.input.spikes = player.spikes;
		player.input.bol = true;	

		eurecaServer.handleKeys(player.input);
	}
}

function createSpikeball(data, alpha) {
	var sprite = nBack.game.add.sprite(data.x, data.y, 'spikeball');
	var rand = data.rand;
	sprite.scale.setTo(rand, rand);

	var vPosX = 300/rand;
	var vPosY = 300/rand;

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

	nBack.game.physics.enable(sprite, Phaser.Physics.ARCADE);

    sprite.id = spikeballs.length;
    sprite.name = 'sb' + sprite;
    sprite.alive = true;
    sprite.size = rand;
    sprite.body.collideWorldBounds = true;
    sprite.body.bounce.setTo(1, 1);
    sprite.body.velocity.x = vPosX;
    sprite.body.velocity.y = vPosY;
    sprite.alpha = alpha;

    spikeballs.push(sprite);
    datosSpikeballs.push({x: data.x, y: data.y, vx: vPosX, vy: vPosY, health: sprite.health, scale: rand, alive: true});
}