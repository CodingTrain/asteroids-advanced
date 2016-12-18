// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Ship(world, params) {
  Entity.call(this, params);
  this.lives = params.lives !== undefined ? params.lives : 3;
  var shieldDuration = params.shieldDuration !== undefined ? params.shieldDuration : 180;
  this.shields = shieldDuration;
  this.brokenParts = [];
  var resetPos = this.pos.copy();
  var destroyFramesReset = 200;
  var respawnFramesReset = 300;
  var destroyFrames;
  var respawnFrames;
  this.shape = new Shape([
    createVector(-2/3 * this.r, -this.r),
    createVector(-2/3 * this.r, this.r),
    createVector(4/3 * this.r, 0)
  ]);

  var rateOfFire = 20;
  var lastShot = 0;
  var scope = this;

  var keys = {
    up: false,
    left: false,
    right: false,
    space: false,
    spacerepeat: false
  };

  this.registerId = function(id) {
    Entity.prototype.registerId.call(this, id);
    var scope = this;
    world.registerListener(this, " ".charCodeAt(0), function(char, code, press) { keys.spacerepeat = press; if (press) { keys.space = true; }});
    world.registerListener(this, RIGHT_ARROW, function(char, code, press) { keys.right = press; });
    world.registerListener(this, LEFT_ARROW, function(char, code, press) { keys.left = press; });
    world.registerListener(this, UP_ARROW, function(char, code, press) { keys.up = press; });
  }

  this.collides = function(entity) {
    if (this.shields > 0 ||
        entity.toString() !== "[object Asteroid]" ||
        !Entity.prototype.collides.call(this, entity)){
      return false;
    }

    var verts = this.globalVertices();
    var asteroid_vertices = entity.globalVertices();
    for(var i = 0; i < asteroid_vertices.length; i++) {
      for(var j = 0; j < verts.length; j++) {
        if(lineIntersect(verts[j], verts[(j + 1) % verts.length], asteroid_vertices[i], asteroid_vertices[(i + 1) % asteroid_vertices.length])) {
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
      if (this.lives === 0 && this.owner !== -1) {
        world.getPlayer(this.owner).dead = true;
      }

      this.canCollide = false;
      this.shape.breakAnime();
      respawnFrames = respawnFramesReset;
    }
  }

  this.regenShields = function() {
    this.shields = shieldDuration;
  }

  this.update = function() {

    if(this.canCollide) {

      this.setRotation((keys.left ? -0.08 : 0) + (keys.right ? 0.08 : 0));
      this.setAccel(keys.up ? 0.1 : 0);

      if (lastShot > 0) {
        lastShot--;
      } else if (keys.space || keys.spacerepeat) {
        world.addEndFrameTask(function (world) { world.createEntity(Laser,
          { pos: p5.Vector.fromAngle(scope.heading).mult(scope.r).add(scope.pos), heading: scope.heading, owner: scope.owner }); });
        keys.space = false;
        lastShot = rateOfFire;
      }

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
    if(!this.canCollide) {
      push();
      stroke(255, 255, 255, this.shape.fade());
      translate(this.pos.x, this.pos.y);
      rotate(this.heading);
      if(!this.shape.draw()) {
        this.reset();
        if (this.lives === 0) this.dead = true;
      }
      pop();
    } else {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.heading);
      noFill();
      var shieldCol = random(map(this.shields, 0, shieldDuration, 255, 0), 255);
      stroke(shieldCol, shieldCol, 255);
      this.shape.draw();
      if(this.accelMagnitude !== 0) {
        translate(-this.r, 0);
        rotate(random(PI / 4, 3 * PI / 4));
        line(0, 0, 0, 10);
      }
      pop();
    }
  }

  this.reset = function() {
    this.canCollide = true;
    this.regenShields();
    this.pos.set(resetPos.x, resetPos.y);
    this.vel.set(0, 0);
    this.lastShot = 0;
  }

  this.globalVertices = function() {
    return this.shape.globalVertices(this.pos, this.heading);
  }

  this.toString = function() { return "[object Ship]"; }
}

Ship.prototype = Object.create(Entity.prototype);
