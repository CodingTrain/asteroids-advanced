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
  this.thrustPower = params.thrustPower !== undefined ? params.thrustPower : {
    forward: 200,
    backward: 100,
    left: 180,
    right: 180,
    stabilization: 200,
    rotation: 80
  };
  this.maxThrust = params.maxThrust !== undefined ? params.maxThrust : 100;
  this.rotDragEnabled = false;
  this.velDragEnabled = true;
  this.velDrag = Entity.calculateDragCo(this.maxThrust, 15);
  this.rotMuEnabled = false;
  this.velMuEnabled = true;
  this.velMu = 1 / this.thrustPower.stabilization;
  var front = createVector(4 / 3 * this.r, 0);
  this.shape = new Shape([
    createVector(-2 / 3 * this.r, -this.r),
    createVector(-2 / 3 * this.r, this.r),
    front
  ]);

  var fireColors = [];
  for (var i = 0; i * 10 <= 255; i++) {
    fireColors[i] = "rgb(255," + i * 10 + ",0)";
  }

  var stabToggle = true;
  var rateOfFire = 20;
  var lastShot = 0;
  var scope = this;

  var inputs = {
    targetPoint: createVector(1, 0),
    thrustVector: createVector(0, 0),
    laser: false
  };
  
  this.setInputs = function(targetPoint, thrustForward, thrustBackwards, thrustLeft, thrustRight, stabilizationToggle, laser) {
    var upRight = p5.Vector.dot(p5.Vector.fromAngle(this.heading), createVector(0, -1));
    inputs.thrustVector = createVector(
      (thrustForward ? this.thrustPower.forward : 0) + (thrustBackwards ? -this.thrustPower.backward : 0),
      (upRight > -0.259 ? 1 : -1) * ((thrustRight ? this.thrustPower.right : 0) + (thrustLeft ? -this.thrustPower.left : 0))
    );
    inputs.targetPoint = targetPoint;
    inputs.laser = laser;

    if (stabilizationToggle) {
      stabToggle = !stabToggle;
    }
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
      var force = p5.Vector.sub(inputs.targetPoint.copy(), front.copy().rotate(this.heading));
      force.normalize();
      force.mult(this.thrustPower.rotation);
      this.applyTorque(Entity.calculateMoment(inputs.targetPoint, force));
      var sinTheta = cross(p5.Vector.fromAngle(this.heading), force) / force.mag();
      if (abs(sin(this.predictRotation())) > abs(sinTheta)) {
        this.torque = 0;
        this.rotation = 0;
        this.heading += asin(sinTheta);
      }

      this.applyForce(inputs.thrustVector.rotate(this.heading));

      if (lastShot > 0) {
        lastShot--;
      } else if (inputs.laser) {
        world.addEndFrameTask(function(world) {
          world.createEntity(Laser, {
            pos: p5.Vector.fromAngle(scope.heading).mult(scope.r).add(scope.pos),
            heading: scope.heading,
            initialVel: scope.vel,
            owner: scope.owner
          });
        });
        lastShot = rateOfFire;
      }

      this.velMuEnabled = stabToggle && (inputs.thrustVector.x === 0 && inputs.thrustVector.y === 0);
      if (Entity.prototype.update.call(this)) {
        return true;
      }

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
