function LevelManager(world, level) {
  var asteroids = 0;
  var level = 0;
  var score = 0;
  var scope = this;
  
  this.recordKill = function(asteroid, killerId) {
    asteroids--;
    console.log(killerId);
    if (killerId !== -1) {
      world.getPlayer(killerId).score += floor(asteroid.shape.area() / 100);
    }
  }

  this.recordAsteroidCreation = function() {
    asteroids++;
  }

  this.update = function(players) {
    if(asteroids === 0) {
      level++;
      for (var i = 0; i < players.length; i++) {
        if (players[i].dead) {
          return;
        }

        players[i].getEntity().regenShields();
      }

      for(var i = 0; i < level + 5; i++) {
        world.addEndFrameTask(function(world) { world.createEntity(Asteroid, { levelmanager: scope }); });
      }
    }
  }
}
