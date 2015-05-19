(function() {
  var AsteroidsView, game,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  AsteroidsView = (function() {
    function AsteroidsView() {
      this.render = bind(this.render, this);
      this.init = bind(this.init, this);
    }

    AsteroidsView.prototype.missles = [];

    AsteroidsView.prototype.asteroids = [];

    AsteroidsView.prototype.score = 0;

    AsteroidsView.prototype.highscore = 0;

    AsteroidsView.prototype.canMissle = true;

    AsteroidsView.prototype.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false
    };

    AsteroidsView.prototype.init = function() {
      this.makeElements();
      this.addListeners();
      this.render();
      return this.points(0);
    };

    AsteroidsView.prototype.makeElements = function() {
      this.stage = document.getElementsByClassName("game")[0];
      this.scoreEl = document.createElement("h1");
      this.highscoreEl = document.createElement("h1");
      this.scoreEl.setAttribute("class", "left score");
      this.highscoreEl.setAttribute("class", "right score");
      this.stage.appendChild(this.scoreEl);
      this.stage.appendChild(this.highscoreEl);
      this.player = document.createElement("div");
      this.player.setAttribute("class", "player");
      this.stage.appendChild(this.player);
      return this.player.m = {
        pref: {
          a: 0.075,
          s: 0.7,
          m: 0.1
        },
        pos: {
          scale: 10,
          x: 0,
          y: 0,
          a: 0
        },
        vel: {
          x: 0,
          y: 0,
          a: 0
        }
      };
    };

    AsteroidsView.prototype.addListeners = function() {
      window.addEventListener("keydown", (function(_this) {
        return function(e) {
          switch (e.keyCode) {
            case 38:
              return _this.keys.up = true;
            case 40:
              return _this.keys.down = true;
            case 37:
              return _this.keys.left = true;
            case 39:
              return _this.keys.right = true;
            case 32:
              return _this.keys.space = true;
          }
        };
      })(this));
      return window.addEventListener("keyup", (function(_this) {
        return function(e) {
          switch (e.keyCode) {
            case 38:
              return _this.keys.up = false;
            case 40:
              return _this.keys.down = false;
            case 37:
              return _this.keys.left = false;
            case 39:
              return _this.keys.right = false;
            case 32:
              return _this.keys.space = false;
          }
        };
      })(this));
    };

    AsteroidsView.prototype.keyEvents = function() {
      var angleX, angleY;
      if (this.keys.up === true) {
        angleX = Math.cos((this.player.m.pos.a - 90) * (Math.PI / 180));
        angleY = Math.sin((this.player.m.pos.a - 90) * (Math.PI / 180));
        this.player.m.vel.x += angleX * this.player.m.pref.a;
        this.player.m.vel.y += angleY * this.player.m.pref.a;
        this.explosion(this.player.m.pos.x + angleX * -14, this.player.m.pos.y + angleY * -14, 5, 6 + Math.round(12 * Math.random()));
      }
      if (this.keys.down === true) {
        angleX = Math.cos((this.player.m.pos.a - 90) * (Math.PI / 180));
        angleY = Math.sin((this.player.m.pos.a - 90) * (Math.PI / 180));
        this.player.m.vel.x -= angleX * this.player.m.pref.a;
        this.player.m.vel.y -= angleY * this.player.m.pref.a;
        this.explosion(this.player.m.pos.x + angleX * 1, this.player.m.pos.y + angleY * 1, 5, 6 + Math.round(12 * Math.random()));
      }
      if (this.keys.left === true) {
        this.player.m.vel.a -= this.player.m.pref.s;
      }
      if (this.keys.right === true) {
        this.player.m.vel.a += this.player.m.pref.s;
      }
      if (this.keys.space === true) {
        return this.missle(this.player.m.pos);
      }
    };

    AsteroidsView.prototype.missle = function(v) {
      var missle;
      if (this.canMissle === true) {
        this.canMissle = false;
        setTimeout((function(_this) {
          return function() {
            return _this.canMissle = true;
          };
        })(this), this.player.m.pref.m * 1000);
        missle = document.createElement("div");
        missle.setAttribute("class", "missle");
        missle.pos = {
          x: parseInt(v.x),
          y: parseInt(v.y),
          a: parseInt(v.a),
          scale: 4,
          speed: 12
        };
        missle.death = setTimeout((function(_this) {
          return function() {
            missle.parentNode.removeChild(missle);
            return _this.missles.splice(0, 1);
          };
        })(this), 3000);
        this.stage.appendChild(missle);
        this.missles.push(missle);
        if (this.missles.length > 12) {
          clearTimeout(this.missles[0].death);
          this.missles[0].parentNode.removeChild(this.missles[0]);
          return this.missles.splice(0, 1);
        }
      }
    };

    AsteroidsView.prototype.explosion = function(x, y, s, i) {
      var beeeen, n;
      n = 0;
      while (n < i) {
        setTimeout((function(_this) {
          return function() {
            return _this.explosion(x, y, s);
          };
        })(this), 30 + n * 30);
        n++;
      }
      x += Math.round((Math.random() - 0.5) * s);
      y += Math.round((Math.random() - 0.5) * s);
      beeeen = document.createElement("div");
      beeeen.setAttribute("class", "explosion");
      beeeen.style.marginTop = y + "px";
      beeeen.style.marginLeft = x + "px";
      beeeen.style.width = beeeen.style.height = s + "px";
      this.stage.appendChild(beeeen);
      return setTimeout((function(_this) {
        return function() {
          return beeeen.parentNode.removeChild(beeeen);
        };
      })(this), 500);
    };

    AsteroidsView.prototype.asteroid = function(x, y, type) {
      var asteroid, size, types;
      asteroid = document.createElement("div");
      types = ["a", "b", "c"];
      size = [80, 40, 25];
      if (type === void 0) {
        type = Math.floor(Math.random() * types.length);
      }
      asteroid.setAttribute("class", "asteroid type-" + types[type]);
      if (x === void 0 || y === void 0) {
        if (Math.random() > 0.5) {
          if (Math.random() > 0.5) {
            x = -window.innerWidth / 2 - 40;
          } else {
            x = window.innerWidth / 2 + 40;
          }
          y = Math.random() * window.innerHeight;
        } else {
          if (Math.random() > 0.5) {
            y = -window.innerHeight / 2 - 40;
          } else {
            y = window.innerHeight / 2 + 40;
          }
          x = Math.random() * window.innerWidth;
        }
      }
      asteroid.pos = {
        x: x,
        y: y,
        aInit: Math.random() * 360,
        a: Math.random() * 360,
        s: (Math.random() - 0.5) * 2,
        speed: Math.min(0.5 + Math.random() * 2 + ((Math.random() * this.score) / 2000), 5),
        health: (3 - type) * 2,
        scale: size[type]
      };
      this.stage.appendChild(asteroid);
      return this.asteroids.push(asteroid);
    };

    AsteroidsView.prototype.update = function() {
      var i, n, results;
      this.player.m.pos.x += this.player.m.vel.x;
      this.player.m.pos.y += this.player.m.vel.y;
      this.player.m.pos.a += this.player.m.vel.a;
      if (Math.abs(this.player.m.vel.a) < 0.1) {
        this.player.m.vel.a = 0;
      } else {
        this.player.m.vel.a = this.player.m.vel.a / 1.1;
      }
      this.player.m.pos = this.loop(this.player.m.pos);
      i = 0;
      while (i < this.missles.length) {
        if (this.missles[i] !== void 0) {
          this.missles[i].pos.x += Math.cos((this.missles[i].pos.a - 90) * (Math.PI / 180)) * this.missles[i].pos.speed;
          this.missles[i].pos.y += Math.sin((this.missles[i].pos.a - 90) * (Math.PI / 180)) * this.missles[i].pos.speed;
          if (Math.random() > 0.5) {
            this.explosion(this.missles[i].pos.x, this.missles[i].pos.y, 3 + Math.random() * 2);
          }
        }
        i++;
      }
      i = 0;
      results = [];
      while (i < this.asteroids.length) {
        if (this.asteroids[i] !== void 0) {
          this.asteroids[i].pos.x += Math.cos((this.asteroids[i].pos.aInit - 90) * (Math.PI / 180)) * this.asteroids[i].pos.speed;
          this.asteroids[i].pos.y += Math.sin((this.asteroids[i].pos.aInit - 90) * (Math.PI / 180)) * this.asteroids[i].pos.speed;
          this.asteroids[i].pos.a += this.asteroids[i].pos.s;
          this.asteroids[i].pos = this.loop(this.asteroids[i].pos);
        }
        n = 0;
        while (n < this.missles.length) {
          if (this.collision(this.missles[n].pos, this.asteroids[i].pos)) {
            this.asteroids[i].pos.health--;
            this.explosion(this.missles[n].pos.x, this.missles[n].pos.y, 15);
            this.missles[n].pos.y = 1000000;
            this.points(10);
          }
          n++;
        }
        if (this.collision(this.player.m.pos, this.asteroids[i].pos)) {
          this.killPlayer();
        }
        if (this.asteroids[i].pos.health < 0) {
          this.explosion(this.asteroids[i].pos.x, this.asteroids[i].pos.y, 25, 8);
          switch (this.asteroids[i].pos.scale) {
            case 80:
              this.asteroid(parseInt(this.asteroids[i].pos.x), parseInt(this.asteroids[i].pos.y), 1);
              this.asteroid(parseInt(this.asteroids[i].pos.x), parseInt(this.asteroids[i].pos.y), 1);
              this.points(500);
              break;
            case 40:
              this.asteroid(parseInt(this.asteroids[i].pos.x), parseInt(this.asteroids[i].pos.y), 2);
              this.asteroid(parseInt(this.asteroids[i].pos.x), parseInt(this.asteroids[i].pos.y), 2);
              this.asteroid(parseInt(this.asteroids[i].pos.x), parseInt(this.asteroids[i].pos.y), 2);
              this.points(250);
              break;
            default:
              this.points(100);
          }
          this.asteroids[i].parentNode.removeChild(this.asteroids[i]);
          this.asteroids.splice(i, 1);
        }
        results.push(i++);
      }
      return results;
    };

    AsteroidsView.prototype.killPlayer = function() {
      if (this.invincible === false || this.invincible === void 0) {
        this.explosion(this.player.m.pos.x, this.player.m.pos.y, 50, 4);
        this.player.m.pos.x = 0;
        this.player.m.pos.y = 0;
        this.player.m.vel.x = 0;
        this.player.m.vel.y = 0;
        this.invincible = true;
        this.points(0, true);
        return setTimeout((function(_this) {
          return function() {
            return _this.invincible = false;
          };
        })(this), 3000);
      }
    };

    AsteroidsView.prototype.render = function() {
      var i, n;
      this.update();
      this.keyEvents();
      this.player.setAttribute("style", this.pos(this.player.m.pos));
      i = 0;
      while (i < this.missles.length) {
        this.missles[i].setAttribute("style", this.pos(this.missles[i].pos));
        i++;
      }
      i = 0;
      while (i < this.asteroids.length) {
        this.asteroids[i].setAttribute("style", this.pos(this.asteroids[i].pos));
        i++;
      }
      if (this.asteroids.length < 5) {
        n = 1 + Math.floor(Math.random() * 4);
        while (n > 0) {
          this.asteroid();
          n--;
        }
      }
      return requestAnimationFrame(this.render);
    };

    AsteroidsView.prototype.points = function(add, reset) {
      if (reset === void 0) {
        this.score += add;
        this.highscore = Math.max(this.score, this.highscore);
      } else {
        this.score = 0;
      }
      this.scoreEl.innerHTML = this.score;
      return this.highscoreEl.innerHTML = this.highscore;
    };

    AsteroidsView.prototype.collision = function(one, two) {
      var xc, yc;
      xc = false;
      yc = false;
      if (Math.abs(one.x - two.x) < (0.75 * (one.scale + two.scale))) {
        xc = true;
      }
      if (Math.abs(one.y - two.y) < (0.75 * (one.scale + two.scale))) {
        yc = true;
      }
      if ((xc === yc && yc === true)) {
        return true;
      } else {
        return false;
      }
    };

    AsteroidsView.prototype.loop = function(v) {
      var buffer;
      buffer = 30;
      if (v.x > window.innerWidth / 2 + buffer) {
        v.x = -window.innerWidth / 2 - (buffer / 2);
      }
      if (v.x < -window.innerWidth / 2 - buffer) {
        v.x = window.innerWidth / 2 + (buffer / 2);
      }
      if (v.y > window.innerHeight / 2 + buffer) {
        v.y = -window.innerHeight / 2 - (buffer / 2);
      }
      if (v.y < -window.innerHeight / 2 - buffer) {
        v.y = window.innerHeight / 2 + (buffer / 2);
      }
      return v;
    };

    AsteroidsView.prototype.pos = function(v) {
      var s;
      s = "opacity: 1;";
      s += "-webkit-transform: translate(" + (Math.round(v.x)) + "px," + (Math.round(v.y)) + "px) rotate(" + (Math.round(v.a)) + "deg) ; ";
      s += "-moz-transform: translate(" + (Math.round(v.x)) + "px," + (Math.round(v.y)) + "px) rotate(" + (Math.round(v.a)) + "deg) ; ";
      s += "-ms-transform: translate(" + (Math.round(v.x)) + "px," + (Math.round(v.y)) + "px) rotate(" + (Math.round(v.a)) + "deg) ; ";
      s += "-o-transform: translate(" + (Math.round(v.x)) + "px," + (Math.round(v.y)) + "px) rotate(" + (Math.round(v.a)) + "deg) ; ";
      s += "transform: translate(" + (Math.round(v.x)) + "px," + (Math.round(v.y)) + "px) rotate(" + (Math.round(v.a)) + "deg) ;";
      return s;
    };

    return AsteroidsView;

  })();

  game = new AsteroidsView;

  game.init();

}).call(this);