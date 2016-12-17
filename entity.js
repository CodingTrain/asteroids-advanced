function Entity(pos, mass, radius) {
  this.pos = pos;
  this.mass = mass;
  this.heading = 0;
  this.r = radius;

  this.vel = createVector(0, 0);
  this.rotation = 0;

  this.force = createVector(0, 0);
  this.torque = 0;
}

Entity.prototype.update = function() {
  //Calculate acceleration from force
  var accel = this.force;
  accel.div(this.mass);
  var torAccel = this.torque / this.mass;

  this.vel.add(accel);
  this.rotation += torAccel;

  this.pos.add(this.vel);
  this.heading += this.rotation;

  this.edges();
  this.force.mult(0);
  this.torque = 0;
}

Entity.prototype.applyForce = function(force) {
  this.force.add(force);
}

Entity.prototype.applyTorque = function(torque) {
  this.torque += torque;
}

Entity.prototype.edges = function() {
  if (this.pos.x > width + this.r) {
    this.pos.x = -this.r;
  } else if (this.pos.x < -this.r) {
    this.pos.x = width + this.r;
  }
  if (this.pos.y > height + this.r) {
    this.pos.y = -this.r;
  } else if (this.pos.y < -this.r) {
    this.pos.y = height + this.r;
  }
}
