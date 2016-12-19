// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM


var laserSoundEffect = [];
var explosionSoundEffects = [];
var world;
var uimanager;
var localplayerentity;

function playSoundEffect(sound){
  if (!sound.isPlaying()){
    sound.play();
  }
}

function preload() {
  for (var i =0; i < 3; i++){
    laserSoundEffect[i] = loadSound('audio/pew-'+i+'.mp3');
  }
  for (var i =0; i < 3; i++){
    explosionSoundEffects[i] = loadSound('audio/explosion-'+i+'.mp3');
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world = new World(2000, 2000, { left: -640, right: 640, bottom: -360, top: 360, near: 0, far: 500 });
  uimanager = new UIManager(world, { left: 160, right: 160, bottom: 90, top: 90, near: 0, far: 500 });
  world.initialize();

  localplayerentity = world.getLocalPlayer().getEntity();
  uimanager.create(Hud);
  uimanager.create(PlayerControls);
}

function draw() {
  world.update();
  uimanager.update();

  world.render();
  uimanager.render();
}
