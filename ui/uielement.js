function UIElement(id, params) {
  this.pos = params.pos !== undefined ? params.pos : createVector(0, 0);
}

UIElement.prototype.update = function(world) {};
UIElement.prototype.render = function(world) {};
