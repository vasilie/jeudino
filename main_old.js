var player,
	grounds,
	jumpTimer = 0,
	line,
	test = 0,
	s,
	e, 
	ground,
    obstaclesXPosList = [],
	largeurs = 0,
	hauteurLigne = 550,
	largeurJeu = 900,
	hauteurJeu = 675,
    holeWidth = 182,
	circle,
	testeug,
	scoreCount,
	score = 0,
	hole;

var game = new Phaser.Game(largeurJeu, hauteurJeu);

var sncf = {
	preload: function(){
		game.load.image('ed','img/ed.png');
		game.load.image('hole','img/hole.png');
		game.load.image('line','img/line.png');
		game.load.image('ground','img/ground.jpg');
		game.load.image('fond','img/fond.jpg');
		game.load.physics("sprite_physics", "sprite_physics.json");
	},

	create: function(){

		game.stage.backgroundColor = '#0f85c2';
		game.physics.startSystem(Phaser.Physics.Arcade);

		game.physics.arcade.gravity.y = 0;
	    game.physics.arcade.restitution = 0.8;

		this.playerCollisionGroup = game.add.group();
        this.playerCollisionGroup.physicsBodyType = Phaser.Physics.Arcade;
        this.holeCollisionGroup = game.add.group();
        this.holeCollisionGroup.physicsBodyType = Phaser.Physics.Arcade;
        this.groundCollisionGroup = game.add.group();

        game.physics.arcade.overlap(this.playerCollisionGroup, this.holeCollisionGroup, this.playerFeltInHole, null, this);

        this.grounds = game.add.group();

		this.createPlayer();
		this.createObstacle();

	    /* var spriteMaterial = game.physics.createMaterial('spriteMaterial', this.player.body);
	    var groundMaterial = game.physics.createMaterial('groundMaterial', this.ground.body);
	    var contactMaterial = game.physics.createContactMaterial(spriteMaterial, groundMaterial); */

        var scoreCountStyle = { font: "bold 52px Arial", fill: "#000", boundsAlignH: "right", boundsAlignV: "right" };
        scoreCount = game.add.text(largeurJeu - 170, 15, score, scoreCountStyle);

        this.timer = game.time.events.loop(400, this.createObstacle, this);
	},

	update: function(){
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            this.jump();
        }
        else {
        	alreadyJumped = false;
		}

		// Check if user is hitting an obstacle
		if (this.player.body.y >= 380) {
        	console.log(test, obstaclesXPosList);
		}
	},

	createPlayer: function(){
		this.player = this.playerCollisionGroup.create(200,380,"ed");
		game.physics.arcade.enable(this.player);

		this.player.body.fixedRotation = true;
		this.player.body.dynamic = false;
		//this.player.body.data.gravityScale = 0;
		//this.player.body.static = true;
		//this.player.body.velocity.x = 300;
	},

	createObstacle:function(){
		var largeur = Math.floor(Math.random() * 1000 + 150);
        s = largeurs+test;
        e = largeur+largeurs+test;

        largeurs += largeur - 180;

		this.ground = game.add.sprite(s + largeur/2, hauteurLigne,'line');
		this.ground.width = largeur;
		game.physics.arcade.enable(this.ground);

		this.ground.body.static = true;
		this.ground.body.velocity.x = -300;
		this.hole = this.holeCollisionGroup.create(e+holeWidth/2,598,'hole');
		obstaclesXPosList.push(e+holeWidth/2);
		game.physics.arcade.enable(this.hole);
		this.hole.body.fixedRotation = true;

		this.hole.body.static = true;
		this.hole.body.velocity.x = -300;

		test += 285;
	},

	jump: function() {
		if (!alreadyJumped) {
            this.player.body.velocity.y = -800;
            var __this = this;
            setTimeout(function() {
            	// Make player go down
                __this.player.body.velocity.y = 800;
			}, 300);
            setTimeout(function() {
                // Make player fixed
                __this.player.body.velocity.y = 0;
                // Make sure player is at the right position, above the line
                __this.player.body.y = 380;
            }, 620);
        }
        alreadyJumped = true;
    },

    playerFeltInHole: function(player, hole) {
		console.log('player in hole');
	},

	restart: function(){
		game.state.start('sncf');
	}
};

game.state.add('sncf',sncf);
game.state.start('sncf');