function World(width, height) {
  this.width = width;
  this.height = height;

  var hud;
  var levelmanager;
  var entitymanager = new EntityManager();
  var endFrameTasks = [];

  this.gameover = false;

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
    var ship = new Ship(this, { pos: createVector(width / 2, height / 2), r: 20, shieldDuration: 180 });
    entitymanager.add(ship);
    levelmanager = new LevelManager(this, ship, 0);
    hud = new Hud(this, levelmanager, ship);
  }

  // Does all the update logic for this frame.
  this.update = function() {
    entitymanager.update();
    entitymanager.checkCollisions();
    levelmanager.update();
    for (var i = 0; i < endFrameTasks.length; i++) {
      endFrameTasks[i](this);
    }

    endFrameTasks.length = 0;
  }

  // Does all the rendering for this frame.
  this.render = function() {
    background(0);
    entitymanager.render();
    hud.render();
  }
}
