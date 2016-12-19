function World(width, height, viewSize) {
  this.width = width;
  this.height = height;
  this.halfwidth = width / 2;
  this.halfheight = height / 2;


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

  // Adds a callback for the specified entity when the specified code is hit.
  this.registerListener = function(entity, code, callback) {
    input.registerListener(entity.id, code, callback);
  }

  // Removes all callbacks for the specified entity and code.
  this.degisterListener = function(entity, code) {
    input.degisterListener(entity.id, code);
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
    background(0);
    entitymanager.render();
    pop();
  }
}
