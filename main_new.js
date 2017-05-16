var game = new Phaser.Game(1200,900);

var character,
    obstacleXOffset,
    obstaclesXPosList,
    closestObstacleXPos,
    lastObstacleXPos,
    blueBackground,
    scoreCountLabel,
    isDarkMode,
    gameStarted,
    score,
    currentBgIsDark,
    lineScale,
    blueBgOffset = 0,
    blueRectangleXEndList,
    obstaclesCount,
    currentSpeed;

var sncf = {
    preload: function(){
        game.load.image('character','img/ed.png');
        game.load.image('hole','img/trou.png');
        game.load.image('hole_neg','img/trou-neg.png');
        game.load.image('mountain','img/bossex3.png');
        game.load.image('mountain_neg','img/bossex3-neg.png');
        game.load.image('line','img/line.png');
        game.load.image('ground','img/ground.jpg');
        game.load.image('background','img/fond.jpg');
        game.load.image('red','img/reb-3.png');
        game.load.image('yellow','img/reb-2.png');
        game.load.image('blue','img/reb-1.png');
        game.load.audio('bg_music', ['audio/bg_music.mp3', 'audio/bg_music.ogg']);
        game.load.audio('game_over', ['audio/game_over.mp3', 'audio/game_over.ogg']);
        game.load.audio('jump', ['audio/jump.mp3', 'audio/jump.ogg']);
        game.load.physics("sprite_physics", "sprite_physics.json");
    },

    create: function(){
        // Setup game basic params
        game.stage.backgroundColor = '#fff';
        game.world.setBounds(0, 0, 190020, 1100);
        game.world.scale.x = 0.7;
        game.world.scale.y = 0.7;
        obstacleXOffset= 0;
        obstaclesXPosList = [];
        closestObstacleXPos = 0;
        currentSpeed = 300;
        score = 0;
        gameStarted = false;
        currentBgIsDark = false;
        isDarkMode = false;
        obstaclesCount = 0;
        blueRectangleXEndList = [];

        // Setup physics
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 0.3;
        game.physics.p2.updateBoundsCollisionGroup();

        this.createCharacter();
        this.createTrafficLights();
        this.createObstacle();

        // Setup audio files
        this.bgMusic = game.add.audio('bg_music');
        this.jumpSound = game.add.audio('jump');
        this.gameOverSound = game.add.audio('game_over');

        // Play background audio
        this.bgMusic.play();

        var scoreCountStyle = { font: "bold 82px Arial", fill: "#333", boundsAlignH: "right", boundsAlignV: "right" };
        this.scoreCountLabel = game.add.text(1000, 25, "00000", scoreCountStyle);
        this.scoreCountLabel.fixedToCamera = true;

        // Create obstacles at specific intervals
        game.time.events.loop(300, this.createObstacle, this);
    },

    update: function(){
        // Check if game has already started
        if (!gameStarted) {
            this.character.body.x = 300;
        }
        else if (game.physics.p2.gravity.y === 0) {
            game.physics.p2.gravity.y = 2000;
        }

        // If user is pressing [SPACE] and character is on the line, do something (jump)
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.character.body.y > 720)
        {
            this.jump();
        }

        // Check if user is hitting the closest obstacle, if not add 1 point
        if (this.character.body.x > closestObstacleXPos - 120
            && this.character.body.x < closestObstacleXPos + 120
            && this.character.body.y > 720) {
            this.gameOver();
        }
        else if (this.character.body.x > closestObstacleXPos - 120
            && this.character.body.x < closestObstacleXPos + 120
            && lastObstacleXPos !== closestObstacleXPos) {
            score += 1;
            var s = "000000000" + score;
            // Add leading zeros to score
            this.scoreCountLabel.setText(s.substr(s.length-5));
            lastObstacleXPos = closestObstacleXPos;
        }
    },

    createObstacle:function(){
        // var lineScale = 1;
        if ((obstaclesCount.toString().slice(-1) === "5"
            || obstaclesCount.toString().slice(-1) === "6"
            || obstaclesCount.toString().slice(-1) === "7"
            || obstaclesCount.toString().slice(-1) === "8"
            || obstaclesCount.toString().slice(-1) === "9")
            && obstaclesCount !== 0) {
            isDarkMode = true;
        }
        else {
            isDarkMode = false;
        }

        /**
         * If first obstacle, make a long line
         */
        if (obstaclesCount === 0) {
            lineScale = 2;
        }
        else  {
            lineScale = Math.random() * 2 + 0.5;
        }
        var lineWidth = 500 * lineScale;

        var obstacleType = Math.floor(Math.random() * 2);
        // var obstacleType = 0;

        // Create a line
        /* var line = this.game.add.sprite(obstacleXOffset,900,"line");
        line.width = lineWidth;
        game.physics.p2.enable(line);
        line.body.fixedRotation = true;
        line.body.static = true;
        line.scale.x = lineScale; */

        var line = game.add.graphics(obstacleXOffset,900);
        if (isDarkMode) {
            line.lineStyle(18,0xffffff);
        }
        else {
            line.lineStyle(18,0x0f85c2);
        }
        line.moveTo(0,0);
        line.lineTo(lineWidth,0);

        /**
         * Create another line, only used for P2 physics
         */
        line = game.add.graphics(obstacleXOffset + (lineWidth / 2),900);
        line.lineStyle(0,0xffffff);
        line.moveTo(lineWidth / 2,0);
        line.lineTo(lineWidth * 1.5,0);
        game.physics.p2.enable(line);
        line.body.fixedRotation = true;
        line.body.static = true;
        line.body.outOfBoundsKill = true;

        // If currently in dark mode, create a blue background
        if (isDarkMode) {
            // currentSpeed += 200;
            var blueRectangleBg = game.add.graphics(obstacleXOffset, -300);
            blueRectangleBg.beginFill(0x0f85c2);
            blueRectangleBg.lineStyle(18,0x0f85c2);
            // Hole
            if (obstacleType === 0) {
                blueRectangleBg.drawRect(0, 0, lineWidth + 331, 1900);
            }
            // Mountain
            else {
                blueRectangleBg.drawRect(0, 0, lineWidth + 354, 1900);
            }

            blueRectangleXEndList.push(obstacleXOffset + 5000);

            var blueRectsBgGroup = game.add.group();
            blueRectsBgGroup.add(blueRectangleBg);

            game.world.sendToBack(blueRectsBgGroup);
        }

        var obstacleXPos = obstacleXOffset + lineWidth + 150;
        if (obstacleType === 0) {
            // Create a hole
            var hole;
            if (isDarkMode) {
                hole = this.game.add.sprite(obstacleXPos,978,"hole_neg");
            }
            else {
                hole = this.game.add.sprite(obstacleXPos,978,"hole");
            }
            game.physics.p2.enable(hole);
            hole.body.clearShapes();
            hole.body.loadPolygon('sprite_physics', 'trou');
            hole.body.fixedRotation = true;
            hole.body.static = true;
            hole.body.outOfBoundsKill = true;

            obstacleXOffset += lineWidth + hole.width - 25;
        }
        else {
            // Create a mountain
            var mountain;
            if (isDarkMode) {
                mountain = this.game.add.sprite(obstacleXPos + 20,878,"mountain_neg");
            }
            else {
                mountain = this.game.add.sprite(obstacleXPos + 20,878,"mountain");
            }
            game.physics.p2.enable(mountain);
            mountain.body.fixedRotation = true;
            mountain.body.static = true;
            mountain.body.outOfBoundsKill = true;

            obstacleXOffset += lineWidth + mountain.width - 20;
        }

        obstaclesCount += 1;

        // Store obstacles coords in array
        obstaclesXPosList.push(obstacleXPos);

        var newXObstaclePosList = [];
        // Remove useless old X positions of obstacles
        for (var i = 0; i < obstaclesXPosList.length; i++) {
            // If character is beyond current obstacle, delete it
            if (obstaclesXPosList[i] > this.character.body.x) {
                newXObstaclePosList.push(obstaclesXPosList[i]);
            }
        }
        obstaclesXPosList = newXObstaclePosList;

        this.getClosestObstacleXPos();

        this.character.body.velocity.x = 500 + currentSpeed;
    },

    getClosestObstacleXPos: function() {
        var curr = obstaclesXPosList[0];
        var diff = Math.abs (this.character.body.x - curr);
        for (var val = 0; val < obstaclesXPosList.length; val++) {
            var newdiff = Math.abs (this.character.body.x - obstaclesXPosList[val]);
            if (newdiff < diff) {
                diff = newdiff;
                curr = obstaclesXPosList[val];
            }
        }
        closestObstacleXPos = curr;
        return curr;
    },
    
    createTrafficLights: function() {
        // Setup traffic lights
        var feuRouge = game.add.sprite(300,50,'red');
        var feuJaune = game.add.sprite(300,130,'yellow');
        var feuBleu = game.add.sprite(300,210,'blue');
        feuRouge.alpha = 0;
        feuJaune.alpha = 0;
        feuBleu.alpha = 0;-

        game.add.tween(feuRouge).to( { alpha: 1 }, 1, "Linear", true, 500);
        game.add.tween(feuJaune).to( { alpha: 1 }, 1, "Linear", true, 1500);
        var b = game.add.tween(feuBleu).to( { alpha: 1 }, 1, "Linear", true, 2500);
        b.onComplete.add(function(){
            var goTextStyle = { font: "bold 252px Arial", fill: "#DDD", boundsAlignH: "right", boundsAlignV: "right" };
            this.goText = game.add.text(450,10, "GO!", goTextStyle);
            this.goText.alpha = 0;
            game.add.tween(this.goText).to({alpha:1},1,"Linear",true);
            gameStarted = true;
        });
    },

    createCharacter: function() {
        // Create character sprite
        this.character = this.game.add.sprite(300,700,"character");

        // Set-up character physics
        game.physics.p2.enable(this.character);
        this.character.body.clearShapes();
        this.character.body.loadPolygon('sprite_physics', "character");
        this.character.body.fixedRotation = true;
        this.character.body.bounce = 0.1;

        game.camera.follow(this.character);
    },

    jump: function() {
        this.character.body.velocity.y = -650;
        this.jumpSound.play();
    },

    render: function() {
        /* game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.spriteCoords(this.character, 32, 500); */
        game.debug.geom(blueBackground, 'rgba(200,0,0,0.5)');
    },

    gameOver: function() {
        this.gameOverSound.play();

        var __this = this;
        setTimeout(function() {
            __this.game.paused = true;

            var gameOverLabelStyle = { font: "bold 82px Arial", fill: "#333", boundsAlignH: "right", boundsAlignV: "right" };
            var gameOverLabel = game.add.text(__this.character.body.x - 270, 250, "GAME OVER", gameOverLabelStyle);
            gameOverLabel.fixedToCamera = true;

            var restartLabelStyle = { font: "bold 55px Arial", fill: "#333", boundsAlignH: "right", boundsAlignV: "right" };
            var restartLabel = game.add.text(__this.character.body.x - 220, 400, "Recommencer", restartLabelStyle);
            restartLabel.inputEnabled = true;
            restartLabel.events.onInputDown.add(__this.restartGame, this, 0);
            restartLabel.fixedToCamera = true;
        }, 400);
    },

    restartGame: function() {
        game.state.start('sncf');
    }
};

game.state.add('sncf',sncf);
game.state.start('sncf');