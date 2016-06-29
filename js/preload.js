var nBack = nBack || {};
       

nBack.Preload = function() {};

nBack.Preload.prototype = {
	init: function () {
    myId=0;

    land=null;
    skin=0;

    player=null;
    name='';
    car=null;
    turret=null;
    shadow=null;
    carsList=null;
    explosions=null;
    misiles=null;
    items=null;
    inputChanged=false;

    cursors=null;

    bullets=null;
    fireRate = 100;
    nextFire = 0;
    tRecargaMisiles = 0;
    textPlayersName=null;

    ready = false;
    eurecaServer=null;

    spikeballs=null;
    primero=null;
    datosSpikeballs = [];
    numSpikeballs = 100;
    barEnergy=null;
    marco=null;
    rectGasol=null;
    gasoline=0
    
    listBox=null;
    dataListBox = [];

    listBalls=null;
    dataListBalls = [];

    carCollisionGroup=null;
    bulletsCollisionGroup=null;
    playerCollisionGroup=null;
    bulletsEnemyCollisionGroup=null;
    boxCollisionGroup=null;
    itemsCollisionGroup=null;

    gp=false;

  },

    preload: function() {
      this.load.spritesheet('button', 'assets/buttons.png', 93, 42);
  		this.load.image('back', 'assets/background2.jpg');

  		this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  		this.load.image("fondo", "assets/fondo01.jpg");
  		//this.load.image('car', 'assets/sprites/car1.png');
  		for(var i = 1; i <= 8; i++)
  		{
  			this.load.image('enemy'+i,'assets/sprites/p2/car'+i+'.png');
        //this.load.image('enemy'+i,'assets/sprites/car1_test.png');
  		}
      //this.load.image('enemy','assets/sprites/p2/car1.png');
  		this.load.image('turret', 'assets/sprites/turret.png');
  		this.load.image('shadow', 'assets/sprites/p2/shadow2.png');
  		//game.load.spritesheet('bullet', 'assets/sprites/bullet.png', 60, 16);
  		this.load.image('bullet', 'assets/sprites/bullet01.png');
  		this.load.spritesheet('kaboom', 'assets/sprites/explosion.png', 64, 64, 25);
      this.load.spritesheet('kaboom2', 'assets/sprites/explosion2.png', 64, 64, 26);

  		this.load.image('spikeball', 'assets/sprites/spikeball.png');
      this.load.image('box', 'assets/sprites/box.png');
      this.load.image('marco', 'assets/sprites/marco.png');

      this.load.spritesheet('ball', 'assets/sprites/balls.png', 17,17);
	  },

    create: function() {
      this.state.start('Menu');
    }

    
};
