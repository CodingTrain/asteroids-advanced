// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

var ship;
var hud;
var asteroids = [];
var lasers = [];
var laserSoundEffect;
var explosionSoundEffects = [];

function preload() {
  laserSoundEffect = loadSound('audio/pew.mp3');
  for (var i =0; i < 3; i++){
    explosionSoundEffects[i] = loadSound('audio/explosion-'+i+'.mp3');
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ship = new Ship(createVector(width / 2, height / 2), 20, 180);
  hud = new Hud();
}

function draw() {
  for(var i = 0; i < asteroids.length; i++) {
    if(ship.hits(asteroids[i])) {
      ship.destroy();
    }
    asteroids[i].update();
  }

  for(var i = lasers.length - 1; i >= 0; i--) {
    lasers[i].update();
    if(lasers[i].offscreen()) {
      lasers.splice(i, 1);

      continue;
    }

    for (var j = asteroids.length - 1; j >= 0; j--) {
      if (lasers[i].hits(asteroids[j])) {
        asteroids[j].playSoundEffect(explosionSoundEffects);
        hud.recordKill(asteroids[j]);
        asteroids = asteroids.concat(asteroids[j].breakup());
        asteroids.splice(j, 1);
        lasers.splice(i, 1);
        break;
      }
    }
  }

  hud.update();

  ship.update();

  // Render
  background(0);

  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].render();
  }

  for (var i = lasers.length - 1; i >= 0; i--) {
    lasers[i].render();
  }

  ship.render();
  hud.render();
}
