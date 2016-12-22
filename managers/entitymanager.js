function EntityManager() {
  var entities = {};
  var nextId = 0;

  this.add = function(entity) {
    if (entity.id === -1) {
      entity.registerId(nextId++);
    }

    entities[entity.id] = entity;
  }

  this.update = function() {
    for (var index in entities) {
      if (entities[index].update()) {
        // Deletes the index property from the entities object.
        delete entities[index];
      }
    }
  }

  this.render = function() {
    for (var index in entities) {
      var entity = entities[index];
      var playerPos = world.getLocalPlayer().getEntity().pos;
      var relPos = p5.Vector.sub(entity.pos, playerPos);

      var trans = createVector(0, 0);
      if (relPos.x - entity.r > windowWidth / 2) trans.x -= world.width;
      else if (relPos.x + entity.r < -windowWidth / 2) trans.x += world.width;
      if (relPos.y - entity.r > windowHeight / 2) trans.y -= world.height;
      else if (relPos.y + entity.r < -windowHeight / 2) trans.y += world.height;

      var drawPos = p5.Vector.add(trans, relPos);
      var shouldRender = !(
        (drawPos.x - entity.r >  windowWidth / 2) ||
        (drawPos.x + entity.r < -windowWidth / 2) ||
        (drawPos.y - entity.r >  windowHeight / 2) ||
        (drawPos.y + entity.r < -windowHeight / 2)
      );

      push();
      if (shouldRender) {
        translate(trans.x, trans.y);
        entity.render();
      }
      pop();
    }
  }

  this.checkCollisions = function() {
    var x = 1;
    for (var i in entities) {
      var y = x;
      for (var j in entities) {
        // Skip all the collisions we have already done.
        if (y !== 0) {
          y--;
          continue;
        }

        if (entities[j].collides(entities[i]) || entities[i].collides(entities[j])) {
          entities[i].collision(entities[j]);
          entities[j].collision(entities[i]);
        }
      }
      x++;
    }
  }
}
