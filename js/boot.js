var nBack = nBack || {};
 
nBack.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
 
nBack.Boot.prototype = {
 
  preload: function() {
 
    //assets we'll use in the loading screen
 
    //this.load.image('preloadbar', 'assets/images/preloader-bar.png');
    this.game.time.advancedTiming = true;
 
  },
 
  create: function() {

    /*this.game.stage.backgroundColor = '#fff';
 
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    this.scale.pageAlignHorizontally = true;
 
    this.scale.pageAlignVertically = true;
 
    this.scale.setScreenSize(true);*/

     // Configures ScaleManager
    /*this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;     
    this.scale.pageAlignHorizontally = true;    
    this.scale.pageAlignVertically = true;    
    this.scale.setScreenSize=true;*/
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    
    //this.scale.pageAlignHorizontally = true;
    //this.scale.pageAlignVertically = true;
    //this.scale.forceOrientation(true);
    /*this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
    this.scale.setResizeCallback(function () { doRescale(this);  }, this);    
    this.scale.pageAlignHorizontally = true;    
    this.scale.pageAlignVertically = true;    
    this.scale.setScreenSize(true);    
    this.scale.refresh();*/

    // Initializes StateTransition Plugin
    this.game.stateTransition = this.game.plugins.add(Phaser.Plugin.StateTransition);
    this.game.stateTransition.configure({
      duration: Phaser.Timer.SECOND * 0.5,
      ease: Phaser.Easing.Linear.In,
      properties: {
      alpha: 0,
      scale: {
        x: 1.4,
        y: 1.4
      }
      }
    });

    this.game.stateTransition2 = this.game.plugins.add(Phaser.Plugin.StateTransition);
    this.game.stateTransition2.configure({
      duration: Phaser.Timer.SECOND * 0.8,
      ease: Phaser.Easing.Linear.Out,
      properties: {
      alpha: 0,
      scale: {
        x: 1,
        y: 1
      }
      }
    });
 
    this.state.start('Preload');
 
  }
 
};