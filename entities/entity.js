function Entity(params) {
  this.id = -1;
  this.canCollide = true;
  this.dead = false;
  this.mass = params.mass !== undefined ? params.mass : 1;
  this.heading = 0;
  this.pos = params.pos !== undefined ? params.pos : createVector(0, 0);
  this.r = params.r !== undefined ? params.r : 1;
  this.rotation = 0;
  this.vel = createVector(0, 0);
  this.force = createVector(0, 0);
  this.torque = 0;
  this.velMu = 0;
  this.velMuEnabled = true;
  this.rotMu = 0;
  this.rotMuEnabled = true;
  this.velDrag = 0;
  this.velDragEnabled = true;
  this.rotDrag = 0;
  this.rotDragEnabled = true;
  this.owner = params.owner !== undefined ? params.owner : -1;
}

Entity.prototype.registerId = function(id) {
  this.id = id;
}

Entity.prototype.edges = function() {
  if (this.pos.x > world.halfwidth) {
    this.pos.x = this.pos.x % world.halfwidth - world.halfwidth;
  } else if (this.pos.x < -world.halfwidth) {
    this.pos.x = this.pos.x % world.halfwidth + world.halfwidth;
  }
  if (this.pos.y > world.halfheight) {
    this.pos.y = this.pos.y % world.halfwidth - world.halfheight;
  } else if (this.pos.y < -world.halfheight) {
    this.pos.y = this.pos.y % world.halfwidth + world.halfheight;
  }
}

Entity.prototype.applyForce = function(force) {
  this.force.add(force);
}

Entity.prototype.applyTorque = function(torque) {
  this.torque += torque;
}

Entity.prototype.predictVelocity = function() {
  var accel = this.force.copy().div(this.mass);
  return this.vel.copy().add(accel);
}

Entity.prototype.predictRotation = function() {
  var rotAccel = this.torque / this.mass;
  return this.rotation + rotAccel;
}

Entity.prototype.momentum = function() {
  var momentum = this.vel.copy();
  momentum.mult(this.mass);
  return momentum;
}

Entity.calculateMoment = function(localPoint, force) {
  return cross(localPoint, force) / localPoint.mag();
}

Entity.calculateDragCo = function(maxForce, maxVel) {
  return maxForce / (maxVel * maxVel);
}

Entity.prototype.collides = function(entity) {
  if (!(this.canCollide && entity.canCollide)) {
    return false;
  }

  var dx = this.pos.x - entity.pos.x;
  var dy = this.pos.y - entity.pos.y;
  var dr = this.r + entity.r;
  return dx * dx + dy * dy <= dr * dr;
}

Entity.prototype.collision = function() {}

Entity.prototype.update = function() {
  if (this.dead) {
    return true;
  }

  var R = this.mass * 9.81;
  if (this.velMuEnabled && this.velMu > 0) {
    var F = this.velMu * R;
    if (this.vel.magSq() > 0) {
      var normVel = this.vel.copy().normalize();
      var frict = normVel.copy().mult(-F);
      this.applyForce(frict);
      if (p5.Vector.dot(this.vel, this.predictVelocity()) < 0) {
        frict.mult(-1);
        var force = normVel;
        force.mult(-p5.Vector.dot(normVel, this.force.copy()));
        this.applyForce(frict);
        this.applyForce(force);
        this.vel.mult(0);
      }
    } else if (this.force.magSq() > F * F) {
      this.applyForce(this.force.copy().normalize().mult(-F));
    } else {
      this.force.mult(0);
    }
  }

  if (this.rotMuEnabled && this.rotMu > 0) {
    var F = this.rotMu * R;
    if (this.rotation != 0) {
      this.applyTorque(-F * (this.rotation > 0 ? 1 : -1));
      if ((this.rotation > 0) != (this.predictRotation() > 0)) {
        this.torque = 0;
        this.rotation = 0;
      }
    } else if (abs(this.torque) > F) {
      this.applyTorque(-F * (this.torque > 0 ? 1 : -1));
    } else {
      this.torque = 0;
    }
  }

  if (this.velDragEnabled && this.velDrag != 0) {
    this.applyForce(this.vel.copy().mult(-this.velDrag * this.vel.mag()));
  }

  if (this.rotDragEnabled && this.rotDrag > 0) {
    var drag = this.rotDrag * this.rotation * this.rotation;
    this.applyTorque(this.rotation > 0 ? -drag : drag);
  }

  // Acceleration
  this.vel.add(this.force.div(this.mass));
  // Rotational Acceleration
  this.rotation += this.torque / this.mass;

  this.pos.add(this.vel);
  this.heading += this.rotation;

  this.edges();
  this.force.mult(0);
  this.torque = 0;
}

Entity.prototype.render = function() {
  push();
  translate(this.pos.x, this.pos.y);
  rotate(this.heading);
  fill(0);
  stroke(255);
  ellipse(this.pos.x, this.pos.y, this.r);
  pop();
}
