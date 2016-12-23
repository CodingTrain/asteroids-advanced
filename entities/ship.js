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
  var maxThrust = params.maxThrust !== undefined ? params.maxThrust : 720000;
  this.thrustPower = params.thrustPower !== undefined ? params.thrustPower : {
    forward: maxThrust,
    backward: maxThrust * 0.5,
    left: maxThrust * 0.9,
    right: maxThrust * 0.9,
    stabilization: maxThrust,
    rotation: maxThrust * 0.4
  };
  this.coefficients = {
    velMu: this.calculateMu(this.thrustPower.stabilization),
    rotMu: 0,
    velDrag: Entity.calculateDragCo(maxThrust, 1000),
    rotDrag: 0
  }
  this.velMu = this.coefficients.velMu;
  this.velDrag = this.coefficients.velDrag;
  this.front = createVector(4 / 3 * this.r, 0);
  this.shape = new Shape([
    createVector(-2 / 3 * this.r, -this.r),
    createVector(-2 / 3 * this.r, this.r),
    this.front
  ]);
  this.colors = [
    color(243, 89 , 86 ),
    color(241, 197, 0  ),
    color(73 , 187, 108),
    color(36 , 148, 193),
    color(150, 89 , 167)
  ]
  this.colorIndex = 0;

  var fireColors = [];
  for (var i = 0; i * 10 <= 255; i++) {
    fireColors[i] = "rgb(255," + i * 10 + ",0)";
  }

  var stabToggle = true;
  var rateOfFire = 40;
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
    for (var x = 0, y = verts.length - 1; x < verts.length; y = x++) {
      if (Shape.contains(asteroid_vertices, verts[x])) return true;
      for (var i = 0, j = asteroid_vertices.length - 1; i < asteroid_vertices.length; j = i++) {
        if (lineIntersect(verts[x], verts[y], asteroid_vertices[i], asteroid_vertices[j])) {
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
      var force = p5.Vector.sub(inputs.targetPoint.copy(), this.front.copy().rotate(this.heading));
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
        var temp = this.colors[0];
        world.addEndFrameTask(function(world) {
          world.createEntity(Laser, {
            pos: scope.front.copy().add(createVector(20, 0)).rotate(scope.heading).add(scope.pos),
            heading: scope.heading,
            c: scope.colors[scope.colorIndex],
            initialVel: scope.vel,
            owner: scope.owner
          });
          scope.colorIndex++;
          scope.colorIndex %= scope.colors.length;
        });
        lastShot = rateOfFire;
      }

      this.velMu = stabToggle && (inputs.thrustVector.x === 0 && inputs.thrustVector.y === 0) ? this.coefficients.velMu : 0;
      if (Entity.prototype.update.call(this)) {
        return true;
      }

      if (this.shields > 0) {
        this.shields--;
      }
    }
  }

  this.render = function() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    colorMode(RGB);
    noFill();
    strokeWeight(3);
    if (!this.canCollide) {
      strokeCap(ROUND);
      stroke(255, 255, 255, this.shape.fade());
      if (!this.shape.draw()) {
        this.reset();
        if (this.lives === 0) this.dead = true;
      }
    } else {
      var shieldCol = random(map(this.shields, 0, shieldDuration, 255, 0), 255);
      stroke(shieldCol, shieldCol, 255);
      this.shape.draw();
      if (inputs.thrust) {
        translate(-this.r, 0);
        rotate(random(PI / 4, 3 * PI / 4));
        stroke(fireColors[floor(random(fireColors.length))]);
        line(0, 0, 0, 10);
      }
    }
    pop();
  }

  this.reset = function() {
    this.canCollide = true;
    this.regenShields();
    this.pos.set(resetPos.x, resetPos.y);
    this.vel.set(0, 0);
    this.lastShot = 0;
  }

  this.globalVertices = function() {
    return Entity.prototype.globalVertices.call(this, this.shape.vertices);
  }

  this.toString = function() {
    return "[object Ship]";
  }
}

Ship.prototype = Object.create(Entity.prototype);
