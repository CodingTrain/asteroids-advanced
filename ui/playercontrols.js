function PlayerControls(id) {
  UIElement.call(this, id, {
    pos: createVector(0, 0)
  });
  var keys = {
    right: false,
    left: false,
    up: false,
    down: false,
    f: false,
    space: false,
    spacerepeat: false,
    leftmouse: false,
    leftmouserepeat: false
  };

  this.update = function(world) {
    world.getLocalPlayer().getEntity().setInputs(
      createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2),
      keys.up,
      keys.down,
      keys.left,
      keys.right,
      keys.f,
      keys.space || keys.spacerepeat || keys.leftmouse || keys.leftmouserepeat
    );
    keys.space = false;
    keys.leftmouse = false;
    keys.f = false;
  }

  this.render = function(world) {
    push();
    textSize(32);
    textAlign(LEFT);
    fill(255);
    if (world.getLocalPlayer().getEntity().velMu > 0) {
      text("Stabilizers ON", 10, windowHeight - 10);
    } else {
      text("Stabilizers OFF", 10, windowHeight - 10);
    }
  }

  var scope = this;
  world.registerKeyListener(id, " ".charCodeAt(0), function(char, code, press) {
    keys.spacerepeat = press;
    if (press) {
      keys.space = true;
    }
  });
  world.registerKeyListener(id, "F".charCodeAt(0), function(char, code, press) {
    keys.f = press;
  });
  world.registerKeyListener(id, "D".charCodeAt(0), function(char, code, press) {
    keys.right = press;
  });
  world.registerKeyListener(id, "A".charCodeAt(0), function(char, code, press) {
    keys.left = press;
  });
  world.registerKeyListener(id, "W".charCodeAt(0), function(char, code, press) {
    keys.up = press;
  });
  world.registerKeyListener(id, "S".charCodeAt(0), function(char, code, press) {
    keys.down = press;
  });
  world.registerMouseListener(id, LEFT, function(button, press) {
    keys.leftmouserepeat = press;
    if (press) {
      keys.leftmouse = true;
    }
  });
}

PlayerControls.prototype = Object.create(UIElement.prototype);
