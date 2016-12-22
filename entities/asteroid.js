// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Asteroid(world, params) {
  var levelmanager = params.levelmanager;
  params.pos = params.pos !== undefined ? params.pos : createVector(random(-world.halfwidth, world.halfwidth), random(-world.halfheight, world.halfheight));
  params.r = params.r !== undefined ? params.r : random(60, 80);
  params.mass = params.mass !== undefined ? params.mass : PI * params.r * params.r;
  Entity.call(this, params);
  this.vel = params.vel !== undefined ? params.vel : createVector(0, 0);
  Entity.prototype.applyForce.call(this, params.force !== undefined ? params.force : p5.Vector.random2D().mult(5000));
  Entity.prototype.applyTorque.call(this, random(-0.03, 0.03));
  this.heading = params.heading !== undefined ? params.heading : 0;
  this.c = params.c !== undefined ? params.c : color(255);
  const minArea = 600;

  vertices = [];
  if (params.vertices === undefined) {
    this.total = floor(random(7, 15));
    var range = this.r * 0.5;
    for (var i = 0; i < this.total; i++) {
      var angle = map(i, 0, this.total, 0, TWO_PI);
      var r = this.r - random(0, range);
      vertices.push(createVector(r * cos(angle), r * sin(angle)));
    }
  } else {
    this.total = params.vertices.length;
    vertices = params.vertices;
  }
  this.shape = new Shape(vertices);
  levelmanager.recordAsteroidCreation();

  if (this.shape.area() > minArea) {
    var error = abs((PI - this.shape.area() / (this.r * this.r)) / PI);
    if (error > 0.75) {
      this.canCollide = false;
      this.dead = true;
      this.splitAt(undefined, levelmanager);
      levelmanager.recordKill(this, -1);
    }
  } else {
    this.shape.breakAnime(30);
    this.canCollide = false;
    this.rotation = 0;
    levelmanager.recordKill(this, -1);
  }

  this.render = function() {
    push();
    strokeWeight(3);
    colorMode(RGB);
    noFill(50);
    if (this.canCollide) {
      stroke(255);
    } else {
      stroke(red(this.c), green(this.c), blue(this.c), this.shape.fade());
    }
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    if (!this.shape.draw()) this.dead = true;
    pop();
  }

  this.collides = function() {}

  this.collision = function(entity) {
    if (!this.dead && entity.toString() === "[object Laser]") {
      playSoundEffect(explosionSoundEffects[floor(random(0, explosionSoundEffects.length))]);

      this.c = entity.c;
      if (this.shape.area() < minArea * 2) {
        this.shape.breakAnime();
        this.canCollide = false;
        this.rotation = 0;
      } else {
        this.dead = true;
        this.splitAt(p5.Vector.sub(entity.pos, this.pos).rotate(-this.heading), levelmanager);
      }

      levelmanager.recordKill(this, entity.owner);
    }
  }

  this.globalVertices = function() {
    return this.shape.globalVertices(this.pos, this.heading);
  }

  this.toString = function() {
    return "[object Asteroid]";
  }
}


Asteroid.prototype = Object.create(Entity.prototype);

Asteroid.prototype.splitAt = function(impactPos, levelmanager) {
  var nearestIndex;

  if (impactPos !== undefined) {
    //find splitpoint and edge
    var angleVec = p5.Vector.fromAngle(impactPos.heading()).mult(this.r);
    for (var i = 0; i < this.shape.vertices.length; i++) {
      if (lineIntersect(createVector(0, 0), angleVec, this.shape.vertices[i], this.shape.vertices[(i + 1) % this.shape.vertices.length])) {
        nearestIndex = (i + 1) % this.shape.vertices.length;
        break;
      }
    }
  }

  if (nearestIndex === undefined) {
    var min_r = -1;
    for (var i = 0; i < this.shape.vertices.length; i++) {
      var r = this.shape.vertices[i].mag();
      if (min_r == -1 || r < min_r) {
        min_r = r;
        nearestIndex = i;
        impactPos = this.shape.vertices[i];
      }
    }
  }

  //reorder the array so the nearestIndex is now at index 0, makes it easier to split later
  this.shape.vertices = this.shape.vertices.slice(nearestIndex, this.shape.vertices.length).concat(this.shape.vertices.slice(0, nearestIndex));


  //calculate the vertices of a crack through the asteroid
  var crackVertices = [];

  //it consists of three vertices for nowthe impact position, one in the center of the asteroid and  and the point where a straight line would
  //intersect with the outline of the asteroid
  crackVertices.push(impactPos.copy());
  crackVertices.push(createVector(0, 0));
  var endIndex;
  var angleVec = p5.Vector.fromAngle(p5.Vector.sub(crackVertices[1], impactPos).heading());
  angleVec.mult(this.r * 2);
  angleVec.add(crackVertices[1]);
  for (var i = 1; i < this.shape.vertices.length - 1; i++) {
    if (lineIntersect(crackVertices[1], angleVec, this.shape.vertices[i], this.shape.vertices[i + 1])) {
      crackVertices.push(lineIntersectionPoint(crackVertices[1], angleVec, this.shape.vertices[i], this.shape.vertices[i + 1]));
      endIndex = i;
      break;
    }
  }

  //just a savety thingy incase lineIntersect didn't find anything ( which shouldn't happen anyways)
  if (crackVertices.length < 2) {
    endIndex = floor(this.shape.vertices.length / 2);
    crackVertices.push(angleVec);
  }

  Shape.smooth(crackVertices, false);

  //create two vertice arrays for the two new asteroids, first one will have a copy the original vertices
  //from index 0 to the end crack index plus the array of crack vertices in reversed order
  var asteroid1_vertices = [];
  for (var i = 0; i < endIndex + 1; i++) {
    asteroid1_vertices.push(this.shape.vertices[i].copy());
  }
  for (var i = crackVertices.length - 1; i > 0; i--) {
    asteroid1_vertices.push(crackVertices[i]);
  }

  //second one will have a copy of the original vertices starting from the end crack index to the end of
  //the array plus the array of crack vertices in original order
  var asteroid2_vertices = [];
  for (var i = endIndex + 1; i < this.shape.vertices.length; i++) {
    asteroid2_vertices.push(this.shape.vertices[i].copy());
  }
  for (var i = 0; i < crackVertices.length; i++) {
    asteroid2_vertices.push(crackVertices[i].copy());
  }

  //calculate the new center position and radius for both asteroids
  var pos1_offset = new p5.Vector(0, 0, 0),
    pos2_offset = new p5.Vector(0, 0, 0);
  var rad1 = -1,
    rad2 = -1;

  for (var i = 0; i < asteroid1_vertices.length; i++) {
    pos1_offset.add(asteroid1_vertices[i]);
  }
  pos1_offset.div(asteroid1_vertices.length);
  for (var i = 0; i < asteroid1_vertices.length; i++) {
    asteroid1_vertices[i].sub(pos1_offset);
    var r__ = asteroid1_vertices[i].mag();
    if (r__ > rad1) {
      rad1 = r__;
    }
  }
  pos1_offset.rotate(this.heading);

  for (var i = 0; i < asteroid2_vertices.length; i++) {
    pos2_offset.add(asteroid2_vertices[i]);
  }
  pos2_offset.div(asteroid2_vertices.length);
  for (var i = 0; i < asteroid2_vertices.length; i++) {
    asteroid2_vertices[i].sub(pos2_offset);
    var r__ = asteroid2_vertices[i].mag();
    if (r__ > rad2) {
      rad2 = r__;
    }
  }
  pos2_offset.rotate(this.heading);

  if (asteroid1_vertices.length < 7) {
    Shape.smooth(asteroid1_vertices);
  }
  if (asteroid2_vertices.length < 7) {
    Shape.smooth(asteroid2_vertices);
  }

  var scope = this;
  world.addEndFrameTask(function() {
    world.createEntity(Asteroid, {
      pos: p5.Vector.add(scope.pos, pos1_offset),
      r: rad1,
      vertices: asteroid1_vertices,
      vel: scope.vel.copy(),
      force: pos1_offset.normalize().mult(2000),
      heading: scope.heading,
      c: scope.c,
      levelmanager: levelmanager
    });
    world.createEntity(Asteroid, {
      pos: p5.Vector.add(scope.pos, pos2_offset),
      r: rad2,
      vertices: asteroid2_vertices,
      vel: scope.vel.copy(),
      force: pos2_offset.normalize().mult(2000),
      heading: scope.heading,
      c: scope.c,
      levelmanager: levelmanager
    });
  });
}
