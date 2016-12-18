function PlayerControls(id) {
  UIElement.call(this, id, { pos: createVector(0, 0) });
  var keys = {
    right: false,
    left: false,
    up: false,
    space: false,
    spacerepeat: false
  };

  this.update = function(world) {
    world.getLocalPlayer().getEntity().setInputs(
      keys.up,
      keys.left,
      keys.right,
      keys.space || keys.space.repeat
    );
    keys.space = false;
  }

  var scope = this;
  world.registerListener(id, " ".charCodeAt(0), function(char, code, press) { keys.spacerepeat = press; if (press) { keys.space = true; }});
  world.registerListener(id, RIGHT_ARROW, function(char, code, press) { keys.right = press; });
  world.registerListener(id, LEFT_ARROW, function(char, code, press) { keys.left = press; });
  world.registerListener(id, UP_ARROW, function(char, code, press) { keys.up = press; });
}

PlayerControls.prototype = Object.create(UIElement.prototype);
