function Entity(params)
{
  this.id = -1;
  this.canCollide = true;
  this.dead = false;
  this.pos = params.pos;
  this.r = params.r;
  this.heading = 0;
  this.rotation = 0;
  this.vel = createVector(0, 0);
  this.accelMagnitude = 0;
  this.owner = params.owner !== undefined ? params.owner : -1;
}

Entity.prototype.registerId = function(id) {
  this.id = id;
}

Entity.prototype.setAccel = function(magnitude)
{
  this.accelMagnitude = magnitude;
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

Entity.prototype.setRotation = function(rot) {
  this.rotation = rot;
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

  this.heading += this.rotation;
  // Accelerate using the heading and the accelMagnitude
  var force = p5.Vector.fromAngle(this.heading);
  force.mult(this.accelMagnitude);
  this.vel.add(force);

  this.pos.add(this.vel);
  this.edges();
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
