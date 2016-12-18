function UIManager(world, viewSize) {
  var uiElements = [];

  this.add = function(uiElement) {
    uiElements.push(uiElement);
  }

  this.update = function() {
    var entity = world.getLocalPlayer().getEntity();
    camera(entity.pos.x - windowWidth / 2, entity.pos.y - windowHeight / 2, 0);
    for (var i = 0; i < uiElements.length; i++) {
      uiElements[i].update(world);
    }
  }

  this.render = function() {
    push();
    var entity = world.getLocalPlayer().getEntity();
    translate(entity.pos.x - windowWidth / 2, entity.pos.y - windowHeight / 2, 0);
    for (var i = 0; i < uiElements.length; i++) {
      uiElements[i].render(world);
    }
    pop();
  }
}
