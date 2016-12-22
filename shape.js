function Shape(vertices) {

  if (!vertices) vertices = [];

  this.vertices = vertices;
  this.frames = 100;
  this.frame = -1;
  this.speed = 0.5;
  this.spin = 0.1;
  this.seed = random(millis());

  this.breakAnime = function(frames, speed, spin) {
    if (frames && frames > 0) this.frames = frames;
    if (speed) this.speed = speed;
    if (spin) this.spin = spin;
    this.frame = 0;
  }

  this.fade = function() {
    if (this.frame < 0) return 255;
    else return 255 * (1 - this.frame / this.frames);
  }

  this.globalVertices = function(pos, heading) {
    var glob_vertices = [];
    for (var i = 0; i < this.vertices.length; i++) {
      var v = this.vertices[i].copy();
      v.rotate(heading);
      v.add(pos);
      glob_vertices.push(v);
    }
    return glob_vertices;
  }

  //calculates the area within a shape
  this.area = function() {
    return Shape.area(this.vertices);
  }

  //checks if the shape contains a specific point
  this.contains = function(pos) {
    var c = false;
    for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
      if (((this.vertices[i].y > pos.y) != (this.vertices[j].y > pos.y)) &&
        (pos.x < (this.vertices[j].x - this.vertices[i].x) * (pos.y - this.vertices[i].y) / (this.vertices[j].y - this.vertices[i].y) + this.vertices[i].x))
        c = !c;
    }
    return c;
  }

  this.draw = function() {

    if (this.frame < 0) {

      beginShape();
      for (var i = 0; i < this.vertices.length; i++) {
        vertex(this.vertices[i].x, this.vertices[i].y);
      }
      endShape(CLOSE);

    } else if (this.frame < this.frames) {

      push();

      var hRng = this.speed * 0.5;
      randomSeed(this.seed);

      for (var i = 0; i < this.vertices.length; i++) {
        var vertA = this.vertices[i];
        var vertB = this.vertices[(i + 1) % this.vertices.length];

        var rSpeed = this.speed + random(-hRng, hRng);
        var vAB = p5.Vector.sub(vertB, vertA);
        var cAB = p5.Vector.add(vertA, vertB);
        cAB.div(2);
        var trans = cAB.copy();
        trans.normalize();
        trans.mult(this.frame * rSpeed);
        trans.add(cAB);

        push();

        translate(trans.x, trans.y);
        rotate(this.frame * random(-this.spin / 2, this.spin / 2));
        line(-vAB.x / 2, -vAB.y / 2, vAB.x / 2, vAB.y / 2);

        pop();

      }

      pop();

      this.frame++;

    } else {
      this.frame = -1;
      return false;
    }
    return true;

  }

}

Shape.area = function(vertices) {
  var area = 0;
  for (var i = 0; i < vertices.length - 1; i++) {
    area += vertices[i].x * vertices[i + 1].y - vertices[i].y * vertices[i + 1].x;
  }
  return abs(area / 2);
}

Shape.smooth = function(vertices, loop_) {
  if (loop_ === undefined) {
    loop_ = true;
  }
  for (var i = 0; i < vertices.length - (loop_ ? 0 : 1); i += 2) {
    var v_ = createVector((vertices[i].x + vertices[(i + 1) % vertices.length].x) * 0.5 + random(10), (vertices[i].y + vertices[(i + 1) % vertices.length].y) * 0.5 + random(10));
    vertices.splice(i + 1, 0, v_);
  }
}
