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
  this.velDrag = 0;
  this.rotDrag = 0;
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

Entity.prototype.momentum = function() {
  var momentum = this.vel.copy();
  momentum.mult(this.mass);
  return momentum;
}

Entity.calculateMoment = function(localPoint, force) {
  cross(force, localPoint) / local_point.mag();
}

Entity.calculateDragCo = function(maxForce, maxVel) {
  return maxForce / (maxVel * maxVel)
}

Entity.prototype.collides = function(entity) {
  if (!(this.canCollide && entity.canCollide)) return false;
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

  if (this.velDrag != 0) {
    var drag = this.vel.copy();
    drag.mult(-this.velDrag * this.vel.mag());
    this.applyForce(drag);
  }

  if (this.rotDrag != 0) {
    var drag = this.rotDrag * this.rotation * this.rotation;
    drag = this.rotation > 0 ? -drag : drag;
    this.applyTorque(drag);
  }

  var accel = this.force.div(this.mass);
  var rotAccel = this.torque / this.mass;

  this.vel.add(accel);
  this.rotation += rotAccel;

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
