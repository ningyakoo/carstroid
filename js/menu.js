
var nBack = nBack || {};

nBack.Menu = function() {

};

nBack.Menu.prototype = {
	create: function() {
		this.sp = this.game.add.sprite(0, 0, 'back');
		this.sp.width = window.innerWidth;
		this.sp.height = window.innerHeight;

		this.myInput = this.createInput(window.innerWidth+60, window.innerHeight-60);
  	this.myInput.anchor.set(0.5);
  	this.myInput.canvasInput.value('Nickname');
  	this.myInput.canvasInput.focus();

  	//  Standard button (also used as our pointer tracker)
    this.btnPlay = this.game.add.button(window.innerWidth/2, window.innerHeight/2, 'button', this.playGame, this, 2, 0, 1);
  	//btnPlay.angle = 32;
  	this.btnPlay.scale.setTo(1, 1);
  	this.btnPlay.anchor.setTo(0.5, 0.5);

    sc = Math.min(window.innerWidth / this.game.width, window.innerHeight / this.game.height);

    this.myInput.x = (window.innerWidth/2)+(60*sc);
    this.myInput.y = (window.innerHeight/2)-(60*sc);
    this.myInput.scale.setTo(1*sc, 1*sc);

    this.btnPlay.x = window.innerWidth/2;
    this.btnPlay.y = window.innerHeight/2+(20*sc);
    this.btnPlay.scale.setTo(1*sc, 1*sc);
    
	},
  resize: function(){
      console.log("ENTRADO2");
      this.game.scale.setResizeCallback(this.gameResizedMobile, this);
  },
  gameResizedMobile: function(manager= Phaser.ScaleManager, bounds= Phaser.Rectangle){
    sc = Math.min(window.innerWidth / this.game.width, window.innerHeight / this.game.height);
 
    manager.setUserScale(sc, sc, 0, 0);
    this.sp.width = window.innerWidth;
    this.sp.height = window.innerHeight;

    this.myInput.x = (window.innerWidth/2)+(60*sc);
    this.myInput.y = (window.innerHeight/2)-(60*sc);
    //if(window.innerWidth < 500)  

    this.btnPlay.x = window.innerWidth/2;
    this.btnPlay.y = window.innerHeight/2+(20*sc);

    if(window.innerHeight < 560){
      this.myInput.scale.setTo(1*sc, 1*sc);
      this.btnPlay.scale.setTo(1*sc, 1*sc);
    }
    else{
      this.myInput.scale.setTo(1, 1);
      this.btnPlay.scale.setTo(1, 1);
    }
    
  },
	update: function() {

	},
	inputFocus: function(sprite){
    	sprite.canvasInput.focus();
  },
  	createInput: function(x, y){
		var bmd = this.add.bitmapData(400, 50);    
	    var myInput = this.game.add.sprite(x, y, bmd);
	    
	    myInput.canvasInput = new CanvasInput({
      	canvas: bmd.canvas,
      	fontSize: 17,
      	fontFamily: 'Arial',
      	fontColor: '#212121',
      	fontWeight: 'bold',
     	width: 250,
      	padding: 10,
      	borderWidth: 1,
      	borderColor: '',
      	borderRadius: 16,
      	boxShadow: '5px 5px 4px #000',
      	innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
      	placeHolder: 'Nickname'
	    });
	    myInput.inputEnabled = true;
	    myInput.input.useHandCursor = true;    
	    myInput.events.onInputUp.add(this.inputFocus, this);
	    
	    return myInput;
  	},
  	playGame: function() {
  		name = this.myInput.canvasInput.value();
  		//this.game.state.start('Game');
      //this.game.transitionPlugin.to('Game');
      skin = Math.floor(1+Math.random()*8);
      this.game.stateTransition2.to('Game');
  	}

}