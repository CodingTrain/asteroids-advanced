function World(width, height, viewSize) {
  this.width = width;
  this.height = height;
  this.halfwidth = width / 2;
  this.halfheight = height / 2;
  this.seed = millis();
  this.time = 0;


  var hud;
  var levelmanager;
  var entitymanager = new EntityManager();
  var endFrameTasks = [];
  var players = [];

  // Returns the player playing on this machine.
  // TODO: Currently returns the first player as we only have one.
  this.getLocalPlayer = function() {
    return players[0];
  }

  // Returns the player with the specific id.
  this.getPlayer = function(id) {
    return players[id];
  }

  // Adds a function to a stack, will be called at the end of the frame once
  // all the other logic is completed.
  this.addEndFrameTask = function(callback) {
    endFrameTasks.push(callback);
  }

  // Adds a callback for the specified entity when the specified keycode is hit.
  this.registerKeyListener = function(entity, code, callback) {
    input.registerKeyListener(entity.id, code, callback);
  }

  // Removes all callbacks for the specified entity and keycode.
  this.degisterKeyListener = function(entity, code) {
    input.degisterKeyListener(entity.id, code);
  }

  // Adds a callback for the specified entity when the specified mouse button is hit.
  this.registerMouseListener = function(entity, button, callback) {
    input.registerMouseListener(entity.id, button, callback);
  }

  // Removes all callbacks for the specified entity and mouse button.
  this.degisterMouseListener = function(entity, button) {
    input.degisterMouseListener(entity.id, button);
  }

  // Creates a new entity from the given constructor and params object
  // and adds it to the world.
  this.createEntity = function(entity, params) {
    var entity = new entity(world, params);
    entitymanager.add(entity);
    return entity;
  }

  // Initializes the world.
  this.initialize = function() {
    players[0] = new Player(players.length, "SomeRandomName", this);
    entitymanager.add(players[0].getEntity());
    levelmanager = new LevelManager(this, players[0].getEntity(), 0);
    hud = new Hud(this, levelmanager, players[0].getEntity());
  }

  // Does all the update logic for this frame.
  this.update = function() {
    entitymanager.update();
    entitymanager.checkCollisions();
    levelmanager.update(players);
    for (var i = 0; i < endFrameTasks.length; i++) {
      endFrameTasks[i](this);
    }

    endFrameTasks.length = 0;
  }

  // Does all the rendering for this frame.
  this.render = function() {
    push();
    randomSeed(this.seed);
    push();
    for (var i = 0; i < 500; i++) {
      strokeWeight(0.1 * random(20) + 2);
      stroke(255 * pow(sin(random(0, PI) + this.time / 80), 2));
      var star = createVector(
        random(-this.halfwidth, this.halfwidth),
        random(-this.halfheight, this.halfheight)
      );
      var playerPos = this.getLocalPlayer().getEntity().pos;
      var relPos = p5.Vector.sub(star, playerPos);
      if (relPos.x > windowWidth / 2) star.x -= this.width;
      else if (relPos.x < -windowWidth / 2) star.x += this.width;
      if (relPos.y > windowHeight / 2) star.y -= this.height;
      else if (relPos.y < -windowHeight / 2) star.y += this.height;
      point(star.x, star.y);
    }
    //push();
    //stroke(255);
    //strokeWeight(3);
    //noFill();
    //rect(-world.halfwidth, -world.halfheight, world.width, world.height);
    //pop();
    pop();
    this.time++;
    randomSeed(millis());
    entitymanager.render();
    pop();
  }
}
