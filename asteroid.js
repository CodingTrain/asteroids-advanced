// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Asteroid(world, params) {
  var pos = params.pos !== undefined ? params.pos : createVector(random(width), random(height));
  var levelmanager = params.levelmanager;
  Entity.call(this, pos, params.r !== undefined ? params.r : random(40, 60));
  this.size = params.size !== undefined ? params.size : 1;
  this.vel = p5.Vector.random2D();
  this.total = floor(random(7, 15));
  this.offset = [];
  levelmanager.recordAsteroidCreation();
  Entity.prototype.setRotation.call(this, random(-0.03, 0.03));
  for (var i = 0; i < this.total; i++) {
    this.offset[i] = random(-this.r * 0.75, 0);
  }

  // Smaller asteroids go a bit faster.
  switch(this.size) {
    case 0:
      this.vel.mult(2); break;
    case 1:
      this.vel.mult(1.5); break;
  }

  this.render = function() {
    push();
    stroke(255);
    noFill();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    beginShape();
    for (var i = 0; i < this.total; i++) {
      var angle = map(i, 0, this.total, 0, TWO_PI);
      var r = this.r + this.offset[i];
      vertex(r * cos(angle), r * sin(angle));
    }
    endShape(CLOSE);
    pop();
  }

  this.vertices = function() {
    var vertices = []
    for(var i = 0; i < this.total; i++) {
      var angle = this.heading + map(i, 0, this.total, 0, TWO_PI);
      var r = this.r + this.offset[i];
      vertices.push(p5.Vector.add(createVector(r * cos(angle), r * sin(angle)), this.pos));
    }

    return vertices;
  }

  // Asteroid only cares about lasers and they do the check.
  this.collides = function() {}

  this.collision = function(entity) {
    if (!this.dead && entity.toString() === "[object Laser]") {
      this.dead = true;
      playSoundEffect(explosionSoundEffects[floor(random(0,explosionSoundEffects.length))]);
      if (this.size > 0) {
        var scope = this;
        world.addEndFrameTask(function() {
          world.createEntity(Asteroid, { pos: scope.pos.copy(), r: scope.r * 0.5, size: scope.size - 1, levelmanager: levelmanager });
          world.createEntity(Asteroid, { pos: scope.pos.copy(), r: scope.r * 0.5, size: scope.size - 1, levelmanager: levelmanager });
        });
      }

      levelmanager.recordKill(this);
    }
  }

  this.toString = function() { return "[object Asteroid]"; }
}

Asteroid.prototype = Object.create(Entity.prototype);
