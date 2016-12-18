function LevelManager(world, ship, level) {
  var asteroids = 0;
  var level = 0;
  var score = 0;
  var points = [100, 50, 20]; // small, med, large points
  var scope = this;

  this.recordKill = function(asteroid) {
    score += points[asteroid.size];
    asteroids--;
  }

  this.recordAsteroidCreation = function() {
    asteroids++;
  }

  this.update = function() {
    if(asteroids === 0) {
      level++;
      ship.regenShields();
      for(var i = 0; i < level + 5; i++) {
        world.addEndFrameTask(function(world) { world.createEntity(Asteroid, { levelmanager: scope }); });
      }
    }
  }

  this.getScore = function() {
    return score;
  }
}
