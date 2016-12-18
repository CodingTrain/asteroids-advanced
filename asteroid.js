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

  var max_r = -1;
  this.vertices = [];
  for (var i = 0; i < this.total; i++) {
    var angle = map(i, 0, this.total, 0, TWO_PI);
    r = this.r + random(-this.r * 0.2, this.r * 0.5);
    this.vertices.push(createVector(r * cos(angle), r * sin(angle)));
    if(r > max_r) {
      max_r = r;
    }
  }
  levelmanager.recordAsteroidCreation();
  Entity.prototype.setRotation.call(this, random(-0.03, 0.03));
  this.r = max_r;


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
    for (var i = 0; i < this.vertices.length; i++) {
      vertex(this.vertices[i].x, this.vertices[i].y);
    }
    endShape(CLOSE);
    pop();
  }

  this.globalVertices = function() {
    var glob_vertices = [];
    for (var i = 0; i < this.vertices.length; i++) {
      glob_vertices.push(this.vertices[i].copy().rotate(this.heading).add(this.pos));
    }
    return glob_vertices;
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