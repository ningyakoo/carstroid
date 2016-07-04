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

	eurecaClient.exports.ready = function()
	{
		if(!ready){
			create();	
			ready = true;
		}
		
	}

	eurecaClient.exports.spawnEnemy = function(i, data)
	{
		
		if (i == myId || (i in carsList)) return; //this is me
		
		console.log('SPAWN');

		var cr = new Car(i, nBack.game, car, data, bulletsEnemyCollisionGroup, playerCollisionGroup, bulletsCollisionGroup, carCollisionGroup);	
		//cr.car.body.setCollisionGroup(carCollisionGroup);
		//cr.car.body.setCollisionGroup(carCollisionGroup);
		//cr.car.body.collides(bulletsCollisionGroup, hitBullet, this);	
		carsList[i] = cr;
		carsList[i].car.scale.setTo(1*sc, 1*sc);
		carsList[i].turret.scale.setTo(1*sc, 1*sc);
		carsList[i].shadow.scale.setTo(1*sc, 1*sc);

	}

	eurecaClient.exports.updateState = function(id, state)
	{
		if (carsList[id])  {
			//if(state.bol){
			if(carsList[id].cursor != state)
				carsList[id].cursor = state;
			if(Math.abs(carsList[id].car.body.x - state.x) > 15)
				carsList[id].car.body.x = state.x;
			if(Math.abs(carsList[id].car.body.y - state.y) > 15)
				carsList[id].car.body.y = state.y;
			//if(Math.abs(carsList[id].car.body.rotation - state.angle) > 1)
				carsList[id].car.body.rotation = state.angle;
				
			//}
			carsList[id].skin = state.skin;
			carsList[id].turret.rotation = state.rot;
			if(carsList[id].car){
				carsList[id].car.loadTexture('enemy'+state.skin, 0, false);
			}
			//carsList[id].car.loadTexture('enemy1', 0);a		
			carsList[id].name = state.name;
			carsList[id].spikes = state.spikes;
			carsList[id].boxes = state.box;
			carsList[id].bol = state.bol;
			carsList[id].balls = state.balls;
			carsList[id].car.points = state.points;
			if(id != myId)
				carsList[id].car.gasoline = state.gasoline;
			carsList[id].update();
		}
	}

	eurecaClient.exports.createNewSpikeball = function(data)
	{
		//createSpikeball(data, 1);
	}


}

Car = function (index, game, player, data, grupo1, grupo2, grupo3, grupo4) {
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
    this.bullets.physicsBodyType = Phaser.Physics.P2JS;
    this.bullets.enableBody = true;
	this.bullets.createMultiple(20, 'bullet', 0, false);
	this.bullets.setAll('anchor.x', 0.5);
	this.bullets.setAll('anchor.y', 0.5);
	this.bullets.setAll('body.outOfBoundsKill', true);
    this.bullets.setAll('body.collideWorldBounds', false);
    this.bullets.forEach(function(bullet){
      bullet.body.setCollisionGroup(grupo1);
      bullet.body.collides([grupo1, grupo2]);
      bullet.body.collides(boxCollisionGroup, hitBox, this);
      //bullet.body.collides([grupo1, boxCollisionGroup]);    
    });

    //this.bullets.setAll('body.setCollisionGroup', grupo1);
    //this.bullets.setAll('body.collides', [grupo1, grupo2]);
    //panda.body.setCollisionGroup(pandaCollisionGroup);
    //panda.body.collides([pandaCollisionGroup, playerCollisionGroup]);
    //this.bullets.body.collideWorldBounds = false;

    //this.bullets.callAll('animations.add', 'animations', 'spin', [0, 1], 11, true);
	//this.bullets.callAll('animations.play', 'animations', 'spin');	
	this.name = data.name;
    this.level = 1;   
    this.shoot = false;
	this.cantMisiles = 6;
	this.maxMisiles = 6;
	this.giro = 100;
	this.recargaMisil = 300;
	this.velocMisil = 700;
    //this.currentSpeed =270;
    this.fireRate = 800;
    this.nextFire = 0;
    this.alive = true;
    //this.accelerationSpeed = 600;
    this.skin = data.skin;
    console.log("CAR: " + this.skin)
    this.test = false;
    this.spikes = data.spikes;
    this.energy = 360;
    this.newSpike = [];
    this.boxes = data.box;
    this.balls = [];

    this.shadow = game.add.sprite(data.x, data.y, 'shadow');
    this.car = game.add.sprite(data.x, data.y, 'enemy'+data.skin);
    this.turret = game.add.sprite(data.x, data.y, 'turret');

    this.shadow.anchor.set(0.5);
    this.car.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.car.id = index;
    this.car.smoothed = false;
    this.car.currentSpeed = 270;
    this.car.accelerationSpeed = 600;
    this.car.points = data.points;
    this.car.gasoline = data.gasoline;
    //game.physics.enable(this.car, Phaser.Physics.ARCADE);
    game.physics.p2.enable(this.car, false);    	
   	this.car.body.setCollisionGroup(grupo4);
	this.car.body.collides(grupo3, hitBullet, this);
	this.car.body.collides(grupo2, hitPlayer, this);
	this.car.body.collides(itemsCollisionGroup, hitItems, this);
	this.car.body.collides([grupo4, boxCollisionGroup]);
	//this.car.body.collides(boxCollisionGroup, playerHitBox, this);
	this.car.body.collideWorldBounds = true;
    //this.car.body.setRectangle(50, 100); 
    //this.car.physicsBodyType = Phaser.Physics.P2JS;
    //this.car.enableBody = true;
    //this.car.body.collideWorldBounds = true;
    //this.car.body.bounce.setTo(0,0);

    this.car.body.rotation = data.angle;	
    this.turret.angle = data.rotation;
    //this.car.angle = 0;

}

Car.prototype.update = function() {
	
	var c = 1;
	/*for(var i in carsList)
	{	
		if(carsList[i].car.id != myId)
			c++;
	}*/

	if (this.cursor.left)
    {
    	//this.car.angle -= this.giro/c;
        //this.car.body.angularVelocity -= this.giro/c;
        this.car.body.rotateLeft(this.giro/c);
    }
    else if (this.cursor.right)
    {
        //this.car.angle += this.giro/c;
        //this.car.body.angularVelocity += this.giro/c;
        this.car.body.rotateRight(this.giro/c);
    }

    else{
    	 this.car.body.setZeroRotation();
    }

    if (this.cursor.up && this.energy > 0 && this.car.gasoline > 0)
    {    
        if(this.energy > 0){
        	this.energy -= 1/c;
        	this.car.currentSpeed = this.car.accelerationSpeed;
        	this.car.gasoline -= 0.5;
        	if(this.energy < 0)
        		this.energy = 0;
        }
    }
    else if(!this.cursor.up || this.energy <= 0)
    {
        if (this.car.currentSpeed > 270)
        {
            this.car.currentSpeed -= 7/c;
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
        if (this.car.currentSpeed > -200)
        {
            this.car.currentSpeed -= 10/c;
        }
    }
    else
    {
    	if (this.car.currentSpeed < 270)
        {
            this.car.currentSpeed += 10/c;
        }
    }

    if(this.car.gasoline <= 0)
    	this.car.currentSpeed = 50;

    if(this.car.gasoline > 0){
		this.car.gasoline -= 0.05;
	}

	if(this.car.gasoline > 260){		
		this.car.gasoline = 260;
	}

    var angle = this.car.body.rotation + (Math.PI / 2);
    this.car.body.velocity.x = -(this.car.currentSpeed * Math.cos(angle));
    this.car.body.velocity.y = -(this.car.currentSpeed * Math.sin(angle));

    this.shadow.x = this.car.x;
    this.shadow.y = this.car.y;
    this.shadow.rotation = this.car.body.rotation;

    this.turret.x = this.car.x;
    this.turret.y = this.car.y;
    
}

Car.prototype.fire = function(target) {
	if (!this.alive || this.shoot) return;
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0 && this.car.gasoline >= 15)
    {
        this.nextFire = this.game.time.now + this.fireRate;
        this.shoot = true;
        var bullet = this.bullets.getFirstDead();
        //bullet.body.setRectangle(37, 16); 
        bullet.reset(this.turret.x, this.turret.y);
        //bullet.kill();
        //bullet.body.setCollisionGroup(bulletsCollisionGroup);
        this.car.gasoline -= 15;

		//this.game.physics.arcade.moveToObject(bullet, target, this.velocMisil);
		bullet.body.rotation = this.game.physics.arcade.moveToObject(bullet, target, this.velocMisil);

		//bullet.body.onBeginContact.add(bulletsHit, this);
		//bullet.body.onBeginContact.add(bulletsHit, this);
		//bullet.body.collides([bulletsCollisionGroup, carCollisionGroup]);
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
	create: function(){
		
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.setImpactEvents(true);
		carCollisionGroup = this.game.physics.p2.createCollisionGroup();
    	bulletsCollisionGroup = this.game.physics.p2.createCollisionGroup();
    	playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
    	bulletsEnemyCollisionGroup = this.game.physics.p2.createCollisionGroup();
    	boxCollisionGroup = this.game.physics.p2.createCollisionGroup();
    	itemsCollisionGroup = this.game.physics.p2.createCollisionGroup();
    	this.game.physics.p2.updateBoundsCollisionGroup();
		eurecaClientSetup();
	},

	update: update,
	resize: function(){
		console.log('ENTRA');
      this.game.scale.setResizeCallback(this.gameResizedMobile, this);
  	}, 
  	gameResizedMobile: function(manager= Phaser.ScaleManager, bounds= Phaser.Rectangle){ 
  		sc = Math.min(window.innerWidth / nBack.game.width, window.innerHeight / nBack.game.height);

	    manager.setUserScale(sc, sc, 0, 0);
	    car.scale.setTo(1*sc, 1*sc);
	    turret.scale.setTo(1*sc, 1*sc);
	    shadow.scale.setTo(1*sc, 1*sc);
	    land.scale.setTo(1*sc, 1*sc);

	    //this.game.camera.fade(0x000000, 1000);

	    marco.destroy();
	    marco = nBack.game.add.sprite(window.innerWidth/2, window.innerHeight-(100*sc), "marco");
    	marco.fixedToCamera = true;
    	marco.anchor.set(0.5);
	    marco.scale.setTo(1*sc, 1*sc);

	    listBox.forEach(function(box){
	      box.scale.setTo(1*sc, 1*sc);
	    });


	    //this.game.camera.scale.setTo(1*sc, 1*sc);
	    //this.game.camera.follow(car, Phaser.Camera.FOLLOW_LOCKON);
  	},
  	render: function(){
  		/*if(gasoline < 260 && gasoline >= 130)
  			this.game.context.fillStyle = 'rgba(0,255,0,0.7)';
  		else if(gasoline < 130 && gasoline >= 65)
  			this.game.context.fillStyle = 'rgba(250,237,45,0.7)';
  		else if(gasoline < 65 && gasoline > 0)
  			this.game.context.fillStyle = 'rgba(255,0,0,0.7)';


	  	this.game.context.fillRect(window.innerWidth/2-(130*sc), window.innerHeight-(136*sc), gasoline, 72*sc);

	  	if(marco != null)
	  		this.game.world.bringToTop(marco);
	  	
  		*/
  	}
}


function create(){
	// Collision
	
	nBack.game.world.setBounds(0, 0, 10000, 10000);
	nBack.game.stage.disableVisibilityChange = true;

	land = nBack.game.add.tileSprite(0, 0, 10000, 10000, 'fondo');
	//land.fixedToCamera = true;
	land.alpha = 0.1;

	carsList = {};
	textPlayersName = [];
    explosions = nBack.game.add.group();	

	var data = {x: 1000, y: 1000, angle: 0, rotation: 0, skin: skin, name: name, spikes: [], box: [], points: 0, gasoline: 260}
	player = new Car(myId, nBack.game, car, data, bulletsCollisionGroup, carCollisionGroup, bulletsEnemyCollisionGroup, playerCollisionGroup);
	carsList[myId] = player;
	car = player.car;
	turret = player.turret;
	//car.x=1000;
	//car.y=1000;
	car.alpha = 0.1;
	bullets = player.bullets;
	shadow = player.shadow;
	datosSpikeballs = player.spikes;

    car.bringToTop();
    turret.bringToTop();

  	spikeballs = [];

  	listBox = nBack.game.add.group();
  	listBox.enableBody = true;
    listBox.physicsBodyType = Phaser.Physics.P2JS;
    

    listBalls = nBack.game.add.group();
    listBalls.enableBody = true;
    listBalls.physicsBodyType = Phaser.Physics.P2JS;
    

    sc = Math.min(window.innerWidth / nBack.game.width, window.innerHeight / nBack.game.height); 
  	
	if(primero){
		for (var i = 0; i < 60; i++)
		{
			//var data = {x: nBack.game.world.randomX, y: nBack.game.world.randomY, rand: nBack.game.rnd.realInRange(0.5, 5)}
			var data = {x: nBack.game.world.randomX, y: nBack.game.world.randomY, rot: 0}
			createBox(data, 0.1, i);	
		}
		for(var i = 0; i < 1000; i++)
		{
			var data = {x: nBack.game.world.randomX, y: nBack.game.world.randomY, frame: nBack.game.rnd.integerInRange(0, 5)}
			createBalls(data, 0.1, i);
		}
  	}



  	barEnergy = nBack.game.add.graphics(0, 0);
    barEnergy.lineStyle(6, 0x00CC00);
    barEnergy.arc(0, 0, 75, nBack.game.math.degToRad(0), nBack.game.math.degToRad(360), false);
    
    marco = nBack.game.add.sprite(window.innerWidth/2, window.innerHeight-(100*sc), "marco");
    marco.fixedToCamera = true;
    marco.anchor.set(0.5);
 
    //rectGasol.fixedToCamera = true;

    nBack.game.camera.follow(car, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);

    //rectGasol = new Phaser.Rectangle(marco.x, marco.y, marco.width, marco.height);
    //nBack.game.camera.onFadeComplete.add(resetFade, this);
   	//game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
   	//game.camera.focusOnXY(0, 0);
   	rectGasol = nBack.game.add.graphics(0, 0);
   	rectGasol.anchor.set(0.5);
   	rectGasol.lineStyle(2, 0x0000FF, 1);
   	rectGasol.beginFill(0xFF700B, 1);
    rectGasol.drawRect(marco.x, marco.y, marco.width, marco.height);  
    rectGasol.endFill();

    cursors = nBack.game.input.keyboard.createCursorKeys();
    player.input.skin = player.skin;
	player.input.name = player.name;
	player.input.spikes = player.spikes;
	player.input.points = 0;
	player.input.gasoline = 260;
	player.input.balls = player.balls;
	player.input.box = player.boxes;

	nBack.game.add.tween(land).to( { alpha: 1 }, 1000, "Linear", true);
	nBack.game.add.tween(car).to( { alpha: 1 }, 1000, "Linear", true);

	

	// Tween - Necesario para Transition Stage //

	for(var i in spikeballs)
	{
		nBack.game.add.tween(spikeballs[i]).to( { alpha: 1 }, 1000, "Linear", true);
	}
	
    car.scale.setTo(1*sc, 1*sc);
    turret.scale.setTo(1*sc, 1*sc);
    shadow.scale.setTo(1*sc, 1*sc);
    land.scale.setTo(1*sc, 1*sc);

    marco.scale.setTo(1*sc, 1*sc);

    //nBack.game.time.events.loop(40, act, this);
    nBack.game.time.events.loop(40, act2, this);
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
	//nBack.game.physics.arcade.velocityFromRotation(car.rotation, car.currentSpeed, car.body.velocity)
	/*var angle = car.body.rotation + (Math.PI / 2);
    car.body.velocity.x = -(car.currentSpeed * Math.cos(angle));
    car.body.velocity.y = -(car.currentSpeed * Math.sin(angle));*/
	//land.tilePosition.x = -nBack.game.camera.x;
	//land.tilePosition.y = -nBack.game.camera.y;

	player.spikes = datosSpikeballs;
	
	for(var i = 0; i < textPlayersName.length; i++)
	{
		textPlayersName[i].destroy();
		textPlayersName.splice(i,1);
	}

	var posY = 50;
	var pts = [];

	/*for (var i in carsList)
    {
    	var text = nBack.game.add.text(window.outerWidth-100, posY, puntos + " - " + carsList[i].name, {font:"21px Revalia", fill: getColor(carsList[i].skin)})
    	text.fixedToCamera = true;
    	text.anchor.set(0.5);
    	text.stroke = '#000000';
    	text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    	text.fontWeight = 'bold';
    	posY += 40;
    	textPlayersName.push(text);
	    
    }*/



	for (var i in carsList)
    {
    	var p = carsList[i].car.points;
    	if(p)
    		pts.push({name:carsList[i].name, skin: carsList[i].skin, points:carsList[i].car.points});
    	else
    		pts.push({name:carsList[i].name, skin: carsList[i].skin, points:0});
	    
    }

    if(pts.length>1)
    	pts.sort(function(a,b) {return (a.points < b.points) ? 1 : ((b.points > a.points) ? -1 : 0);})

    for(var i = 0; i < pts.length; i++)
    {
    	var text = nBack.game.add.text(window.outerWidth-100, posY, pts[i].points + " - " + pts[i].name, {font:"21px Revalia", fill: getColor(pts[i].skin)})
    	text.fixedToCamera = true;
    	text.anchor.set(0.5);
    	text.stroke = '#000000';
    	text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    	text.fontWeight = 'bold';
    	posY += 40;
    	textPlayersName.push(text);
    }

    if(!primero){
    	if(listBox.length<=0){
	  		console.log(carsList)
			for(var i in carsList)
			{

				console.log(myId)
				console.log(carsList[i].car.id)
				if(carsList[i].car.id != myId){
					console.log('2')
					if (!carsList[i]) continue;
					console.log('3')
					for(var j=0; j < carsList[i].boxes.length;j++)
					{	
						var box = carsList[i].boxes[j];
						var data = {x: box.x, y: box.y, rot: box.rot}
						createBox(data, 0.1);
					}
					break;
				}
			}
    	}

    	if(listBalls.length<=0){
			for(var i in carsList)
			{
				if(carsList[i].car.id != myId){
					if (!carsList[i]) continue;
					for(var j=0; j < carsList[i].balls.length;j++)
					{	
						var ball = carsList[i].balls[j];
						var data = {x: ball.x, y: ball.y, frame: ball.frame}
						createBalls(data, 0.1);
					}
					break;
				}
			}
		}
    }

	
    
    // Colision
	/*for (var i in carsList)
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
						
			    nBack.game.physics.arcade.overlap(curBullets, targetCar, bulletHitPlayer, null, this);
				nBack.game.physics.arcade.collide(curCar, targetCar, PlayerHitPlayer, null, this);	
			}
					
		}
    }*/

    for(var j in carsList){
    	if (carsList[j].alive)
		{
			carsList[j].update();
		}	
	}

    
	//player.spikes = datosSpikeballs;

    /*if(!primero && spikeballs.length<=0){  	
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
	}*/
	
	/*for (var i = 0; i< spikeballs.length; i++) {
		datosSpikeballs[i].x = spikeballs[i].x
		datosSpikeballs[i].y = spikeballs[i].y
		datosSpikeballs[i].vx = spikeballs[i].body.velocity.x;
		datosSpikeballs[i].vy = spikeballs[i].body.velocity.y;
		datosSpikeballs[i].health = spikeballs[i].health;	
	}*/

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

	rectGasol.clear();
	rectGasol.destroy();
	rectGasol = nBack.game.add.graphics(0, 0);	

    if(car.gasoline < 260 && car.gasoline >= 130)
  		rectGasol.beginFill(0x00CC00, 0.9);
  	else if(car.gasoline < 130 && car.gasoline >= 65)
  		rectGasol.beginFill(0xFFFF00, 0.9);
  	else if(car.gasoline < 65 && car.gasoline > 0)
  		rectGasol.beginFill(0xFF0000, 0.9);

    rectGasol.drawRect(window.innerWidth/2-(marco.width/2), window.innerHeight-(125*sc), car.gasoline*sc, marco.height-(20*sc)); 
    rectGasol.fixedToCamera = true; 
    rectGasol.endFill();
    
    marco.destroy();
	marco = nBack.game.add.sprite(window.innerWidth/2, window.innerHeight-(100*sc), "marco");
   	marco.fixedToCamera = true;
    marco.anchor.set(0.5);
	marco.scale.setTo(1*sc, 1*sc);	

	
	listBox.forEach(function(box){
		box.body.setZeroVelocity();
		box.body.setZeroRotation();
	});

	

	//player.input.box = player.boxes;

	//eurecaServer.update(spikeballs.length);

}

function hitBullet (body1, body2) {

    //body1.sprite.kill();
        var c = body1.sprite;
        if(carsList[c.id]){
            carsList[c.id].kill();
            //delete nBack.carsList[c.id];
        }
        
        body2.sprite.kill();    
        console.log(explosions);
        var kaboom = explosions.create(c.body.x, c.body.y, 'kaboom2');
        kaboom.scale.setTo(1, 1);
        kaboom.anchor.set(0.5);
        kaboom.animations.add('kaboom2');
        kaboom.play('kaboom2', 33, false);

        nBack.game.time.events.repeat(Phaser.Timer.SECOND*1.5, 1, function(){removeAnimation(kaboom)}, this);

        if(c.id == myId){ 
            //player.kill();
            barEnergy.clear();
            barEnergy.destroy();
                
            nBack.game.time.events.repeat(Phaser.Timer.SECOND*2, 1, function(){
                        
            eurecaServer.disconnected(myId);
            nBack.game.destroy();
            //nBack.myId = 0;
            nBack.game = new Phaser.Game(window.outerWidth, window.outerHeight, Phaser.CANVAS, 'gamediv');

            nBack.game.state.add('Boot', nBack.Boot);
            nBack.game.state.add('Preload', nBack.Preload);
            nBack.game.state.add('Menu', nBack.Menu);
            nBack.game.state.add('Game', nBack.Game);

            nBack.game.state.start('Boot');

            }, this);
        }
}

function hitPlayer (body1, body2) {

    if(body1.sprite.id != nBack.myId){
        //body1.sprite.kill();
        //body2.sprite.kill();
    }
    
    console.log(body1.sprite.id)

}

function hitBox (body1, body2) {
    console.log("ENTRA")
    body1.sprite.kill();

    player.boxes.splice(body2.sprite.id, 1);
    body2.sprite.kill();
    player.input.box = player.boxes;
    //nBack.eurecaServer.handleKeys(this.input);
}


function hitItems (body1, body2) {
    if(body2.sprite.name == 'ball'){
        if(body1.sprite.id == myId){
            body1.sprite.gasoline += 15;
            body1.sprite.points += 5;           
            player.input.points = body1.sprite.points;
            player.input.gasoline = body1.sprite.gasoline;
            //console.log(body1.sprite.gasoline);

        }
        player.balls.splice(body2.sprite.id, 1);
        body2.sprite.kill();
        player.input.balls = player.balls;
    }
    //eurecaServer.handleKeys(player.input);
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
		if(inputChanged){
			player.input.x = player.car.x;
			player.input.y = player.car.y;
			
			
		}
		player.input.angle = player.car.body.rotation;
		player.input.rot = player.turret.rotation;
		player.input.spikes = player.spikes;
		player.input.bol = inputChanged;
		player.input.gasoline = car.gasoline;

		eurecaServer.handleKeys(player.input);

	}


}

function act2(){
	if (player.car.id == myId && !inputChanged)
	{	
		player.input.x = player.car.x;
		player.input.y = player.car.y;
		player.input.angle = player.car.body.rotation;			
		player.input.rot = player.turret.rotation;
		player.input.spikes = player.spikes;	
		player.input.gasoline = car.gasoline;
		player.input.box = player.boxes;
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

function createBox(data, alpha, id){
	var box = listBox.create(data.x, data.y, 'box');
	box.id = id;
	box.alpha = alpha
    box.body.setRectangle(95, 95);
    box.body.static = true;
    box.body.setCollisionGroup(boxCollisionGroup);
    box.body.collides([boxCollisionGroup, playerCollisionGroup]);
    box.body.collides([boxCollisionGroup, carCollisionGroup]);
    box.body.collides([boxCollisionGroup, bulletsCollisionGroup]);
    box.body.collides([boxCollisionGroup, bulletsEnemyCollisionGroup]);
    player.boxes.push({x: data.x, y: data.y, rot: data.rot});

    nBack.game.add.tween(box).to( { alpha: 1 }, 1000, "Linear", true);
	box.scale.setTo(1*sc, 1*sc);
}

function createBalls(data, alpha, id) {
	var ball = listBalls.create(data.x, data.y, 'ball');
	ball.id = id;
	ball.name = 'ball';
	ball.alpha = alpha;
	ball.frame = data.frame;
	ball.body.setCircle(17);
	ball.body.setCollisionGroup(itemsCollisionGroup);
    ball.body.collides([itemsCollisionGroup, playerCollisionGroup]);
    ball.body.collides([itemsCollisionGroup, carCollisionGroup]);
    player.balls.push({x: data.x, y: data.y, frame: data.frame});

    nBack.game.add.tween(ball).to( { alpha: 1 }, 1000, "Linear", true);
	ball.scale.setTo(1*sc, 1*sc);
}

function resetFade() {

    nBack.game.camera.resetFX();

}