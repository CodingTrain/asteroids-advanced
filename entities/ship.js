// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Ship(world, params) {
  Entity.call(this, params);
  this.lives = params.lives !== undefined ? params.lives : 3;
  var shieldDuration = params.shieldDuration !== undefined ? params.shieldDuration : 180;
  this.shields = shieldDuration;
  var resetPos = this.pos.copy();
  var respawnFramesReset = 300;
  var respawnFrames;
  this.mass = 1000;
  this.rotForce = 10;
  this.thrustForce = 200;
  this.rotDrag = Entity.calculateDragCo(this.rotForce, 0.07);
  this.velDrag = Entity.calculateDragCo(this.thrustForce, 20);
  this.shape = new Shape([
    createVector(-2 / 3 * this.r, -this.r),
    createVector(-2 / 3 * this.r, this.r),
    createVector(4 / 3 * this.r, 0)
  ]);

  var fireColors = [];
  for (var i = 0; i * 10 <= 255; i++) {
    fireColors[i] = "rgb(255," + i * 10 + ",0)";
  }

  var rateOfFire = 20;
  var lastShot = 0;
  var scope = this;

  var inputs = {
    thrust: false,
    rotateleft: false,
    rotateright: false,
    laser: false
  };

  this.setInputs = function(thrust, rotateleft, rotateright, laser) {
    inputs.thrust = thrust;
    inputs.rotateleft = rotateleft;
    inputs.rotateright = rotateright;
    inputs.laser = laser;
  }

  this.registerId = function(id) {
    Entity.prototype.registerId.call(this, id);
  }

  this.collides = function(entity) {
    if (this.shields > 0 ||
      entity.toString() !== "[object Asteroid]" ||
      !Entity.prototype.collides.call(this, entity)) {
      return false;
    }

    var verts = this.globalVertices();
    var asteroid_vertices = entity.globalVertices();
    for (var i = 0; i < asteroid_vertices.length; i++) {
      for (var j = 0; j < verts.length; j++) {
        if (lineIntersect(verts[j], verts[(j + 1) % verts.length], asteroid_vertices[i], asteroid_vertices[(i + 1) % asteroid_vertices.length])) {
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

    if (this.canCollide) {
      this.applyTorque((inputs.rotateleft ? -this.rotForce : 0) + (inputs.rotateright ? this.rotForce : 0));
      var thrust = p5.Vector.fromAngle(this.heading);
      thrust.mult(inputs.thrust ? this.thrustForce : 0)
      this.applyForce(thrust);

      if (lastShot > 0) {
        lastShot--;
      } else if (inputs.laser) {
        world.addEndFrameTask(function(world) {
          world.createEntity(Laser, {
            pos: p5.Vector.fromAngle(scope.heading).mult(scope.r).add(scope.pos),
            heading: scope.heading,
            owner: scope.owner
          });
        });
        lastShot = rateOfFire;
      }

      if (Entity.prototype.update.call(this)) {
        return true;
      }

      this.vel.mult(0.99);
      if (this.shields > 0) {
        this.shields--;
      }

    }
  }

  this.render = function() {
    if (!this.canCollide) {
      push();
      stroke(255, 255, 255, this.shape.fade());
      translate(this.pos.x, this.pos.y);
      rotate(this.heading);
      if (!this.shape.draw()) {
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
      if (inputs.thrust) {
        translate(-this.r, 0);
        rotate(random(PI / 4, 3 * PI / 4));
        stroke(fireColors[floor(random(fireColors.length))]);
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

  this.toString = function() {
    return "[object Ship]";
  }
}

Ship.prototype = Object.create(Entity.prototype);
