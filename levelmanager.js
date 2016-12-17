function LevelManager(ship, level) {
  var asteroids = 0;
  var level = 0;
  var score = 0;
  var points = [100, 50, 20]; // small, med, large points

  this.gameover = false;

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
        entitymanager.add(new Asteroid(undefined, undefined, 1, this));
      }
    }
  }

  this.getScore = function() {
    return score;
  }
}
