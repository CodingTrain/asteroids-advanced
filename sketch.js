// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

var laserSoundEffect;
var explosionSoundEffects = [];
var world;

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
  world = new World(windowWidth, windowHeight);
  world.initialize();
}

function draw() {
  world.update();
  world.render();
}
