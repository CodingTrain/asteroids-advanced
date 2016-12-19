function Player(id, name, world) {
  this.id = id;
  var ship = new Ship(world, { pos: createVector(0, 0), r: 20, shieldDuration: 180 });
  ship.owner = id;
  this.score = 0;
  this.dead = false;

  this.getEntity = function() {
    return ship;
  }
}
