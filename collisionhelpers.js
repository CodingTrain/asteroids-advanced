function cross(v1, v2) {
  return v1.x * v2.y - v2.x * v1.y;
}

//intersection between two closed of lines
function lineIntersect(l1v1, l1v2, l2v1, l2v2) {
  var base = p5.Vector.sub(l1v1, l2v1);
  var l1_vector = p5.Vector.sub(l1v2, l1v1);
  var l2_vector = p5.Vector.sub(l2v2, l2v1);
  var direction_cross = cross(l2_vector, l1_vector);
  var t = cross(base, l1_vector) / direction_cross;
  var u = cross(base, l2_vector) / direction_cross;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return true;
  } else {
    return false;
  }
}

//intersection between one infinite line determined by point and angle and a closed of line
function lineIntersect2(l1v1, angle, l2v1, l2v2) {
  var base = p5.Vector.sub(l1v1, l2v1);
  var l1_vector = p5.Vector.fromAngle(angle);
  var l2_vector = p5.Vector.sub(l2v2, l2v1);
  var direction_cross = cross(l2_vector, l1_vector);
  var t = cross(base, l1_vector) / direction_cross;
  if (t >= 0 && t <= 1) {
    return true;
  } else {
    return false;
  }
}

//intersection point between two infinite lines determined by two points each
function lineIntersectionPoint(p1, p2, p3, p4) {
  var d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (d === 0) {
    return undefined;
  }
  var px = (cross(p1, p2) * (p3.x - p4.x) - (p1.x - p2.x) * cross(p3, p4)) / d;
  var py = (cross(p1, p2) * (p3.y - p4.y) - (p1.y - p2.y) * cross(p3, p4)) / d;
  return createVector(px, py);
}
