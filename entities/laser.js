// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

var colors = [
  [248, 12, 18],
  [238, 17, 0],
  [255, 51, 17],
  [255, 68, 34],
  [255, 102, 68],
  [255, 153, 51],
  [254, 174, 45],
  [204, 187, 51],
  [208, 195, 16],
  [170, 204, 34],
  [105, 208, 37],
  [34, 204, 170],
  [18, 189, 185],
  [17, 170, 187],
  [68, 68, 221],
  [51, 17, 187],
  [59, 12, 189],
  [68, 34, 153]
]

function Laser(world, params) {
  params.r = params.r !== undefined ? params.r : 4;
  Entity.call(this, params);

  this.vel = p5.Vector.fromAngle(params.heading).mult(40);
  this.vel.add(params.initialVel);
  this.color = colors[floor(random(0, colors.length - 1))];
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
    stroke(this.color[0], this.color[1], this.color[2], 55 + 200 * this.duration / maxDuration);
    strokeWeight(this.r);
    var halfLine = this.vel.copy();
    halfLine.mult(0.5);
    line(-halfLine.x, -halfLine.y, halfLine.x, halfLine.y);
    pop();
  }


  this.collides = function(entity) {
    var tail = p5.Vector.sub(this.pos, this.vel);
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
