var nBack = nBack || {};

var myId=0;

var land;
var skin=0;
var sc;

var player;
var name;
var car;
var turret;
var shadow;
var carsList;
var explosions;
var misiles;
var items;
var inputChanged;

var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;
var tRecargaMisiles = 0;
var textPlayersName;

var ready = false;
var eurecaServer;

var spikeballs;
var primero;
var datosSpikeballs = [];
var numSpikeballs = 30;

var barEnergy;
var marco;
var rectGasol;
var gasoline;

var listBox;
var dataListBox = [];

var listBalls;
var dataListBalls = [];

// Collision Groups //

var carCollisionGroup;
var bulletsCollisionGroup;
var playerCollisionGroup;
var bulletsEnemyCollisionGroup;
var boxCollisionGroup;
var itemsCollisionGroup;

var gp; // Boolean GetPoints

/////////////////////

nBack.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'gamediv');
sc = Math.min(window.innerWidth / nBack.game.width, window.innerHeight / nBack.game.height);

nBack.game.state.add('Boot', nBack.Boot);
nBack.game.state.add('Preload', nBack.Preload);
nBack.game.state.add('Menu', nBack.Menu);
nBack.game.state.add('Game', nBack.Game);

//this.nBack.game.stateTransition = this.nBack.game.plugins.add(Phaser.Plugin.StateTransition);

/*var transitionPlugin = nBack.game.plugins.add(Phaser.Plugin.StateTransition);
transitionPlugin.settings({ 
	duration: 750,  
	ease: Phaser.Easing.Quadratic.Out, 
	properties: { 
	   alpha: 0  
	}
});
transitionPlugin.to('Menu');*/

nBack.game.state.start('Boot');
