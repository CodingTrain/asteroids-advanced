function World(width, height) {
  this.width = width;
  this.height = height;

  var hud;
  var levelmanager;
  var entitymanager = new EntityManager();
  var endFrameTasks = [];

  this.gameover = false;

  this.addEndFrameTask = function(callback) {
    endFrameTasks.push(callback);
  }

  this.registerListener = function(entity, code, callback) {
    input.registerListener(entity.id, code, callback);
  }

  this.degisterListener = function(entity, code) {
    input.degisterListener(entity.id, code);
  }

  this.createEntity = function(entity, params) {
    var entity = new entity(world, params);
    entitymanager.add(entity);
    return entity;
  }

  this.initialize = function() {
    var ship = new Ship(this, { pos: createVector(width / 2, height / 2), r: 20, shieldDuration: 180 });
    entitymanager.add(ship);
    levelmanager = new LevelManager(this, ship, 0);
    hud = new Hud(this, levelmanager, ship);
  }

  this.update = function() {
    entitymanager.update();
    entitymanager.checkCollisions();
    levelmanager.update();
    for (var i = 0; i < endFrameTasks.length; i++) {
      endFrameTasks[i](this);
    }

    endFrameTasks.length = 0;
  }

  this.render = function() {
    background(0);
    entitymanager.render();
    hud.render();
  }
}
