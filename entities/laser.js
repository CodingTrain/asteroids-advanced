// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Laser(world, params) {
  params.r = params.r !== undefined ? params.r : 4;
  Entity.call(this, params);

  this.vel = p5.Vector.fromAngle(params.heading).mult(40);
  this.vel.add(params.initialVel);
  this.c = params.c ? params.c : color(255);
  this.duration = params.duration !== undefined ? params.duration : 20;
  var maxDuration = this.duration;

  playSoundEffect(laserSoundEffect[floor(random(3))]);

  this.update = function() {
    this.duration--;
    return Entity.prototype.update.call(this) || this.duration < 0;
  }

  this.render = function() {
    push();
    translate(this.pos.x, this.pos.y);
    colorMode(RGB);
    stroke(red(this.c), green(this.c), blue(this.c), 55 + 200 * this.duration / maxDuration);
    strokeWeight(this.r);
    strokeCap(SQUARE);
    var halfLine = this.vel.copy();
    halfLine.mult(0.5);
    line(-halfLine.x, -halfLine.y, halfLine.x, halfLine.y);
    pop();
  }


  this.collides = function(entity) {
    var tail = p5.Vector.sub(this.pos, this.vel.copy().mult(1.2));
    if (entity.toString() !== "[object Asteroid]"
      || !Entity.prototype.collides.call(this, entity) || !lineIntersectCircle(this.pos, tail, entity.pos, entity.r)) {
      return false;
    }

    var verts = entity.shape.vertices;
    for (var i = 0, j = entity.total - 1; i < entity.total; j = i++)
      if (lineIntersect(Entity.globalPoint(entity, verts[i]), Entity.globalPoint(entity, verts[j]), this.pos, tail)) return true;
    return false;
  }

  this.collision = function(entity) {
    if (entity.toString() === "[object Asteroid]") {
      this.dead = true;
    }
  }

  this.toString = function() {
    return "[object Laser]";
  }
}

Laser.prototype = Object.create(Entity.prototype);
