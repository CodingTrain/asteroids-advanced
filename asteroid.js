// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Asteroid(pos, r, force, vertices) {
  //If position is not defined, assign a random position
  if (pos)
    pos = pos.copy();
  else
    pos = createVector(random(width), random(height));
  //If radius is not defined, assign a random radius
  if (!r)
    r = random(40, 60);

  if (!force)
    force = 5000;

  Entity.call(this, pos, 4 * r * r, r);

  var vForce = p5.Vector.random2D();
  vForce.mult(force);
  Entity.prototype.applyForce.call(this, vForce);

  if (vertices) {
    this.vertices = vertices;
    this.error = cos(TWO_PI / vertices);
  } else {
    var vertCount = floor(random(7, 15));
    var a = TWO_PI / vertCount;
    this.error = cos(a);
    this.vertices = [];
    for (var i = 0; i < vertCount; i++) {
      var vert = p5.Vector.fromAngle(a*i);
      vert.mult(r + random(-this.r * 0.2, this.r * 0.5));
      this.vertices.push(vert);
    }
  }

  Entity.prototype.applyTorque.call(this, random(-1, 1));

  this.render = function() {
    push();
    stroke(255);
    noFill();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    beginShape();
    for (var i = 0; i < this.vertices.length; i++) {
      vertex(this.vertices[i].x, this.vertices[i].y);
    }
    endShape(CLOSE);
    pop();
  }

  this.playSoundEffect = function(soundArray){
    soundArray[floor(random(0,soundArray.length))].play();
  }

  this.breakup = function() {
    if(this.r > 20) {
      var asteroid = new Asteroid(this.pos.copy(), this.r / 2, force * 0.5);
      var asteroid2 = new Asteroid(this.pos.copy(), this.r / 2, force * 0.5);
      return [asteroid, asteroid2];
    } else return [];
  }
}

Asteroid.prototype = Object.create(Entity.prototype);
