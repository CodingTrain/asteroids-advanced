// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Asteroid(world, params) {
  var levelmanager = params.levelmanager;
  params.pos = params.pos !== undefined ? params.pos : createVector(random(-world.halfwidth, world.halfwidth), random(-world.halfheight, world.halfheight));
  params.r = params.r !== undefined ? params.r : random(40, 60);
  Entity.call(this, params);
  this.size = params.size !== undefined ? params.size : 1;
  this.vel = p5.Vector.random2D();

  var total = floor(random(7, 15));
  var range = this.r * 0.5;
  vertices = [];
  for (var i = 0; i < total; i++) {
    var angle = map(i, 0, total, 0, TWO_PI);
    r = this.r - random(0, range);
    vertices.push(createVector(r * cos(angle), r * sin(angle)));
  }
  this.shape = new Shape(vertices);
  levelmanager.recordAsteroidCreation();
  Entity.prototype.setRotation.call(this, random(-0.03, 0.03));

  // Smaller asteroids go a bit faster.
  switch(this.size) {
    case 0:
      this.vel.mult(2); break;
    case 1:
      this.vel.mult(1.5); break;
  }

  this.render = function() {
    push();
    stroke(255, 255, 255, this.shape.fade());
    noFill();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    if (!this.shape.draw()) this.dead = true;
    pop();
  }

  this.collides = function() {}

  this.collision = function(entity) {
    if (!this.dead && entity.toString() === "[object Laser]") {
      this.shape.breakAnime();
      this.canCollide = false;
      this.rotation = 0;
      playSoundEffect(explosionSoundEffects[floor(random(0,explosionSoundEffects.length))]);
      if (this.size > 0) {
        var scope = this;
        world.addEndFrameTask(function() {
          world.createEntity(Asteroid, { pos: scope.pos.copy(), r: scope.r * 0.5, size: scope.size - 1, levelmanager: levelmanager });
          world.createEntity(Asteroid, { pos: scope.pos.copy(), r: scope.r * 0.5, size: scope.size - 1, levelmanager: levelmanager });
        });
      }

      levelmanager.recordKill(this, entity.owner);
    }
  }

  this.globalVertices = function() {
    return this.shape.globalVertices(this.pos, this.heading);
  }

  this.toString = function() { return "[object Asteroid]"; }
}

Asteroid.prototype = Object.create(Entity.prototype);
