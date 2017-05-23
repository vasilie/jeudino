var game = new Phaser.Game(1200,675);

var character,
    obstacleXOffset,
    obstaclesList,
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
    obstaclesCount,
    restartLabelXPos,
    isGamePaused,
    currentSpeed;

var sncf = {
    preload: function(){
        game.load.image('character','img/ed.png');
        game.load.image('hole','img/Trou.png');
        game.load.image('hole_neg','img/Trou-neg.png');
        game.load.image('mountain_3','img/bossex3.png');
        game.load.image('mountain_3_neg','img/bossex3-neg.png');
        game.load.image('mountain_2','img/bossex2.png');
        game.load.image('mountain_2_neg','img/bossex2-neg.png');
        game.load.image('mountain_1','img/bossex1.png');
        game.load.image('mountain_1_neg','img/bossex1-neg.png');
        game.load.image('line','img/line.png');
        game.load.image('drone','img/drone.png');
        game.load.image('drone_neg','img/drone-neg.png');
        game.load.image('game_over_banner','img/game-over-banner.png');
        game.load.image('ground','img/ground.jpg');
        game.load.image('background','img/fond.jpg');
        game.load.image('red','img/reb-3.png');
        game.load.image('yellow','img/reb-2.png');
        game.load.image('blue','img/reb-1.png');
        game.load.audio('bg_music', ['audio/bg_music.mp3', 'audio/bg_music.ogg']);
        game.load.audio('jump', ['audio/jump.mp3', 'audio/jump.ogg']);
        game.load.physics("sprite_physics", "sprite_physics.json");
    },

    create: function(){
        // Setup game basic params
        game.stage.backgroundColor = '#fff';
        game.world.setBounds(0, 0, 190020, 1070);
        game.world.scale.x = 0.7;
        game.world.scale.y = 0.7;
        obstacleXOffset= 0;
        obstaclesList = [];
        closestObstacleXPos = 0;
        currentSpeed = 400;
        score = 0;
        gameStarted = false;
        currentBgIsDark = false;
        isDarkMode = false;
        obstaclesCount = 0;
        restartLabelXPos = 0;

        // Setup physics
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 0.3;
        game.physics.p2.updateBoundsCollisionGroup();

        this.createCharacter();
        this.createTrafficLights();
        this.createObstacle();

        // Setup audio files
        this.bgMusic = new Audio('audio/bg_music.mp3');
        this.jumpSound = new Audio('audio/jump.mp3');
        this.gameOverSound = new Audio('audio/game_over.mp3');

        // Play background audio
        this.bgMusic.play();
        this.bgMusic.volume = 0.02;

        var scoreCountStyle = { font: "bold 82px Arial", fill: "#33", boundsAlignH: "right", boundsAlignV: "right" };
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
        if ((game.input.keyboard.isDown(Phaser.Keyboard.UP) ||
            game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
            && this.character.body.y > 720)
        {
            this.jump();
        }

        // Check if user is hitting the closest obstacle, if not add 1 point
        if (this.character.body.x > closestObstacleXPos['xPos'] - 80
            && this.character.body.x < closestObstacleXPos['xPos'] + 80
            && this.character.body.y > 700
            && closestObstacleXPos['type'] === 0) {
            this.gameOver(400);
        }
        else if (this.character.body.x > closestObstacleXPos['xPos'] - 125
            && this.character.body.x < closestObstacleXPos['xPos'] + 15
            && this.character.body.y > 670
            && closestObstacleXPos['type'] === 1) {
            this.gameOver(0);
        }
        else if (this.character.body.x > closestObstacleXPos['xPos'] - 120
            && this.character.body.x < closestObstacleXPos['xPos'] + 120
            && lastObstacleXPos !== closestObstacleXPos['xPos']) {
            score += 1;
            var s = "000000000" + score;
            // Add leading zeros to score
            this.scoreCountLabel.setText(s.substr(s.length-5));
            lastObstacleXPos = closestObstacleXPos['xPos'];
        }
    },

    createObstacle:function(){
        // var lineScale = 1;
        if (obstaclesCount.toString().slice(-1) === "5") {
            isDarkMode = true;

            currentSpeed += 50;
        }
        else if ((obstaclesCount.toString().slice(-1) === "6"
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
         * Spawn a drone
         */
        var spawnDrone = Math.floor(Math.random() * 3);

        var drone;
        if (spawnDrone === 1) {
            if (isDarkMode) {
                drone = this.game.add.sprite(obstacleXOffset,Math.floor(Math.random() * 200 + 300),"drone_neg");
            }
            else {
                drone = this.game.add.sprite(obstacleXOffset,Math.floor(Math.random() * 200 + 300),"drone");
            }
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

        /**
         * First, create a visual line
         */
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
         * Create a second line, only used for P2 physics
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
            var blueRectangleBg = game.add.graphics(obstacleXOffset + 10, -300);
            blueRectangleBg.beginFill(0x0f85c2);
            blueRectangleBg.lineStyle(18,0x0f85c2);
            // Hole
            if (obstacleType === 0) {
                blueRectangleBg.drawRect(0, 0, lineWidth + 290, 1900);
            }
            // Mountain
            else {
                blueRectangleBg.drawRect(0, 0, lineWidth + 350, 1900);
            }

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
            var mountainWidth = Math.floor(Math.random() * 3 + 1);

            if (isDarkMode) {
                switch(mountainWidth) {
                    case 1:
                        mountain = this.game.add.sprite(obstacleXPos - 94,878,"mountain_" + mountainWidth + "_neg");
                        break;
                    case 2:
                        mountain = this.game.add.sprite(obstacleXPos - 35,878,"mountain_" + mountainWidth + "_neg");
                        break;
                    case 3:
                        mountain = this.game.add.sprite(obstacleXPos + 25,878,"mountain_" + mountainWidth + "_neg");
                        break;
                }
            }
            else {
                switch(mountainWidth) {
                    case 1:
                        mountain = this.game.add.sprite(obstacleXPos - 94,878,"mountain_" + mountainWidth);
                        break;
                    case 2:
                        mountain = this.game.add.sprite(obstacleXPos - 35,878,"mountain_" + mountainWidth);
                        break;
                    case 3:
                        mountain = this.game.add.sprite(obstacleXPos + 25,878,"mountain_" + mountainWidth);
                        break;
                }
            }

            game.physics.p2.enable(mountain);
            mountain.body.fixedRotation = true;
            mountain.body.static = true;
            mountain.body.outOfBoundsKill = true;

            obstacleXOffset += lineWidth + 115 * mountainWidth;
        }

        obstaclesCount += 1;

        // Store obstacles coords in array
        obstaclesList.push({ xPos: obstacleXPos, type: obstacleType });

        var newXObstaclePosList = [];
        // Remove useless old X positions of obstacles
        for (var i = 0; i < obstaclesList.length; i++) {
            // If character is beyond current obstacle, delete it
            if (obstaclesList[i]['xPos'] > this.character.body.x) {
                newXObstaclePosList.push(obstaclesList[i]);
            }
        }
        obstaclesList = newXObstaclePosList;

        this.getClosestObstacleXPos();

        this.character.body.velocity.x = 500 + currentSpeed;
    },

    getClosestObstacleXPos: function() {
        var curr = obstaclesList[0];
        var diff = Math.abs (this.character.body.x - curr);
        for (var val = 0; val < obstaclesList.length; val++) {
            var newdiff = Math.abs (this.character.body.x - obstaclesList[val]['xPos']);
            if (newdiff < diff) {
                diff = newdiff;
            }
        }
        closestObstacleXPos = curr;

        return curr;
    },
    
    createTrafficLights: function() {
        // Setup traffic lights
        var feuRouge = game.add.sprite(300,200,'red');
        var feuJaune = game.add.sprite(300,280,'yellow');
        var feuBleu = game.add.sprite(300,360,'blue');
        feuRouge.alpha = 0;
        feuJaune.alpha = 0;
        feuBleu.alpha = 0;-

        game.add.tween(feuRouge).to( { alpha: 1 }, 1, "Linear", true, 500);
        game.add.tween(feuJaune).to( { alpha: 1 }, 1, "Linear", true, 1500);
        var b = game.add.tween(feuBleu).to( { alpha: 1 }, 1, "Linear", true, 2500);
        b.onComplete.add(function(){
            var goTextStyle = { font: "bold 252px Arial", fill: "#DDD", boundsAlignH: "right", boundsAlignV: "right" };
            this.goText = game.add.text(450,160, "GO!", goTextStyle);
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
        this.character.body.velocity.y = -700;
        this.jumpSound.play();
        this.jumpSound.volume = 1;
    },

    render: function() {
        /* game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.spriteCoords(this.character, 32, 500); */
        game.debug.geom(blueBackground, 'rgba(200,0,0,0.5)');
    },

    gameOver: function(timeoutDuration) {
        var __this = this;

        setTimeout(function() {
            __this.character.body.dynamic = false;
            __this.character.body.static = true;
            game.physics.p2.gravity.y = 0;

            /**
             * Create game over screen
             */
            var gameOverBanner = this.game.add.sprite(__this.character.body.x - 400, 250,"game_over_banner");
            gameOverBanner.fixedToCamera = true;
            gameOverBanner.width = 546 * 1.4;
            gameOverBanner.height = 370 * 1.4;

            var scoreLabelStyle = { font: "bold 95px Arial", fill: "#ae3738", boundsAlignH: "center", boundsAlignV: "middle" };
            var scoreLabel = game.add.text(__this.character.body.x - 40, 500, score, scoreLabelStyle);
            scoreLabel.anchor.setTo(0.25,0);
            scoreLabel.fixedToCamera = true;

            restartLabelXPos = scoreLabel.x;

            __this.game.paused = true;
            isGamePaused = true;

            __this.game.input.onDown.add(__this.restartGame, self);

            __this.gameOverSound.play();
        }, timeoutDuration);
    },

    restartGame: function(event) {
        game.paused = false;
        isGamePaused = false;
        game.state.start('sncf');
    }
};

document.body.onkeyup = function(e){
    if(e.keyCode === 32 && isGamePaused){
        sncf.restartGame();
    }
}

game.state.add('sncf',sncf);
game.state.start('sncf');