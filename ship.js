// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Ship(pos, r, shieldDuration) {
  Entity.call(this, width / 2, height / 2, 20);
  this.inFlux = false;
  this.lives = 3;
  this.shields = shieldDuration;
  var destroyFramesReset = 200;
  var respawnFramesReset = 300;
  var destroyFrames;
  var respawnFrames;

  this.registerId = function(id) {
    Entity.prototype.registerId.call(this, id);
    var scope = this;
    input.registerListener(id, " ".charCodeAt(0), function(char, code, press) {
      if (!press) {
        return;
      }

      var laser = new Laser(p5.Vector.fromAngle(scope.heading).mult(scope.r).add(scope.pos), scope.heading);
      playSoundEffect(laserSoundEffect);
      entitymanager.add(laser);
    });
    input.registerListener(id, RIGHT_ARROW, function(char, code, press) { scope.setRotation(press ? 0.08 : 0); });
    input.registerListener(id, LEFT_ARROW, function(char, code, press) { scope.setRotation(press ? -0.08 : 0); });
    input.registerListener(id, UP_ARROW, function(char, code, press) { scope.setAccel(press ? 0.1 : 0); });
  }

  this.brokenParts = [];

  this.collides = function(entity) {
    if (this.inFlux || this.shields > 0 ||
        entity.toString() !== "[object Asteroid]" ||
        !Entity.prototype.collides.call(this, entity)){
      return false;
    }

    var vertices = [
      createVector(this.pos.x - 2/3 * this.r, this.pos.y - this.r),
      createVector(this.pos.x - 2/3 * this.r, this.pos.y + this.r),
      createVector(this.pos.x + 4/3 * this.r, this.pos.y + 0)
    ];
    var asteroid_vertices = entity.vertices();
    for(var i = 0; i < asteroid_vertices.length; i++) {
      for(var j = 0; j < vertices.length; j++) {
        var opposite = vertices.slice(0);
        opposite.splice(j, 1);
        if(lineIntersect(opposite[0], opposite[1], asteroid_vertices[i], asteroid_vertices[(i + 1) % asteroid_vertices.length])) {
          return true;
        }
      }
    }
    return false;
  }

  this.collision = function(entity) {
    if (entity.toString(entity) === "[object Asteroid]") {
      this.lives--;
      // TODO: Do something with this variable.
      if (this.lives === 0) {
        levelmanager.gameover = true;
      }

      this.inFlux = true;
      destroyFrames = destroyFramesReset;
      respawnFrames = respawnFramesReset;
      for(var i = 0; i < 4; i++) {
        this.brokenParts[i] = {
          pos: this.pos.copy(),
          vel: p5.Vector.random2D(),
          heading: random(0, 360),
          rot: random(-0.07, 0.07)
        };
      }
    }
  }

  this.regenShields = function() {
    this.shields = shieldDuration;
  }

  this.update = function() {
    if (destroyFrames > 0) {
      for(var i = 0; i < this.brokenParts.length; i++) {
        this.brokenParts[i].pos.add(this.brokenParts[i].vel);
        this.brokenParts[i].heading += this.brokenParts[i].rot;
      }
    } else if (destroyFrames === 0) {
      this.brokenParts.length = 0;
      if (this.lives === 0) {
        this.inFlux = false;
        this.dead = true;
      }
    }

    if(this.inFlux) {
      if (this.lives !== 0 && respawnFrames <= 0) {
        this.inFlux = false;
        this.regenShields();
        this.brokenParts.length = 0;
        this.pos.set(width / 2, height / 2);
        this.vel.set(0, 0);
      }

      respawnFrames--;
    } else {
      if (Entity.prototype.update.call(this)) {
        input.deregisterListener(this.id, " ".charCodeAt(0));
        input.deregisterListener(this.id, RIGHT_ARROW);
        input.deregisterListener(this.id, LEFT_ARROW);
        input.deregisterListener(this.id, UP_ARROW);
        return true;
      }

      this.vel.mult(0.99);
      if (this.shields > 0) {
        this.shields--;
      }
    }
  }

  this.render = function() {
    if(this.inFlux) {
      if (destroyFrames > 0) {
        for(var i = 0; i < this.brokenParts.length; i++) {
          push();
          stroke(floor(255 * (destroyFrames / destroyFramesReset)));
          var bp = this.brokenParts[i];
          translate(bp.pos.x, bp.pos.y);
          rotate(bp.heading);
          line(-this.r / 2, -this.r / 2, this.r / 2, this.r / 2);
          pop();
        }
        destroyFrames--;
      }
    } else {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.heading);
      fill(0);
      var shieldCol = random(map(this.shields, 0, shieldDuration, 255, 0), 255);
      stroke(shieldCol, shieldCol, 255);
      triangle(-2 / 3 * this.r, -this.r, -2 / 3 * this.r, this.r, 4 / 3 * this.r, 0);
      if(this.accelMagnitude !== 0) {
        translate(-this.r, 0);
        rotate(random(PI / 4, 3 * PI / 4));
        line(0, 0, 0, 10);
      }

      pop();
    }
  }

  this.toString = function() { return "[object Ship]"; }
}

Ship.prototype = Object.create(Entity.prototype);
