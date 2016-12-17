// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

var hud;
var entitymanager;
var levelmanager;
var laserSoundEffect;
var explosionSoundEffects = [];

function playSoundEffect(sound){
  if (!sound.isPlaying()){
    sound.play();
  }
}

function preload() {
  laserSoundEffect = loadSound('audio/pew.mp3');
  for (var i =0; i < 3; i++){
    explosionSoundEffects[i] = loadSound('audio/explosion-'+i+'.mp3');
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  entitymanager = new EntityManager();
  var ship = new Ship(createVector(width / 2, height / 2), 20, 180);
  entitymanager.add(ship);
  levelmanager = new LevelManager(ship, 0);
  hud = new Hud(levelmanager, ship);
}

function draw() {
  entitymanager.update();
  entitymanager.checkCollisions();
  levelmanager.update();

  // Render
  background(0);

  entitymanager.render();
  hud.render();
}
