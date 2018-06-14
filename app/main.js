var capture;

//TODO:  video of dancer
//TODO:  create video playback element with timeline and pose timestamps highlighted
//TODO:  freeze frames of important poses
//TODO:  posenet initialization
//TODO:  run posenet on important poses
//TODO:  create array of said pose data
//TODO:  attach posenet to capture video
//TODO:  RMS difference between video feed @time intervals and freeze frames
//TODO:  color key for success and failure at each timeline node
//TODO:  in server.js summon a dominos pizza upon total success!
//TODO:  block future success so the app doesn't go bankrupt 😅

function setup() {
  createCanvas(600, 480);
  capture = createCapture(VIDEO);
  capture.size(600, 480);
  console.log(tf);
  console.log(posenet);
}

function draw() {
  background(255);
  image(capture, 0, 0, 600, 480);
}

