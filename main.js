var game = new Phaser.Game(900,675);

var jumpTimer = 0,
	loopTrous,
	obstacleSprite,
	line,
	world,
	player;

var sncf = {

	preload: function(){
		//Image, Son...
		game.load.image('world','img/world.jpg');
		game.load.image('robot', 'img/ed.png');
		game.load.image('trou', 'img/trou.png');
		game.load.image('mont', 'img/cloud.png');
		game.load.image('red','img/red.png');
		game.load.image('line','img/line.png');
		game.load.image('yellow','img/yellow.png');
		game.load.image('blue','img/blue.png');		
		game.load.physics("sprite_physics", "sprite_physics.json");
	},

	create: function(){
		world = game.add.sprite(0, 0, 'world'); // Ajout du fond
		game.world.setBounds(0, 0, 900, 675);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 1000;
        game.physics.p2.restitution = 0.8;

        var feuRouge = game.add.sprite(100,50,'red');
		var feuJaune = game.add.sprite(100,150,'yellow'); 
		var feuBleu = game.add.sprite(100,250,'blue'); 
		feuRouge.alpha = 0;
		feuJaune.alpha = 0;
		feuBleu.alpha = 0;

		game.add.tween(feuRouge).to( { alpha: 1 }, 1, "Linear", true, 500);
		game.add.tween(feuJaune).to( { alpha: 1 }, 1, "Linear", true, 1500);
		var b = game.add.tween(feuBleu).to( { alpha: 1 }, 1, "Linear", true, 2500);
		b.onComplete.add(function(){
			this.goText = game.add.text(750,100, "GO !!!");
			this.goText.alpha = 0;			
			game.add.tween(this.goText).to({alpha:1},1,"Linear",true);
			game.add.tween(world).to( { x: -900 }, 1000, "Linear", true);
			game.add.tween(this.goText).to({x:-900},1000,"Linear",true);
			game.add.tween(feuRouge).to({x:-900},1000,"Linear",true);
			game.add.tween(feuJaune).to({x:-900},1000,"Linear",true);
			game.add.tween(feuBleu).to({x:-900},1000,"Linear",true);

			//game.add.tween(line).to( { x: -900 }, 1000, "Linear", true);
		});

		// Player
		player = game.add.sprite(100,310,'robot'); // Ajout du personnage
		game.physics.p2.enable(player); // Activation des mouvements sur le personnage
        player.body.fixedRotation = true;
        player.body.collideWorldBounds = true; // Le personnage ne peut pas sortir de la surface de jeu

		// Obstacles
		this.obstacles = game.add.group();
		this.addObstacle();
		this.timer = game.time.events.loop(1000, this.addObstacle, this);

		// Clavier
		this.cursors = game.input.keyboard.createCursorKeys(); // Activation du clavier 

		//CLOUD
		//var cloud = game.add.graphics(500,500);
	},

	update: function(){
        /* game.physics.arcade.collide(line, player); // Player & Line peuvent entrent en collision
		game.physics.arcade.collide(player, this.obstacles, this.fall); */
        player.body.collides(this.obstacles, this.fall(), this);
        player.body.collides(line, null, this);

        var vitesse = 500;

		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && game.time.now > jumpTimer){
			console.log('JUMP');
			player.body.velocity.y = vitesse * -1;
			jumpTimer = game.time.now + 830;
		}
	},

	addObstacle: function(){
		var obstacleOffset = Math.random() * 100;
		obstacleRandom = Math.floor(obstacleOffset);
		
		if(obstacleRandom >= 55){
			obstacleSprite = 'mont';
			var obstacle = game.add.sprite(1200,414,obstacleSprite);
		}
		else{
			obstacleSprite = 'trou';
			var obstacle = game.add.sprite(1200,481,obstacleSprite);
		}

        line = game.add.sprite(obstacleOffset, 490, 'line');
        game.physics.p2.enable(line); // Activation des interactions sur la ligne
        line.body.velocity.x = -200;
        line.body.static = true;
        obstacle = game.add.graphics(e,490);
        obstacle.lineStyle(18, 0xffffff);
        obstacle.bezierCurveTo(0,0,150,300,300,0);
        obstacle.endFill();

        game.physics.p2.enable(obstacle); // Activation des mouvements sur les monts
		obstacle.body.velocity.x = -200;
		obstacle.body.static = true;
		this.obstacles.add(obstacle);

		obstacle.checkWorldBounds = true; // Vérifie l'état des trous dans la surface de jeu, est-il ou non dans l'écran
		obstacle.ouOfBoundsKill = true; // Il supprime les trous qui disparaissent de l'écran, pour la mémoire.
		// console.log('haut' + obstacle.body.touching.up);
	},

    restartGame: function(){
        game.state.start('sncf');
    },

	fall: function(){
		//game.add.tween(player).to( { y: 500 }, 100, "Linear", true);
		//game.add.tween(player).to( { x: 320 }, 100, "Linear", true);
		game.physics.p2.isPaused = true; // Stop le jeu
      //game.state.start('sncf');
	}
};

game.state.add('sncf',sncf);
game.state.start('sncf');
