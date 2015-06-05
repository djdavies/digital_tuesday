// Color Blast!
// License MIT
// © 2014 Nate Wiley

(function(window){

    /*  
     *  ================================================================================
     *  GAME CONFIGURATION
     *  This section constructs the game.
     *  You can set the maximum number of enemies and other game variables here.
     *  ================================================================================
     */
    var Game = {
        init: function(){
            this.canvas = document.getElementById("game");
            this.canvas.width = this.canvas.width;
            this.canvas.height = this.canvas.height;
            this.ctx = this.canvas.getContext("2d");
            this.color = "rgba(20,20,20,.7)";
            this.bullets = [];
            this.enemyBullets = [];
            this.enemies = [];
            this.bulletIndex = 0;
            this.enemyBulletIndex = 0;
            this.enemyIndex = 0;
            this.maxEnemies = 2;
            this.enemiesAlive = 0;
            this.currentFrame = 0;
            this.maxLives = 3;
            this.life = 0;
            this.binding();
            this.player = new Player();
            this.score = 0;
            this.shooting = false;
            this.oneShot = false;
            this.isGameOver = false;
            this.requestAnimationFrame = window.requestAnimationFrame 
                || window.webkitRequestAnimationFrame 
                || window.mozRequestAnimationFrame;
            
            // Spawn enemies at the begining of the game.
            for(var i = 0; i<this.maxEnemies; i++){
                new Enemy();
                this.enemiesAlive++;
            }

            // Begin game render loop.
            this.loop();
        },

        // Setup listeners to control the game.
        binding: function(){
            window.addEventListener("keydown", this.buttonDown);
            window.addEventListener("keyup", this.buttonUp);
            window.addEventListener("keypress", this.keyPressed);
            // add listener to the context of the canvas.
            this.canvas.addEventListener("click", this.clicked);
        },

        // When player press spacebar, check if player hasn't made a shot. If so fire a shot.
        // Check if game is over ,if so restart the game. Also, prevent the default action of spacebar.
        keyPressed: function(e){
            e.preventDefault();
            if(e.keyCode === 32){
                if(!Game.oneShot){
                    Game.player.shoot();
                    Game.oneShot = true;
                }
                if(Game.isGameOver){
                    Game.init();
                }
            }
        },

        // When player releases spacebar. Tell the game logic that the player had fired.
        // If player release left or right keys, stop player from moving in that direction.
        buttonUp: function(e){
            e.preventDefault();
            if(e.keyCode === 32){
                Game.shooting = false;
                Game.oneShot = false;
            }
            if(e.keyCode === 37 || e.keyCode === 65){
                Game.player.movingLeft = false;
            }
            if(e.keyCode === 39 || e.keyCode === 68){
                Game.player.movingRight = false;
            }
        },

        // When player holds down spacebar, fire multiple shots. If player press left, move left indefinitly.
        // If player press right, move right indefinitly.
        buttonDown: function(e){
            if(e.keyCode === 32){
                Game.shooting = true;
            }
            if(e.keyCode === 37 || e.keyCode === 65){
                Game.player.movingLeft = true;
            }
            if(e.keyCode === 39 || e.keyCode === 68){
                Game.player.movingRight = true;
            }
        },

        // Random number generator.
        random: function(min, max){
            return Math.floor(Math.random() * (max - min) + min);
        },

        // Check if two objects collided with each other. Using the x and y coordinates on the canvas.
        collision: function(a, b){
            return !(
                ((a.y + a.height) < (b.y)) ||
                (a.y > (b.y + b.height)) ||
                ((a.x + a.width) < b.x) ||
                (a.x > (b.x + b.width))
            )
        },

        // Clear the canvas by painting it white, up to the width and height specified in the configuration.
        clear: function(){
            this.ctx.fillStyle = Game.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },
       
        // When the game is over. Clear the game canvas. Display game over message along with the high score.
        gameOver: function(){
            this.isGameOver = true;
            this.clear();
            var message = "Game Over";
            var message2 = "Score: " + Game.score;
            var message3 = "Click or press Spacebar to Play Again";
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 30px Lato, sans-serif";
            this.ctx.fillText(message, this.canvas.width/2 - this.ctx.measureText(message).width/2, this.canvas.height/2 - 50);
            this.ctx.fillText(message2, this.canvas.width/2 - this.ctx.measureText(message2).width/2, this.canvas.height/2 - 5);
            this.ctx.font = "bold 16px Lato, sans-serif";
            this.ctx.fillText(message3, this.canvas.width/2 - this.ctx.measureText(message3).width/2, this.canvas.height/2 + 30);
        },

        // Every game frame redraw the game score and the player's life.
        updateScore: function(){
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Lato, sans-serif";
            this.ctx.fillText("Score: " + this.score, 8, 20);
            this.ctx.fillText("Lives: " + (this.maxLives - this.life), 8, 40);
        },
      
        // Main game loop that draws multiple enemies, player and bullets on the canvas.
        loop: function(){

            if( Game.isGameOver ) {
                Game.gameOver;
            } else {
            // Clear the canvas.
            Game.clear();
            // Draw & update enemies.
            for(var i in Game.enemies){
                var currentEnemy = Game.enemies[i];
                currentEnemy.draw();
                currentEnemy.update();
                // If the game frame number can be full divided by the shooting speed fire.
                if(Game.currentFrame % currentEnemy.shootingSpeed === 0){
                    currentEnemy.shoot();
                }
            }
            // Draw and update enemy bullets.
            for(var x in Game.enemyBullets){
                Game.enemyBullets[x].draw();
                Game.enemyBullets[x].update();
            }

            // Draw and update the player's bullets.
            for(var z in Game.bullets){
                Game.bullets[z].draw();
                Game.bullets[z].update();
            }

            // Draw the player once
            Game.player.draw();
            // Every frame update the player's position, score and change to the next frame.
            // At the end of the loop.
            Game.player.update();
            Game.updateScore();
            Game.currentFrame = Game.requestAnimationFrame.call(window, Game.loop);
            
            }
        }

    }; // END OF GAME CONFIGURATION


    /*  
     *  ================================================================================
     *  PLAYER CONFIGURATION
     *  ================================================================================
     */
    var Player = function(){
        this.width = 60;
        this.height = 20;
        this.x = Game.canvas.width/2 - this.width/2;
        this.y = Game.canvas.height - this.height;
        this.movingLeft = false;
        this.movingRight = false;
        this.speed = 8;
        this.color = "white";
    };

    // Player's die event. If player was hit and reduce their remaining lives.
    // Otherwise, the game is over.
    Player.prototype.die = function(){
        if(Game.life < Game.maxLives){
            Game.life++;
        } else {
            Game.gameOver();
        }
    };

    // Draws the player on the canvas by drawing and painting the player white.
    Player.prototype.draw = function(){
        Game.ctx.fillStyle = this.color;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Updates the player location and check if the player was hit by enemy bullets.
    Player.prototype.update = function(){
        if(this.movingLeft && this.x > 0){
            this.x -= this.speed;
        }
        if(this.movingRight && this.x + this.width < Game.canvas.width){
            this.x += this.speed;
        }
        if(Game.shooting && Game.currentFrame % 10 === 0){
            this.shoot();
        }
        for(var i in Game.enemyBullets){
            var currentBullet = Game.enemyBullets[i];
            if(Game.collision(currentBullet, this)){
                this.die();
                delete Game.enemyBullets[i];
            }
        }
    };

    // Player's shoot function.
    Player.prototype.shoot = function(){
        Game.bullets[Game.bulletIndex] = new Bullet(this.x + this.width/2);
        Game.bulletIndex++;
    };

    // ===== PLAYER'S BULLET =====
    // Bullets configuration for player's shots.
    var Bullet = function(x){  
        this.width = 8;
        this.height = 20;
        this.x = x;
        this.y = Game.canvas.height - 10;
        this.vy = 8;
        this.index = Game.bulletIndex;
        this.active = true;
        this.color = "white";
        
    };

    // Draw bullets on the canvas.
    Bullet.prototype.draw = function(){
        Game.ctx.fillStyle = this.color;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Update the bullet's location by updating the x and y coordinates.
    // Once the bullet reaches the top of the canvas remove bullet from canvas.
    Bullet.prototype.update = function(){
        this.y -= this.vy;
        if(this.y < 0){
            delete Game.bullets[this.index];
        }
    };


    /*  
     *  ================================================================================
     *  ENEMY CONFIGURATION
     *  ================================================================================
     */
    var Enemy = function(){
        this.width = 60;
        this.height = 20;
        this.x = Game.random(0, (Game.canvas.width - this.width));
        this.y = Game.random(10, 40);
        this.vy = Game.random(1, 3) * .1;
        this.index = Game.enemyIndex;
        Game.enemies[Game.enemyIndex] = this;
        Game.enemyIndex++;
        this.speed = Game.random(2, 3);
        this.shootingSpeed = 50;
        this.movingLeft = Math.random() < 0.5 ? true : false;
        this.color = "hsl("+ Game.random(0, 360) +", 60%, 50%)";
        
    };

    // Draw the enemies on the canvas.
    Enemy.prototype.draw = function(){
        Game.ctx.fillStyle = this.color;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Update the current enemy location on the canvas. Checks if it had collided with the player's bullet. 
    // If so remove current enemy and bullet from canvas.
    Enemy.prototype.update = function(){
        if(this.movingLeft){
            if(this.x > 0){
                this.x -= this.speed;
                this.y += this.vy;
            } else {
                this.movingLeft = false;
            }
        } else {
            if(this.x + this.width < Game.canvas.width){
                this.x += this.speed;
                this.y += this.vy;
            } else {
                this.movingLeft = true;
            }
        }
        
        for(var i in Game.bullets){
            var currentBullet = Game.bullets[i];
            if(Game.collision(currentBullet, this)){
                this.die();
                delete Game.bullets[i];
            }
        } 
    };

    // When an enemy dies, update the score by 15 and creates enemies 
    // and spawn them after 2 seconds had passed. 
    Enemy.prototype.die = function(){
      delete Game.enemies[this.index];
      Game.score += 15;
      Game.enemiesAlive = Game.enemiesAlive > 1 ? Game.enemiesAlive - 1 : 0;
      if(Game.enemiesAlive < Game.maxEnemies){
        Game.enemiesAlive++;
        setTimeout(function(){
            new Enemy();
          }, 2000);
        }
      
    };

    // When an shoots create a new bullet on the canvas.
    Enemy.prototype.shoot = function(){
        new EnemyBullet(this.x + this.width/2, this.y, this.color);
    };


    // ===== ENEMY BULLET =====
    // Enemy bullet configuration.
    var EnemyBullet = function(x, y, color){
        this.width = 8;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.vy = 6;
        this.color = color;
        this.index = Game.enemyBulletIndex;
        Game.enemyBullets[Game.enemyBulletIndex] = this;
        Game.enemyBulletIndex++;
    };

    // Draws an enemy bullet on the canvas.
    EnemyBullet.prototype.draw = function(){
        Game.ctx.fillStyle = this.color;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Update the bullets location on the canvas. Check if bullets reaches the edge of the canvas.
    // If so remove bullet from screen.
    EnemyBullet.prototype.update = function(){
        this.y += this.vy;
        if(this.y > Game.canvas.height){
            delete Game.enemyBullets[this.index];
        }
    };

    // Begin the game.
    Game.init();

}(window));